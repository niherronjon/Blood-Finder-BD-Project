<?php
/**
 * BloodFinder BD — Admin API
 * Endpoints:
 *   GET  ?action=users          (list with filters)
 *   POST ?action=ban-user
 *   POST ?action=unban-user
 *   POST ?action=delete-user
 *   GET  ?action=requests       (list with filters)
 *   GET  ?action=admin-stats
 *   GET  ?action=analytics
 */
require_once __DIR__ . '/config.php';

 $action = $_GET['action'] ?? '';

switch ($action) {

    // ── LIST USERS ─────────────────────────────────────────
    case 'users':
        $session = requireAdmin();
        $db = getDB();
        [$page, $perPage, $offset] = getPaginationParams();

        $userType = sanitize($_GET['user_type'] ?? '');
        $keyword  = sanitize($_GET['keyword'] ?? '');
        $status   = sanitize($_GET['status'] ?? '');

        $where = ["1=1"];
        $params = [];

        if ($userType && in_array($userType, ['donor','requester','hospital','admin'])) {
            $where[] = "u.user_type = ?";
            $params[] = $userType;
        }
        if ($status && in_array($status, ['active','pending','banned'])) {
            $where[] = "u.status = ?";
            $params[] = $status;
        }
        if ($keyword) {
            $where[] = "(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
            $kw = "%$keyword%";
            $params[] = $kw;
            $params[] = $kw;
            $params[] = $kw;
        }

        $whereClause = implode(' AND ', $where);

        $countStmt = $db->prepare("SELECT COUNT(*) as total FROM users u WHERE $whereClause");
        $countStmt->execute($params);
        $total = $countStmt->fetch()['total'];

        $stmt = $db->prepare("
            SELECT u.id, u.name, u.email, u.phone, u.blood_group, u.user_type, u.district,
                   u.upazila, u.availability, u.donation_count, u.status, u.created_at
            FROM users u
            WHERE $whereClause
            ORDER BY u.created_at DESC
            LIMIT $perPage OFFSET $offset
        ");
        $stmt->execute($params);
        $users = $stmt->fetchAll();

        jsonResponse(true, 'Users fetched.', [
            'users'      => $users,
            'pagination'  => paginate($total, $page, $perPage)
        ]);
        break;

    // ── BAN USER ───────────────────────────────────────────
    case 'ban-user':
        $session = requireAdmin();
        $input = jsonInput();
        $db = getDB();

        $id = intval($input['id'] ?? 0);
        if (!$id) jsonResponse(false, 'User ID required.');
        if ($id === $session['user_id']) jsonResponse(false, 'Cannot ban yourself.');

        $stmt = $db->prepare("UPDATE users SET status = 'banned' WHERE id = ? AND user_type != 'admin'");
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(false, 'User not found or cannot be banned.');
        }

        logAdminAction($session['user_id'], 'ban_user', "Banned user #$id");
        jsonResponse(true, 'User has been banned.');
        break;

    // ── UNBAN USER ─────────────────────────────────────────
    case 'unban-user':
        $session = requireAdmin();
        $input = jsonInput();
        $db = getDB();

        $id = intval($input['id'] ?? 0);
        if (!$id) jsonResponse(false, 'User ID required.');

        $stmt = $db->prepare("UPDATE users SET status = 'active' WHERE id = ?");
        $stmt->execute([$id]);

        logAdminAction($session['user_id'], 'unban_user', "Unbanned user #$id");
        jsonResponse(true, 'User has been unbanned.');
        break;

    // ── DELETE USER ────────────────────────────────────────
    case 'delete-user':
        $session = requireAdmin();
        $input = jsonInput();
        $db = getDB();

        $id = intval($input['id'] ?? 0);
        if (!$id) jsonResponse(false, 'User ID required.');
        if ($id === $session['user_id']) jsonResponse(false, 'Cannot delete yourself.');

        // Check not admin
        $check = $db->prepare("SELECT user_type FROM users WHERE id = ?");
        $check->execute([$id]);
        $user = $check->fetch();
        if (!$user) jsonResponse(false, 'User not found.');
        if ($user['user_type'] === 'admin') jsonResponse(false, 'Cannot delete admin users.');

        $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);

        logAdminAction($session['user_id'], 'delete_user', "Deleted user #$id ({$user['user_type']})");
        jsonResponse(true, 'User deleted permanently.');
        break;

    // ── ADMIN REQUESTS LIST ────────────────────────────────
    case 'requests':
        $session = requireAdmin();
        $db = getDB();
        [$page, $perPage, $offset] = getPaginationParams();

        $status     = sanitize($_GET['status'] ?? '');
        $bloodGroup = sanitize($_GET['blood_group'] ?? '');
        $urgency    = sanitize($_GET['urgency'] ?? '');

        $where = ["1=1"];
        $params = [];

        if ($status && in_array($status, ['Active','Fulfilled','Cancelled'])) {
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

        $whereClause = implode(' AND ', $where);

        $countStmt = $db->prepare("SELECT COUNT(*) as total FROM blood_requests r WHERE $whereClause");
        $countStmt->execute($params);
        $total = $countStmt->fetch()['total'];

        $stmt = $db->prepare("
            SELECT r.*, COALESCE(u.name, 'Guest') as requester_name
            FROM blood_requests r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE $whereClause
            ORDER BY r.created_at DESC
            LIMIT $perPage OFFSET $offset
        ");
        $stmt->execute($params);
        $requests = $stmt->fetchAll();

        jsonResponse(true, 'Requests fetched.', [
            'requests'   => $requests,
            'pagination' => paginate($total, $page, $perPage)
        ]);
        break;

    // ── ADMIN DASHBOARD STATS ──────────────────────────────
    case 'admin-stats':
        $session = requireAdmin();
        $db = getDB();

        $totalUsers    = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $totalDonors   = $db->query("SELECT COUNT(*) FROM users WHERE user_type = 'donor' AND status = 'active'")->fetchColumn();
        $activeReqs    = $db->query("SELECT COUNT(*) FROM blood_requests WHERE status = 'Active'")->fetchColumn();
        $fulfilledReqs = $db->query("SELECT COUNT(*) FROM blood_requests WHERE status = 'Fulfilled'")->fetchColumn();
        $totalReqs     = $db->query("SELECT COUNT(*) FROM blood_requests")->fetchColumn();
        $totalHospitals = $db->query("SELECT COUNT(*) FROM hospitals WHERE status = 1")->fetchColumn();
        $totalDonations = $db->query("SELECT COALESCE(SUM(units), 0) FROM donations")->fetchColumn();
        $bannedUsers   = $db->query("SELECT COUNT(*) FROM users WHERE status = 'banned'")->fetchColumn();

        jsonResponse(true, 'Admin stats fetched.', [
            'total_users'     => intval($totalUsers),
            'total_donors'    => intval($totalDonors),
            'active_requests' => intval($activeReqs),
            'fulfilled_requests' => intval($fulfilledReqs),
            'total_requests'  => intval($totalReqs),
            'total_hospitals' => intval($totalHospitals),
            'total_donations' => intval($totalDonations),
            'banned_users'    => intval($bannedUsers)
        ]);
        break;

    // ── ADMIN ANALYTICS ────────────────────────────────────
    case 'analytics':
        $session = requireAdmin();
        $db = getDB();

        // 1. Blood group distribution among donors.
        $bgStmt = $db->query("
            SELECT blood_group, COUNT(*) as count
            FROM users
            WHERE user_type = 'donor' AND status = 'active' AND blood_group IS NOT NULL
            GROUP BY blood_group
            ORDER BY count DESC
        ");
        $bloodGroups = $bgStmt->fetchAll();
        $bgLabels = array_column($bloodGroups, 'blood_group');
        $bgData   = array_column($bloodGroups, 'count');

        // 2. Monthly donations (reuse donations API logic)
        $monthStmt = $db->query("
            SELECT DATE_FORMAT(donation_date, '%Y-%m') as month, COUNT(*) as cnt
            FROM donations
            WHERE donation_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY month ORDER BY month
        ");
        $monthlyRaw = $monthStmt->fetchAll();
        $monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        $mLabels = [];
        $mData   = [];
        for ($i = 11; $i >= 0; $i--) {
            $m = date('Y-m', strtotime("-$i months"));
            $mLabels[] = $monthNames[intval(date('m', strtotime($m))) - 1];
            $mData[] = 0;
        }
        foreach ($monthlyRaw as $row) {
            $idx = array_search($row['month'], array_map(fn($j) => date('Y-m', strtotime("-" . (11 - $j) . " months")), range(0, 11)));
            if ($idx !== false) $mData[$idx] = intval($row['cnt']);
        }

        // 3. Urgency breakdown
        $urgStmt = $db->query("
            SELECT urgency, COUNT(*) as count
            FROM blood_requests
            GROUP BY urgency
        ");
        $urgency = $urgStmt->fetchAll();
        $urgLabels = array_column($urgency, 'urgency');
        $urgData   = array_column($urgency, 'count');

        // 4. Top districts by donors
        $distStmt = $db->query("
            SELECT district, COUNT(*) as count
            FROM users
            WHERE user_type = 'donor' AND status = 'active' AND district IS NOT NULL
            GROUP BY district
            ORDER BY count DESC
            LIMIT 8
        ");
        $districts = $distStmt->fetchAll();
        $distLabels = array_column($districts, 'district');
        $distData   = array_column($districts, 'count');

        jsonResponse(true, 'Analytics fetched.', [
            'blood_groups' => ['labels' => $bgLabels, 'data' => $bgData],
            'monthly'      => ['labels' => $mLabels, 'data' => $mData],
            'urgency'      => ['labels' => $urgLabels, 'data' => $urgData],
            'districts'    => ['labels' => $distLabels, 'data' => $distData]
        ]);
        break;

    // ── ADMIN HOSPITALS ────────────────────────────────────
    case 'hospitals':
        $session = requireAdmin();
        $db = getDB();

        $stmt = $db->query("SELECT * FROM hospitals ORDER BY district, name");
        $hospitals = $stmt->fetchAll();

        jsonResponse(true, 'Hospitals fetched.', ['hospitals' => $hospitals]);
        break;

    default:
        jsonResponse(false, 'Invalid action.');
}
