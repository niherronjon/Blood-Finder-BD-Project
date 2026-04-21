<?php
require_once __DIR__ . '/config.php';

 $action = $_GET['action'] ?? '';

switch ($action) {

    case 'register':
        $input = jsonInput();
        $db = getDB();

        $name = sanitize($input['name'] ?? '');
        $email = sanitize($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $confirm = $input['confirmPassword'] ?? '';
        $phone = sanitize($input['phone'] ?? '');
        $bloodGroup = sanitize($input['bloodGroup'] ?? '');
        $userType = sanitize($input['userType'] ?? '');
        $district = sanitize($input['district'] ?? '');
        $upazila = sanitize($input['upazila'] ?? '');
        $address = sanitize($input['address'] ?? '');
        $weight = $input['weight'] ? floatval($input['weight']) : null;
        $lastDonation = $input['lastDonation'] ?: null;

        if (!$name || !$email || !$password) {
            jsonResponse(false, 'Name, email, and password are required.');
        }
        if (strlen($password) < 6) {
            jsonResponse(false, 'Password must be at least 6 characters.');
        }
        if ($password !== $confirm) {
            jsonResponse(false, 'Passwords do not match.');
        }
        if (!validateEmail($email)) {
            jsonResponse(false, 'Invalid email address.');
        }
        if ($phone && !validatePhone($phone)) {
            jsonResponse(false, 'Invalid phone number. Use: 01XXXXXXXXX');
        }
        if ($bloodGroup && !validateBloodGroup($bloodGroup)) {
            jsonResponse(false, 'Invalid blood group.');
        }
        if (!in_array($userType, ['donor', 'requester', 'hospital'])) {
            jsonResponse(false, 'Invalid user type.');
        }
        if ($district && !validateDistrict($district)) {
            jsonResponse(false, 'Invalid district.');
        }

        $check = $db->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$email]);
        if ($check->fetch()) {
            jsonResponse(false, 'This email is already registered.');
        }

        if ($phone) {
            $checkPhone = $db->prepare("SELECT id FROM users WHERE phone = ?");
            $checkPhone->execute([$phone]);
            if ($checkPhone->fetch()) {
                jsonResponse(false, 'This phone number is already registered.');
            }
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $db->prepare("INSERT INTO users (name, email, password, phone, blood_group, user_type, district, upazila, address, weight, last_donation, availability, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $name, $email, $hashedPassword, $phone,
            $bloodGroup ?: null, $userType, $district ?: null,
            $upazila ?: null, $address ?: null,
            $weight, $lastDonation,
            $userType === 'donor' ? 1 : 0,
            'active'
        ]);

        jsonResponse(true, 'Registration successful! Please login to continue.');
        break;

    case 'login':
        $input = jsonInput();
        $db = getDB();

        $email = sanitize($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (!$email || !$password) {
            jsonResponse(false, 'Email and password are required.');
        }

        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            jsonResponse(false, 'Invalid email or password.');
        }

        if ($user['status'] === 'banned') {
            jsonResponse(false, 'Your account has been banned.');
        }

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_type'] = $user['user_type'];
        $_SESSION['blood_group'] = $user['blood_group'];

        $redirect = 'donor-dashboard.html';
        if ($user['user_type'] === 'admin') {
            $redirect = 'Dashboard.html';
        }

        unset($user['password']);
        jsonResponse(true, 'Login successful!', [
            'user' => $user,
            'redirect' => $redirect
        ]);
        break;

    case 'logout':
        session_destroy();
        jsonResponse(true, 'Logged out successfully.');
        break;

    case 'check':
        if (isLoggedIn()) {
            $db = getDB();
            $stmt = $db->prepare("SELECT id, name, email, phone, blood_group, user_type, district, upazila, address, weight, last_donation, availability, donation_count, status, created_at FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();
            jsonResponse(true, 'Authenticated', ['user' => $user]);
        } else {
            jsonResponse(false, 'Not authenticated', [], 401);
        }
        break;

    default:
        jsonResponse(false, 'Invalid action. Use: register, login, logout, check');
}