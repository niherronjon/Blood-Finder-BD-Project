<?php
/**
 * BloodFinder BD — Profile API
 * Endpoints:
 *   GET  ?action=get
 *   POST ?action=update
 *   POST ?action=toggle-availability
 */
require_once __DIR__ . '/config.php';

 $action = $_GET['action'] ?? '';

switch ($action) {

    // ── GET PROFILE ────────────────────────────────────────
    case 'get':
        $session = requireAuth();
        $db = getDB();

        $stmt = $db->prepare("
            SELECT id, name, email, phone, blood_group, user_type, district, upazila,
                   address, weight, last_donation, availability, donation_count, status, created_at
            FROM users WHERE id = ?
        ");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();

        if (!$user) {
            jsonResponse(false, 'User not found.');
        }

        jsonResponse(true, 'Profile fetched.', ['user' => $user]);
        break;

    // ── UPDATE PROFILE ─────────────────────────────────────
    case 'update':
        $session = requireAuth();
        $input = jsonInput();
        $db = getDB();

        $name     = sanitize($input['name'] ?? '');
        $phone    = sanitize($input['phone'] ?? '');
        $district = sanitize($input['district'] ?? '');
        $upazila  = sanitize($input['upazila'] ?? '');
        $address  = sanitize($input['address'] ?? '');
        $weight   = $input['weight'] ? floatval($input['weight']) : null;
        $lastDon  = $input['last_donation'] ?: null;

        if (!$name) {
            jsonResponse(false, 'Name is required.');
        }
        if ($phone && !validatePhone($phone)) {
            jsonResponse(false, 'Invalid phone number.');
        }
        if ($weight !== null && ($weight < 30 || $weight > 200)) {
            jsonResponse(false, 'Weight must be between 30-200 kg.');
        }

        $stmt = $db->prepare("
            UPDATE users SET name=?, phone=?, district=?, upazila=?, address=?, weight=?, last_donation=?
            WHERE id = ?
        ");
        $stmt->execute([$name, $phone, $district, $upazila, $address, $weight, $lastDon, $_SESSION['user_id']]);

        // Update session name
        $_SESSION['user_name'] = $name;

        jsonResponse(true, 'Profile updated successfully.');
        break;

    // ── TOGGLE AVAILABILITY ────────────────────────────────
    case 'toggle-availability':
        $session = requireAuth();
        $input = jsonInput();
        $db = getDB();

        $available = intval($input['available'] ?? 0);

        $stmt = $db->prepare("UPDATE users SET availability = ? WHERE id = ?");
        $stmt->execute([$available, $_SESSION['user_id']]);

        jsonResponse(true, $available ? 'You are now available for donation.' : 'You are marked as unavailable.');
        break;

    default:
        jsonResponse(false, 'Invalid action. Use: get, update, toggle-availability');
}