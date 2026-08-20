-- V14: Add custom_links and contact_details to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_links TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_details TEXT;
