<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

define('DB_HOST', 'localhost');
define('DB_NAME', 'bloodfinder_bd');
define('DB_USER', 'root');
define('DB_PASS', '');

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
            exit;
        }
    }
    return $pdo;
}

function jsonResponse($success, $message, $data = [], $code = 200) {
    http_response_code($code);
    $response = ["success" => $success, "message" => $message];
    if (!empty($data)) {
        $response["data"] = $data;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonInput() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        jsonResponse(false, "Invalid JSON input");
    }
    return $data;
}

function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        jsonResponse(false, "Not authenticated", [], 401);
    }
    return $_SESSION;
}

function requireAdmin() {
    $session = requireAuth();
    if (($session['user_type'] ?? '') !== 'admin') {
        jsonResponse(false, "Admin access required", [], 403);
    }
    return $session;
}

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function sanitize($str) {
    return trim(htmlspecialchars($str, ENT_QUOTES, 'UTF-8'));
}

function validatePhone($phone) {
    return preg_match('/^01[3-9]\d{8}$/', $phone) === 1;
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validateBloodGroup($bg) {
    return in_array($bg, ['A+','A-','B+','B-','AB+','AB-','O+','O-']);
}

function validateDistrict($d) {
    return in_array($d, ['Dhaka','Chittagong','Sylhet','Rajshahi','Khulna','Barisal','Rangpur','Mymensingh']);
}

function validateUrgency($u) {
    return in_array($u, ['Emergency','Urgent','Normal']);
}

function getPaginationParams() {
    $page = max(1, intval($_GET['page'] ?? 1));
    $perPage = max(1, min(50, intval($_GET['per_page'] ?? 10)));
    $offset = ($page - 1) * $perPage;
    return [$page, $perPage, $offset];
}

function paginate($total, $page, $perPage) {
    return [
        'total' => $total,
        'page' => $page,
        'per_page' => $perPage,
        'total_pages' => max(1, ceil($total / $perPage))
    ];
}

function logAdminAction($adminId, $action, $details = '') {
    try {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)");
        $stmt->execute([$adminId, $action, $details]);
    } catch (Exception $e) {}
}

function createNotification($userId, $title, $message) {
    try {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $title, $message]);
    } catch (Exception $e) {}
}

function notifyMatchingDonors($bloodGroup, $district, $patientName, $hospital) {
    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT id FROM users WHERE user_type = 'donor' AND blood_group = ? AND district = ? AND availability = 1 AND status = 'active'");
        $stmt->execute([$bloodGroup, $district]);
        $donors = $stmt->fetchAll();
        foreach ($donors as $donor) {
            createNotification($donor['id'], 'Blood Request Match', "New {$bloodGroup} request in {$district}. Patient: {$patientName} at {$hospital}.");
        }
    } catch (Exception $e) {}
}