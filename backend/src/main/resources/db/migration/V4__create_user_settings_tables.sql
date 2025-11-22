-- V4: Create user settings tables
-- This migration creates tables for user preferences, notification settings, and privacy settings

-- Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
    date_format VARCHAR(20) NOT NULL DEFAULT 'MM/DD/YYYY',
    time_format VARCHAR(10) NOT NULL DEFAULT '12h',
    theme VARCHAR(20) NOT NULL DEFAULT 'light',
    default_branch_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_preferences_branch FOREIGN KEY (default_branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    -- Email notifications
    email_prescription_ready BOOLEAN NOT NULL DEFAULT TRUE,
    email_order_updates BOOLEAN NOT NULL DEFAULT TRUE,
    email_promotions BOOLEAN NOT NULL DEFAULT FALSE,
    email_newsletter BOOLEAN NOT NULL DEFAULT TRUE,
    email_security_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    -- SMS notifications
    sms_prescription_ready BOOLEAN NOT NULL DEFAULT TRUE,
    sms_order_updates BOOLEAN NOT NULL DEFAULT FALSE,
    sms_promotions BOOLEAN NOT NULL DEFAULT FALSE,
    sms_security_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    -- Push notifications
    push_prescription_ready BOOLEAN NOT NULL DEFAULT TRUE,
    push_order_updates BOOLEAN NOT NULL DEFAULT TRUE,
    push_promotions BOOLEAN NOT NULL DEFAULT FALSE,
    push_security_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create privacy_settings table
CREATE TABLE IF NOT EXISTS privacy_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    share_data_with_partners BOOLEAN NOT NULL DEFAULT FALSE,
    marketing_communications BOOLEAN NOT NULL DEFAULT FALSE,
    profile_visibility BOOLEAN NOT NULL DEFAULT TRUE,
    show_online_status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_privacy_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON privacy_settings(user_id);
