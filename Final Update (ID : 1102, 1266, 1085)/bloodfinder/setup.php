<?php
/**
 * BloodFinder BD — One-Time Setup Script
 * Run this ONCE in browser: http://localhost/bloodfinder/setup.php
 * Then DELETE this file immediately.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// ── CONFIGURE THESE ───────────────────────────────────────
 $DB_HOST = 'localhost';
 $DB_USER = 'root';
 $DB_PASS = '';          // Your MySQL password
 $DB_NAME = 'bloodfinder_bd';
// ──────────────────────────────────────────────────────────

echo "<h2>BloodFinder BD — Setup</h2><pre>";

// 1. Connect without DB
try {
    $pdo = new PDO("mysql:host=$DB_HOST;charset=utf8mb4", $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    die("❌ Cannot connect to MySQL: " . $e->getMessage() . "\nCheck host, user, password.");
}

// 2. Create database
 $pdo->exec("CREATE DATABASE IF NOT EXISTS `$DB_NAME` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
echo "✅ Database '$DB_NAME' ready\n";

 $pdo->exec("USE `$DB_NAME`");

// 3. Create tables
 $schema = file_get_contents(__DIR__ . '/database.sql');
// Strip SQL comments and non-essential lines
 $statements = array_filter(
    array_map('trim', explode(';', $schema)),
    fn($s) => !empty($s) && $s[0] !== '-' && stripos($s, 'CREATE') === 0
           || stripos($s, 'USE') === 0
);
foreach ($statements as $stmt) {
    $pdo->exec($stmt);
}
echo "✅ Tables created\n";

// 4. Clear existing data (fresh setup)
 $pdo->exec("SET FOREIGN_KEY_CHECKS=0");
 $tables = ['admin_logs','notifications','donations','blood_requests','hospitals','users'];
foreach ($tables as $t) {
    $pdo->exec("TRUNCATE TABLE `$t`");
}
 $pdo->exec("SET FOREIGN_KEY_CHECKS=1");
echo "✅ Tables cleared\n";

// 5. Insert users
 $hashAdmin = password_hash('admin123', PASSWORD_BCRYPT);
 $hashDonor = password_hash('donor123', PASSWORD_BCRYPT);
 $hashReq   = password_hash('requester123', PASSWORD_BCRYPT);
 $hashHosp  = password_hash('hospital123', PASSWORD_BCRYPT);

 $users = [
    ['Admin BloodFinder', 'admin@bloodfinder.bd',  $hashAdmin, '01700000000', NULL,    'admin',     NULL,     NULL,     NULL,              NULL,    NULL, 1, 0, 'active'],
    ['Rakib Hasan',       'donor@bloodfinder.bd',   $hashDonor, '01711111111', 'O+',    'donor',     'Dhaka',  'Mirpur', 'Mirpur-10, Dhaka', 68,     NULL, 1, 5, 'active'],
    ['Fatima Akter',      'fatima@gmail.com',        $hashDonor, '01722222222', 'A+',    'donor',     'Dhaka',  'Dhanmondi','House 45, Dhanmondi', 55,    '2025-10-15', 1, 3, 'active'],
    ['Kamal Hossain',     'kamal@yahoo.com',         $hashDonor, '01733333333', 'B+',    'donor',     'Chittagong','GEC','GEC Circle, CTG',     72,    '2025-11-20', 1, 7, 'active'],
    ['Nusrat Jahan',      'nusrat@gmail.com',        $hashDonor, '01744444444', 'AB+',   'donor',     'Sylhet',  'Zindabazar','Zindabazar, Sylhet',  50,    NULL, 0, 0, 'active'],
    ['Tanvir Ahmed',      'tanvir@outlook.com',      $hashDonor, '01755555555', 'O-',    'donor',     'Dhaka',  'Uttara',  'Sector 7, Uttara',    75,    '2025-12-01', 1, 12,'active'],
    ['Mithila Das',       'mithila@gmail.com',       $hashDonor, '01766666666', 'A-',    'donor',     'Rajshahi','Sadar',  'Rajshahi Sadar',      52,    '2025-09-10', 1, 2, 'active'],
    ['Sabbir Rahman',     'sabbir@gmail.com',        $hashDonor, '01777777777', 'B-',    'donor',     'Khulna',  'Sonadanga','Sonadanga, Khulna',   65,    NULL, 1, 1, 'active'],
    ['Rima Sultana',      'rima@gmail.com',          $hashDonor, '01788888888', 'AB-',   'donor',     'Barisal', 'Sadar',  'Barisal Sadar',       58,    '2025-08-20', 0, 0, 'active'],
    ['Arif Uddin',        'arif@gmail.com',          $hashDonor, '01799999999', 'O+',    'donor',     'Rangpur', 'Sadar',  'Rangpur Sadar',       70,    '2025-11-05', 1, 4, 'active'],
    ['Jamil Khan',        'jamil@gmail.com',         $hashReq,   '01811111111', 'A+',    'requester', 'Dhaka',  'Mohammadpur','Mohammadpur, Dhaka', NULL, NULL, 0, 0, 'active'],
    ['Dr. Rahman',        'dr.rahman@dmch.bd',       $hashHosp,  '02-9660001',  NULL,    'hospital',  'Dhaka',  NULL,     'DMCH, Dhaka',         NULL, NULL, 0, 0, 'active'],
];

 $stmt = $pdo->prepare("INSERT INTO users (name,email,password,phone,blood_group,user_type,district,upazila,address,weight,last_donation,availability,donation_count,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
foreach ($users as $u) {
    $stmt->execute($u);
}
echo "✅ " . count($users) . " users inserted\n";

// 6. Insert hospitals
 $hospitals = [
    ['Dhaka Medical College Hospital',        'Dhaka',     NULL,              '02-9660001', '02-9660002', 'info@dmch.gov.bd',    1],
    ['Chittagong Medical College Hospital',    'Chittagong',NULL,              '031-610400', '031-610401', 'info@cmch.gov.bd',    1],
    ['Square Hospital Ltd',                    'Dhaka',     'Panthapath',      '02-8140000', '02-8140044', 'info@squarehospital.com',1],
    ['United Hospital Ltd',                    'Dhaka',     'Gulshan',         '02-8861100', '02-8861144', 'info@unitedhospital.com',1],
    ['Sylhet MAG Osmani Medical College',      'Sylhet',    NULL,              '0821-712040','0821-712041','info@osmani.gov.bd',  1],
    ['Rajshahi Medical College Hospital',      'Rajshahi',  NULL,              '0721-772040','0721-772041','info@rmch.gov.bd',    1],
    ['Khulna Medical College Hospital',        'Khulna',    NULL,              '041-770040', '041-770041', 'info@kmch.gov.bd',    1],
    ['Barisal Sher-e-Bangla Medical College',  'Barisal',   NULL,              '0431-61100', '0431-61101', 'info@sbmc.gov.bd',    1],
    ['Rangpur Medical College Hospital',       'Rangpur',   NULL,              '0521-62040', '0521-62041', 'info@rpmch.gov.bd',   1],
    ['Mymensingh Medical College Hospital',    'Mymensingh',NULL,              '091-61040',  '091-61041',  'info@mmch.gov.bd',    1],
    ['Bangabandhu Sheikh Mujib Medical University','Dhaka', 'Shahbag',         '02-9661051','02-9661052', 'info@bsmmu.edu.bd',   1],
    ['Ibrahim Cardiac Hospital & Research Institute','Dhaka','Shahbag',        '02-9666601','02-9666602', 'info@ichri.gov.bd',   1],
];

 $stmt = $pdo->prepare("INSERT INTO hospitals (name,district,upazila,phone,emergency_phone,email,has_blood_bank) VALUES (?,?,?,?,?,?,?)");
foreach ($hospitals as $h) {
    $stmt->execute($h);
}
echo "✅ " . count($hospitals) . " hospitals inserted\n";

// 7. Insert blood requests
 $requests = [
    [11, 'Minhaj Uddin',  'O+',  2, 'Emergency', 'Dhaka Medical College Hospital', 'Dhaka',     '2026-01-15 10:00:00', 'Jamil Khan',  '01811111111', 'Accident case, urgent need',  'Active'],
    [11, 'Sumaiya Islam',  'A-',  1, 'Urgent',    'Square Hospital Ltd',             'Dhaka',     '2026-01-16 08:00:00', 'Jamil Khan',  '01811111111', 'Surgery scheduled tomorrow', 'Active'],
    [11, 'Rafiq Ahmed',    'B+',  3, 'Normal',    'Chittagong Medical College',      'Chittagong','2026-01-20 14:00:00', 'Rafiq Bro',   '01822222222', 'Planned operation',          'Active'],
    [11, 'Salma Begum',    'AB+', 1, 'Emergency', 'United Hospital Ltd',             'Dhaka',     '2026-01-15 06:00:00', 'Kamal Hossain','01733333333','Post-delivery complication','Active'],
    [11, 'Karim Mia',      'O-',  1, 'Emergency', 'Sylhet MAG Osmani Medical',       'Sylhet',    '2026-01-15 12:00:00', 'Arif Uddin',  '01799999999','Road accident',             'Active'],
    [11, 'Nasreen Akter',  'A+',  2, 'Urgent',    'Rajshahi Medical College',        'Rajshahi',  '2026-01-17 09:00:00', 'Nasreen Sis', '01833333333','Chemotherapy patient',      'Active'],
    [11, 'Habibur Rahman', 'B-',  1, 'Emergency', 'Khulna Medical College',          'Khulna',    '2026-01-14 20:00:00', 'Habib Bro',   '01844444444','Gunshot wound',             'Fulfilled'],
    [11, 'Asma Khatun',    'O+',  1, 'Urgent',    'Barisal SBMC',                    'Barisal',   '2026-01-18 07:00:00', 'Asma Husband','01855555555','Dengue platelet need',      'Active'],
];

 $stmt = $pdo->prepare("INSERT INTO blood_requests (user_id,patient_name,blood_group,units_needed,urgency,hospital_name,district,required_date,contact_person,contact_phone,notes,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");
foreach ($requests as $r) {
    $stmt->execute($r);
}
echo "✅ " . count($requests) . " blood requests inserted\n";

// 8. Insert donations
 $donations = [
    [2, 'Dhaka Medical College Hospital', 1, '2025-06-15', 'Regular donation'],
    [2, 'Square Hospital Ltd', 1, '2025-08-20', 'Camp donation'],
    [2, 'United Hospital Ltd', 1, '2025-10-15', 'Emergency response'],
    [3, 'Dhaka Medical College Hospital', 1, '2025-07-10', 'Regular donation'],
    [3, 'Bangabandhu Sheikh Mujib Medical University', 1, '2025-09-25', 'Camp donation'],
    [3, 'Ibrahim Cardiac Hospital', 1, '2025-10-15', 'For cardiac patient'],
    [4, 'Chittagong Medical College Hospital', 1, '2025-05-10', 'Regular donation'],
    [4, 'Chittagong Medical College Hospital', 1, '2025-07-22', 'Regular donation'],
    [4, 'Chittagong Medical College Hospital', 1, '2025-09-15', 'Camp donation'],
    [4, 'Chittagong Medical College Hospital', 1, '2025-11-20', 'Emergency'],
    [6, 'Dhaka Medical College Hospital', 1, '2025-03-10', 'Regular donation'],
    [6, 'Dhaka Medical College Hospital', 1, '2025-05-15', 'Regular donation'],
    [6, 'Square Hospital Ltd', 1, '2025-07-20', 'Camp donation'],
    [6, 'United Hospital Ltd', 1, '2025-09-10', 'Regular donation'],
    [6, 'Dhaka Medical College Hospital', 1, '2025-11-05', 'Regular donation'],
    [6, 'DMCH Blood Bank', 1, '2025-12-01', 'Year-end donation'],
    [6, 'Square Hospital', 1, '2026-01-05', 'New year camp'],
    [7, 'Rajshahi Medical College Hospital', 1, '2025-06-20', 'Regular donation'],
    [7, 'Rajshahi Medical College Hospital', 1, '2025-09-10', 'Regular donation'],
    [10, 'Rangpur Medical College Hospital', 1, '2025-08-10', 'Regular donation'],
    [10, 'Rangpur Medical College Hospital', 1, '2025-10-20', 'Camp donation'],
    [10, 'Rangpur Medical College Hospital', 1, '2025-11-05', 'Emergency'],
    [10, 'Rangpur Medical College Hospital', 1, '2025-12-15', 'Regular donation'],
    [8, 'Khulna Medical College Hospital', 1, '2025-10-10', 'First donation'],
];

 $stmt = $pdo->prepare("INSERT INTO donations (user_id,hospital_name,units,donation_date,notes) VALUES (?,?,?,?,?)");
foreach ($donations as $d) {
    $stmt->execute($d);
}
echo "✅ " . count($donations) . " donations inserted\n";

// 9. Insert notifications
 $notifications = [
    [2, 'Blood Request Match', 'A new O+ emergency request in Dhaka matches your blood group. Patient: Minhaj Uddin at DMCH.', 0],
    [2, 'Donation Reminder', 'It has been 3 months since your last donation. You are eligible to donate again!', 0],
    [6, 'Blood Request Match', 'Emergency O- blood needed at Osmani Medical, Sylhet. Patient: Karim Mia.', 0],
    [6, 'Thank You!', 'Your donation on Jan 5, 2026 at Square Hospital was recorded. Thank you for saving lives!', 1],
    [3, 'Blood Request Match', 'Urgent A+ request in Dhaka. Patient: Nasreen Akter at Rajshahi Medical College.', 0],
    [4, 'Blood Request Match', 'Emergency AB+ request in Dhaka at United Hospital. Patient: Salma Begum.', 0],
];

 $stmt = $pdo->prepare("INSERT INTO notifications (user_id,title,message,is_read) VALUES (?,?,?,?)");
foreach ($notifications as $n) {
    $stmt->execute($n);
}
echo "✅ " . count($notifications) . " notifications inserted\n";

echo "\n" . str_repeat("=", 50) . "\n";
echo "🎉 SETUP COMPLETE!\n";
echo str_repeat("=", 50) . "\n";
echo "\nDemo Credentials:\n";
echo "  Admin:   admin@bloodfinder.bd  / admin123\n";
echo "  Donor:   donor@bloodfinder.bd  / donor123\n";
echo "  Requester: jamil@gmail.com     / requester123\n";
echo "  Hospital: dr.rahman@dmch.bd    / hospital123\n";
echo "\n⚠️  DELETE setup.php NOW for security!\n";
echo "</pre>";