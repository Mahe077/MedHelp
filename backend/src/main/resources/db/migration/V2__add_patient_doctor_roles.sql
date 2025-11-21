-- Add PATIENT and DOCTOR roles
INSERT INTO roles (name, description) VALUES
    ('PATIENT', 'Patient with access to their own records'),
    ('DOCTOR', 'Doctor with access to patient records')
ON CONFLICT (name) DO NOTHING;

-- Assign basic permissions to PATIENT and DOCTOR roles (copying USER permissions for now)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('PATIENT', 'DOCTOR')
  AND p.name IN ('USER_READ', 'BRANCH_READ')
ON CONFLICT DO NOTHING;
