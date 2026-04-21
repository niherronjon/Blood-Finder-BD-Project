-- ============================================================
-- BloodFinder BD — Database Schema (Reference)
-- Run setup.php instead to auto-create everything with hashed passwords
-- ============================================================

CREATE DATABASE IF NOT EXISTS bloodfinder_bd
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE bloodfinder_bd;

-- ── USERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(120) NOT NULL,
    email          VARCHAR(150) NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL,
    phone          VARCHAR(20)  DEFAULT NULL,
    blood_group    VARCHAR(5)   DEFAULT NULL,
    user_type      ENUM('donor','requester','hospital','admin') NOT NULL DEFAULT 'donor',
    district       VARCHAR(80)  DEFAULT NULL,
    upazila        VARCHAR(80)  DEFAULT NULL,
    address        TEXT         DEFAULT NULL,
    weight         DECIMAL(5,2) DEFAULT NULL,
    last_donation  DATE         DEFAULT NULL,
    availability   TINYINT(1)   NOT NULL DEFAULT 1,
    donation_count INT          NOT NULL DEFAULT 0,
    status         ENUM('active','pending','banned') NOT NULL DEFAULT 'active',
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_blood (blood_group),
    INDEX idx_district (district),
    INDEX idx_type (user_type),
    INDEX idx_status (status),
    INDEX idx_availability (availability)
) ENGINE=InnoDB;

-- ── BLOOD REQUESTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blood_requests (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT          DEFAULT NULL,
    patient_name    VARCHAR(150) NOT NULL,
    blood_group     VARCHAR(5)   NOT NULL,
    units_needed    INT          NOT NULL DEFAULT 1,
    urgency         ENUM('Emergency','Urgent','Normal') NOT NULL DEFAULT 'Normal',
    hospital_name   VARCHAR(200) NOT NULL,
    district        VARCHAR(80)  NOT NULL,
    required_date   DATETIME     DEFAULT NULL,
    contact_person  VARCHAR(120) NOT NULL,
    contact_phone   VARCHAR(20)  NOT NULL,
    notes           TEXT         DEFAULT NULL,
    status          ENUM('Active','Fulfilled','Cancelled') NOT NULL DEFAULT 'Active',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_blood (blood_group),
    INDEX idx_urgency (urgency),
    INDEX idx_district (district),
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── HOSPITALS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hospitals (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    district        VARCHAR(80)  NOT NULL,
    upazila         VARCHAR(80)  DEFAULT NULL,
    phone           VARCHAR(20)  DEFAULT NULL,
    emergency_phone VARCHAR(20)  DEFAULT NULL,
    email           VARCHAR(150) DEFAULT NULL,
    has_blood_bank  TINYINT(1)   NOT NULL DEFAULT 1,
    status          TINYINT(1)   NOT NULL DEFAULT 1,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_district (district)
) ENGINE=InnoDB;

-- ── DONATIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donations (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT          NOT NULL,
    hospital_name VARCHAR(200) NOT NULL,
    units         INT          NOT NULL DEFAULT 1,
    donation_date DATE         DEFAULT NULL,
    notes         TEXT         DEFAULT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_date (donation_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── NOTIFICATIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT       NOT NULL,
    title      VARCHAR(200) NOT NULL,
    message    TEXT      NOT NULL,
    is_read    TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── ADMIN LOGS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_logs (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    admin_id   INT       NOT NULL,
    action     VARCHAR(100) NOT NULL,
    details    TEXT      DEFAULT NULL,
    created_at DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;