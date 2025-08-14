-- ChifaaCare Database Schema
-- This file creates the database and users table for the ChifaaCare application

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS chifaacare_db;
USE chifaacare_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('PATIENT', 'DOCTOR') NOT NULL,
  license_number VARCHAR(50),
  specialty VARCHAR(100),
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  refresh_token VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for better performance
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_email_verified (email_verified),
  INDEX idx_verification_token (verification_token),
  INDEX idx_refresh_token (refresh_token),
  INDEX idx_created_at (created_at)
);

-- Insert sample data (optional)
-- INSERT INTO users (full_name, email, password_hash, role, email_verified) VALUES 
-- ('Test Patient', 'patient@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHqHqHq', 'PATIENT', true),
-- ('Test Doctor', 'doctor@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHqHqHq', 'DOCTOR', true);

-- Show table structure
DESCRIBE users;
