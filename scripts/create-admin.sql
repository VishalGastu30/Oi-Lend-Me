-- Create admin user with hashed password
-- Password: IamAdmin@3004
-- This is a one-time setup script

INSERT INTO users (id, email, name, role, password_hash, karma_score, created_at, last_seen)
VALUES (
  gen_random_uuid(),
  'valiantvishal30@gmail.com',
  'Admin',
  'ADMIN',
  '$2b$12$HldDHkvIQ7nRJ6v0scITh.lNUi0xC1uXyC5lnb2EK2q6Z5BSNroEW', -- bcrypt hash of 'IamAdmin@3004'
  0,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'ADMIN',
  password_hash = '$2b$12$HldDHkvIQ7nRJ6v0scITh.lNUi0xC1uXyC5lnb2EK2q6Z5BSNroEW';
