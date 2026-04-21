<?php
/**
 * BloodFinder BD — Donations API
 * Endpoints:
 *   POST ?action=create    (logged-in donor)
 *   GET  ?action=history   (logged-in user)
 *   GET  ?action=stats     (public/analytics)
 */
require_once __DIR__ . '/config.php';

 $action = $_GET['action'] ?? '';

switch ($action) {

    // ── CREATE DONATION RECORD ─────────────────────────────
    case 'create':
        $session = requireAuth();
        $input = jsonInput();
        $db = getDB();

        $hospital = sanitize($input['hospital_name'] ?? '');
        $units    = max(1, intval($input['units'] ?? 1));
        $date     = $input['donation_date'] ?? date('Y-m-d');
        $notes    = sanitize($input['notes'] ?? '');

        if (!$hospital) {
            jsonResponse(false, 'Hospital name is required.');
        }
        if ($units < 1 || $units > 5) {
            jsonResponse(false, 'Units must be between 1-5.');
        }

        $stmt = $db->prepare("
            INSERT INTO donations (user_id, hospital_name, units, donation_date, notes)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$_SESSION['user_id'], $hospital, $units, $date, $notes]);

        // Update user donation count
        $db->prepare("UPDATE users SET donation_count = donation_count + ?, last_donation = ? WHERE id = ?")
           ->execute([$units, $date, $_SESSION['user_id']]);

        jsonResponse(true, 'Donation record saved successfully. Thank you for saving lives!');
        break;

    // ── DONATION HISTORY ───────────────────────────────────
    case 'history':
        $session = requireAuth();
        $db = getDB();

        $stmt = $db->prepare("
            SELECT * FROM donations
            WHERE user_id = ?
            ORDER BY donation_date DESC, created_at DESC
            LIMIT 50
        ");
        $stmt->execute([$_SESSION['user_id']]);
        $donations = $stmt->fetchAll();

        jsonResponse(true, 'Donation history fetched.', ['donations' => $donations]);
        break;

    // ── DONATION STATS (for analytics) ─────────────────────
    case 'stats':
        $db = getDB();

        // Monthly donations for last 12 months
        $stmt = $db->query("
            SELECT
                DATE_FORMAT(donation_date, '%Y-%m') as month,
                SUM(units) as total_units,
                COUNT(*) as total_donations
            FROM donations
            WHERE donation_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY month
            ORDER BY month
        ");
        $monthly = $stmt->fetchAll();

        // Format for chart
        $labels = [];
        $data = [];
        $monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        // Initialize all 12 months
        for ($i = 11; $i >= 0; $i--) {
            $m = date('Y-m', strtotime("-$i months"));
            $labels[] = $monthNames[intval(date('m', strtotime($m))) - 1] . ' ' . date('y', strtotime($m));
            $data[] = 0;
        }

        foreach ($monthly as $row) {
            $idx = array_search($row['month'], array_map(fn($i) => date('Y-m', strtotime("-" . (11 - $i) . " months")), range(0, 11)));
            if ($idx !== false) {
                $data[$idx] = intval($row['total_donations']);
            }
        }

        jsonResponse(true, 'Donation stats fetched.', [
            'monthly' => [
                'labels' => $labels,
                'data'   => $data
            ]
        ]);
        break;

    default:
        jsonResponse(false, 'Invalid action. Use: create, history, stats');
}