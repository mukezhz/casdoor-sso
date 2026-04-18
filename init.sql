-- Create casdoor database if it doesn't exist
CREATE DATABASE IF NOT EXISTS casdoor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the casdoor database
USE casdoor;

-- Grant privileges to root user
GRANT ALL PRIVILEGES ON casdoor.* TO 'root'@'%';
FLUSH PRIVILEGES;
