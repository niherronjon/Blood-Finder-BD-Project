<?php
/**
 * BloodFinder BD — Donors Search API
 * Endpoints:
 *   GET ?action=search     (public, with filters)
 *   GET ?action=leaderboard (public)
 */
require_once __DIR__ . '/config.php';

 $action = $_GET['action'] ?? '';

switch ($action) {

    // ── SEARCH DONORS ──────────────────────────────────────
    case 'search':
        $db = getDB();
        [$page, $perPage, $offset] = getPaginationParams();

        $bloodGroup   = sanitize($_GET['blood_group'] ?? '');
        $district     = sanitize($_GET['district'] ?? '');
        $available    = $_GET['available'] ?? '';
        $keyword      = sanitize($_GET['keyword'] ?? '');

        $where = ["u.user_type = 'donor'", "u.status = 'active'"];
        $params = [];

        if ($bloodGroup && validateBloodGroup($bloodGroup)) {
            $where[] = "u.blood_group = ?";
            $params[] = $bloodGroup;
        }
        if ($district && validateDistrict($district)) {
            $where[] = "u.district = ?";
            $params[] = $district;
        }
        if ($available === '1') {
            $where[] = "u.availability = 1";
        }
        if ($keyword) {
            $where[] = "(u.name LIKE ? OR u.phone LIKE ? OR u.upazila LIKE ?)";
            $kw = "%$keyword%";
            $params[] = $kw;
            $params[] = $kw;
            $params[] = $kw;
        }

        $whereClause = implode(' AND ', $where);

        // Count
        $countStmt = $db->prepare("SELECT COUNT(*) as total FROM users u WHERE $whereClause");
        $countStmt->execute($params);
        $total = $countStmt->fetch()['total'];

        // Fetch
        $stmt = $db->prepare("
            SELECT u.id, u.name, u.phone, u.blood_group, u.district, u.upazila,
                   u.availability, u.donation_count, u.last_donation, u.created_at
            FROM users u
            WHERE $whereClause
            ORDER BY u.availability DESC, u.donation_count DESC
            LIMIT $perPage OFFSET $offset
        ");
        $stmt->execute($params);
        $donors = $stmt->fetchAll();

        jsonResponse(true, 'Donors fetched.', [
            'donors'    => $donors,
            'pagination' => paginate($total, $page, $perPage)
        ]);
        break;

    // ── QUICK SEARCH (for homepage) ────────────────────────
    case 'quick':
        $db = getDB();
        $bloodGroup = sanitize($_GET['blood_group'] ?? '');
        $district   = sanitize($_GET['district'] ?? '');

        if (!$bloodGroup || !$district) {
            jsonResponse(false, 'Blood group and district are required.');
        }
        if (!validateBloodGroup($bloodGroup) || !validateDistrict($district)) {
            jsonResponse(false, 'Invalid blood group or district.');
        }

        $stmt = $db->prepare("
            SELECT id, name, phone, blood_group, district, upazila, availability, donation_count
            FROM users
            WHERE user_type = 'donor'
              AND blood_group = ?
              AND district = ?
              AND availability = 1
              AND status = 'active'
            ORDER BY donation_count DESC
            LIMIT 5
        ");
        $stmt->execute([$bloodGroup, $district]);
        $donors = $stmt->fetchAll();

        jsonResponse(true, count($donors) . ' donor(s) found.', ['donors' => $donors]);
        break;

    // ── LEADERBOARD ────────────────────────────────────────
    case 'leaderboard':
        $db = getDB();

        $stmt = $db->prepare("
            SELECT id, name, blood_group, district, donation_count
            FROM users
            WHERE user_type = 'donor' AND status = 'active' AND donation_count > 0
            ORDER BY donation_count DESC
            LIMIT 10
        ");
        $stmt->execute();
        $leaders = $stmt->fetchAll();

        jsonResponse(true, 'Leaderboard fetched.', ['leaders' => $leaders]);
        break;

    // ── DONOR COUNT ────────────────────────────────────────
    case 'count':
        $db = getDB();
        $total = $db->query("SELECT COUNT(*) FROM users WHERE user_type = 'donor' AND status = 'active'")->fetchColumn();
        jsonResponse(true, 'Count fetched.', ['count' => intval($total)]);
        break;

    default:
        jsonResponse(false, 'Invalid action. Use: search, quick, leaderboard, count');
}