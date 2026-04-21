<?php
/**
 * BloodFinder BD — Blood Requests API
 * Endpoints:
 *   POST ?action=create        (any logged-in user)
 *   GET  ?action=list          (public, with filters)
 *   PUT  ?action=update-status (admin only)
 *   GET  ?action=stats         (public)
 */
require_once __DIR__ . '/config.php';

 $action = $_GET['action'] ?? '';

switch ($action) {

    // ── CREATE REQUEST ─────────────────────────────────────
    case 'create':
        $session = requireAuth();
        $input = jsonInput();
        $db = getDB();

        $patientName  = sanitize($input['patientName'] ?? '');
        $bloodGroup   = sanitize($input['bloodGroup'] ?? '');
        $units        = max(1, intval($input['units'] ?? 1));
        $urgency      = sanitize($input['urgency'] ?? '');
        $hospital     = sanitize($input['hospital'] ?? '');
        $district     = sanitize($input['district'] ?? '');
        $requiredDate = $input['requiredDate'] ?? null;
        $contactPerson = sanitize($input['contactPerson'] ?? '');
        $contactPhone = sanitize($input['contactPhone'] ?? '');
        $notes        = sanitize($input['notes'] ?? '');

        // Validate
        if (!$patientName || !$bloodGroup || !$urgency || !$hospital || !$district || !$contactPerson || !$contactPhone) {
            jsonResponse(false, 'All required fields must be filled.');
        }
        if (!validateBloodGroup($bloodGroup)) {
            jsonResponse(false, 'Invalid blood group.');
        }
        if (!validateUrgency($urgency)) {
            jsonResponse(false, 'Invalid urgency level.');
        }
        if (!validateDistrict($district)) {
            jsonResponse(false, 'Invalid district.');
        }
        if (!validatePhone($contactPhone)) {
            jsonResponse(false, 'Invalid contact phone. Use: 01XXXXXXXXX');
        }
        if ($units < 1 || $units > 20) {
            jsonResponse(false, 'Units must be between 1-20.');
        }

        $stmt = $db->prepare("
            INSERT INTO blood_requests (user_id, patient_name, blood_group, units_needed, urgency, hospital_name, district, required_date, contact_person, contact_phone, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $_SESSION['user_id'], $patientName, $bloodGroup, $units,
            $urgency, $hospital, $district, $requiredDate,
            $contactPerson, $contactPhone, $notes
        ]);

        $requestId = $db->lastInsertId();

        // Notify matching donors
        notifyMatchingDonors($bloodGroup, $district, $patientName, $hospital);

        jsonResponse(true, 'Blood request submitted successfully! Matching donors have been notified.', [
            'request_id' => $requestId
        ]);
        break;

    // ── LIST REQUESTS ──────────────────────────────────────
    case 'list':
        $db = getDB();
        [$page, $perPage, $offset] = getPaginationParams();

        $status     = sanitize($_GET['status'] ?? '');
        $bloodGroup = sanitize($_GET['blood_group'] ?? '');
        $urgency    = sanitize($_GET['urgency'] ?? '');
        $district   = sanitize($_GET['district'] ?? '');

        $where = ["1=1"];
        $params = [];

        if ($status) {
            $where[] = "r.status = ?";
            $params[] = $status;
        }
        if ($bloodGroup && validateBloodGroup($bloodGroup)) {
            $where[] = "r.blood_group = ?";
            $params[] = $bloodGroup;
        }
        if ($urgency && validateUrgency($urgency)) {
            $where[] = "r.urgency = ?";
            $params[] = $urgency;
        }
        if ($district && validateDistrict($district)) {
            $where[] = "r.district = ?";
            $params[] = $district;
        }

        $whereClause = implode(' AND ', $where);

        // Count
        $countStmt = $db->prepare("SELECT COUNT(*) as total FROM blood_requests r WHERE $whereClause");
        $countStmt->execute($params);
        $total = $countStmt->fetch()['total'];

        // Fetch
        $stmt = $db->prepare("
            SELECT r.*,
                   COALESCE(u.name, 'Guest') as requester_name
            FROM blood_requests r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE $whereClause
            ORDER BY
                CASE r.urgency WHEN 'Emergency' THEN 1 WHEN 'Urgent' THEN 2 ELSE 3 END,
                r.created_at DESC
            LIMIT $perPage OFFSET $offset
        ");
        $stmt->execute($params);
        $requests = $stmt->fetchAll();

        jsonResponse(true, 'Requests fetched.', [
            'requests' => $requests,
            'pagination' => paginate($total, $page, $perPage)
        ]);
        break;

    // ── UPDATE STATUS (Admin) ──────────────────────────────
    case 'update-status':
        $session = requireAdmin();
        $input = jsonInput();
        $db = getDB();

        $id     = intval($input['id'] ?? 0);
        $status = sanitize($input['status'] ?? '');

        if (!$id || !in_array($status, ['Active','Fulfilled','Cancelled'])) {
            jsonResponse(false, 'Invalid request ID or status.');
        }

        $stmt = $db->prepare("UPDATE blood_requests SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(false, 'Request not found.');
        }

        logAdminAction($session['user_id'], 'update_request_status', "Request #$id set to $status");
        jsonResponse(true, "Request status updated to '$status'.");
        break;

    // ── REQUEST STATS ──────────────────────────────────────
    case 'stats':
        $db = getDB();

        $active    = $db->query("SELECT COUNT(*) FROM blood_requests WHERE status = 'Active'")->fetchColumn();
        $emergency = $db->query("SELECT COUNT(*) FROM blood_requests WHERE status = 'Active' AND urgency = 'Emergency'")->fetchColumn();
        $fulfilled = $db->query("SELECT COUNT(*) FROM blood_requests WHERE status = 'Fulfilled'")->fetchColumn();
        $total     = $db->query("SELECT COUNT(*) FROM blood_requests")->fetchColumn();

        jsonResponse(true, 'Stats fetched.', [
            'active'    => intval($active),
            'emergency' => intval($emergency),
            'fulfilled' => intval($fulfilled),
            'total'     => intval($total)
        ]);
        break;

    // ── SINGLE REQUEST ─────────────────────────────────────
    case 'get':
        $id = intval($_GET['id'] ?? 0);
        if (!$id) jsonResponse(false, 'Request ID required.');

        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM blood_requests WHERE id = ?");
        $stmt->execute([$id]);
        $request = $stmt->fetch();

        if (!$request) jsonResponse(false, 'Request not found.');
        jsonResponse(true, 'Request fetched.', ['request' => $request]);
        break;

    default:
        jsonResponse(false, 'Invalid action. Use: create, list, update-status, stats, get');
}