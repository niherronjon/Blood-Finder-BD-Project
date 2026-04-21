<?php
/**
 * BloodFinder BD — Notifications API
 * Endpoints:
 *   GET  ?action=list
 *   POST ?action=mark-read
 *   POST ?action=mark-all-read
 *   GET  ?action=unread-count
 */
require_once __DIR__ . '/config.php';

 $action = $_GET['action'] ?? '';

switch ($action) {

    // ── LIST NOTIFICATIONS ─────────────────────────────────
    case 'list':
        $session = requireAuth();
        $db = getDB();

        $stmt = $db->prepare("
            SELECT * FROM notifications
            WHERE user_id = ?
            ORDER BY is_read ASC, created_at DESC
            LIMIT 30
        ");
        $stmt->execute([$_SESSION['user_id']]);
        $notifications = $stmt->fetchAll();

        jsonResponse(true, 'Notifications fetched.', ['notifications' => $notifications]);
        break;

    // ── MARK SINGLE READ ───────────────────────────────────
    case 'mark-read':
        $session = requireAuth();
        $input = jsonInput();
        $db = getDB();

        $id = intval($input['id'] ?? 0);
        if (!$id) jsonResponse(false, 'Notification ID required.');

        $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $_SESSION['user_id']]);

        jsonResponse(true, 'Notification marked as read.');
        break;

    // ── MARK ALL READ ──────────────────────────────────────
    case 'mark-all-read':
        $session = requireAuth();
        $db = getDB();

        $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0");
        $stmt->execute([$_SESSION['user_id']]);

        jsonResponse(true, 'All notifications marked as read.');
        break;

    // ── UNREAD COUNT ───────────────────────────────────────
    case 'unread-count':
        if (!isLoggedIn()) {
            jsonResponse(true, 'Count fetched.', ['count' => 0]);
        }
        $db = getDB();
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0");
        $stmt->execute([$_SESSION['user_id']]);
        $count = $stmt->fetch()['count'];

        jsonResponse(true, 'Count fetched.', ['count' => intval($count)]);
        break;

    default:
        jsonResponse(false, 'Invalid action. Use: list, mark-read, mark-all-read, unread-count');
}