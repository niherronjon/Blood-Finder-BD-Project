<?php
/**
 * BloodFinder BD — Hospitals API
 * Endpoints:
 *   GET ?action=list       (public)
 *   GET ?action=search     (public, with filters)
 *   POST ?action=create    (admin)
 *   PUT ?action=update     (admin)
 *   DELETE ?action=delete  (admin)
 */
require_once __DIR__ . '/config.php';

 $action = $_GET['action'] ?? '';

switch ($action) {

    // ── LIST ALL ───────────────────────────────────────────
    case 'list':
        $db = getDB();
        $stmt = $db->query("
            SELECT * FROM hospitals
            WHERE status = 1
            ORDER BY district, name
        ");
        $hospitals = $stmt->fetchAll();
        jsonResponse(true, 'Hospitals fetched.', ['hospitals' => $hospitals]);
        break;

    // ── SEARCH ─────────────────────────────────────────────
    case 'search':
        $db = getDB();
        $district = sanitize($_GET['district'] ?? '');
        $keyword  = sanitize($_GET['keyword'] ?? '');

        $where = ["status = 1"];
        $params = [];

        if ($district && validateDistrict($district)) {
            $where[] = "district = ?";
            $params[] = $district;
        }
        if ($keyword) {
            $where[] = "(name LIKE ? OR upazila LIKE ?)";
            $kw = "%$keyword%";
            $params[] = $kw;
            $params[] = $kw;
        }

        $whereClause = implode(' AND ', $where);
        $stmt = $db->prepare("SELECT * FROM hospitals WHERE $whereClause ORDER BY district, name");
        $stmt->execute($params);
        $hospitals = $stmt->fetchAll();

        jsonResponse(true, count($hospitals) . ' hospital(s) found.', ['hospitals' => $hospitals]);
        break;

    // ── CREATE (Admin) ─────────────────────────────────────
    case 'create':
        $session = requireAdmin();
        $input = jsonInput();
        $db = getDB();

        $name     = sanitize($input['name'] ?? '');
        $district = sanitize($input['district'] ?? '');
        $upazila  = sanitize($input['upazila'] ?? '');
        $phone    = sanitize($input['phone'] ?? '');
        $emgPhone = sanitize($input['emergency_phone'] ?? '');
        $email    = sanitize($input['email'] ?? '');
        $hasBB    = intval($input['has_blood_bank'] ?? 1);

        if (!$name || !$district) {
            jsonResponse(false, 'Hospital name and district are required.');
        }

        $stmt = $db->prepare("
            INSERT INTO hospitals (name, district, upazila, phone, emergency_phone, email, has_blood_bank)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$name, $district, $upazila, $phone, $emgPhone, $email, $hasBB]);

        logAdminAction($session['user_id'], 'add_hospital', "Added hospital: $name, $district");
        jsonResponse(true, 'Hospital added successfully.');
        break;

    // ── UPDATE (Admin) ─────────────────────────────────────
    case 'update':
        $session = requireAdmin();
        $input = jsonInput();
        $db = getDB();

        $id = intval($input['id'] ?? 0);
        if (!$id) jsonResponse(false, 'Hospital ID required.');

        $name     = sanitize($input['name'] ?? '');
        $district = sanitize($input['district'] ?? '');
        $upazila  = sanitize($input['upazila'] ?? '');
        $phone    = sanitize($input['phone'] ?? '');
        $emgPhone = sanitize($input['emergency_phone'] ?? '');
        $email    = sanitize($input['email'] ?? '');
        $hasBB    = intval($input['has_blood_bank'] ?? 1);

        $stmt = $db->prepare("
            UPDATE hospitals SET name=?, district=?, upazila=?, phone=?, emergency_phone=?, email=?, has_blood_bank=?
            WHERE id=?
        ");
        $stmt->execute([$name, $district, $upazila, $phone, $emgPhone, $email, $hasBB, $id]);

        logAdminAction($session['user_id'], 'update_hospital', "Updated hospital #$id: $name");
        jsonResponse(true, 'Hospital updated.');
        break;

    // ── DELETE (Admin) ─────────────────────────────────────
    case 'delete':
        $session = requireAdmin();
        $input = jsonInput();
        $db = getDB();

        $id = intval($input['id'] ?? 0);
        if (!$id) jsonResponse(false, 'Hospital ID required.');

        $stmt = $db->prepare("UPDATE hospitals SET status = 0 WHERE id = ?");
        $stmt->execute([$id]);

        logAdminAction($session['user_id'], 'delete_hospital', "Soft-deleted hospital #$id");
        jsonResponse(true, 'Hospital removed.');
        break;

    // ── COUNT ──────────────────────────────────────────────
    case 'count':
        $db = getDB();
        $total = $db->query("SELECT COUNT(*) FROM hospitals WHERE status = 1")->fetchColumn();
        jsonResponse(true, 'Count fetched.', ['count' => intval($total)]);
        break;

    default:
        jsonResponse(false, 'Invalid action. Use: list, search, create, update, delete, count');
}