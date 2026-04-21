<?php
/**
 * BloodFinder BD — Dashboard Stats API
 * Endpoints:
 *   GET ?action=stats        (public overview)
 *   GET ?action=emergency    (public, emergency requests)
 *   GET ?action=ticker       (public, for homepage ticker)
 */
require_once __DIR__ . '/config.php';

 $action = $_GET['action'] ?? '';

switch ($action) {

    // ── OVERVIEW STATS ─────────────────────────────────────
    case 'stats':
        $db = getDB();

        $totalDonors  = $db->query("SELECT COUNT(*) FROM users WHERE user_type = 'donor' AND status = 'active'")->fetchColumn();
        $activeReqs   = $db->query("SELECT COUNT(*) FROM blood_requests WHERE status = 'Active'")->fetchColumn();
        $hospitals    = $db->query("SELECT COUNT(*) FROM hospitals WHERE status = 1")->fetchColumn();
        $livesSaved   = $db->query("SELECT COUNT(*) FROM blood_requests WHERE status = 'Fulfilled'")->fetchColumn();
        $totalDonations = $db->query("SELECT COALESCE(SUM(units), 0) FROM donations")->fetchColumn();

        jsonResponse(true, 'Dashboard stats fetched.', [
            'total_donors'    => intval($totalDonors),
            'active_requests' => intval($activeReqs),
            'hospitals'       => intval($hospitals),
            'lives_saved'     => intval($livesSaved),
            'total_donations' => intval($totalDonations)
        ]);
        break;

    // ── EMERGENCY REQUESTS ─────────────────────────────────
    case 'emergency':
        $db = getDB();

        $stmt = $db->query("
            SELECT * FROM blood_requests
            WHERE status = 'Active' AND urgency IN ('Emergency', 'Urgent')
            ORDER BY
                CASE urgency WHEN 'Emergency' THEN 1 ELSE 2 END,
                created_at DESC
            LIMIT 10
        ");
        $emergencies = $stmt->fetchAll();

        jsonResponse(true, 'Emergency requests fetched.', ['emergencies' => $emergencies]);
        break;

    // ── HOMEPAGE TICKER ────────────────────────────────────
    case 'ticker':
        $db = getDB();

        $stmt = $db->query("
            SELECT patient_name, blood_group, urgency, district, hospital_name
            FROM blood_requests
            WHERE status = 'Active'
            ORDER BY
                CASE urgency WHEN 'Emergency' THEN 1 WHEN 'Urgent' THEN 2 ELSE 3 END,
                created_at DESC
            LIMIT 15
        ");
        $items = $stmt->fetchAll();

        $tickerText = '';
        $separator = '  ★  ';
        foreach ($items as $item) {
            $urgencyIcon = $item['urgency'] === 'Emergency' ? '🔴' : ($item['urgency'] === 'Urgent' ? '🟡' : '🟢');
            $tickerText .= "{$urgencyIcon} {$item['patient_name']} needs {$item['blood_group']} at {$item['hospital_name']}, {$item['district']}";
            $tickerText .= $separator;
        }

        if (empty($tickerText)) {
            $tickerText = 'No active requests at this time. Be the first to help!';
        }

        jsonResponse(true, 'Ticker fetched.', ['ticker' => $tickerText]);
        break;

    // ── RECENT USERS (Admin) ───────────────────────────────
    case 'recent-users':
        $session = requireAdmin();
        $db = getDB();

        $stmt = $db->query("
            SELECT id, name, email, blood_group, user_type, district, status, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT 8
        ");
        $users = $stmt->fetchAll();

        jsonResponse(true, 'Recent users fetched.', ['users' => $users]);
        break;

    // ── RECENT REQUESTS (Admin) ────────────────────────────
    case 'recent-requests':
        $session = requireAdmin();
        $db = getDB();

        $stmt = $db->query("
            SELECT * FROM blood_requests
            ORDER BY created_at DESC
            LIMIT 8
        ");
        $requests = $stmt->fetchAll();

        jsonResponse(true, 'Recent requests fetched.', ['requests' => $requests]);
        break;

    default:
        jsonResponse(false, 'Invalid action. Use: stats, emergency, ticker, recent-users, recent-requests');
}