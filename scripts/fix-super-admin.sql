-- Fix super_admin enum values before schema migration
-- This script converts all super_admin users to admin users

UPDATE "user" 
SET system_role = 'admin' 
WHERE system_role = 'super_admin';

-- Verify the update
SELECT system_role, COUNT(*) as count 
FROM "user" 
GROUP BY system_role;