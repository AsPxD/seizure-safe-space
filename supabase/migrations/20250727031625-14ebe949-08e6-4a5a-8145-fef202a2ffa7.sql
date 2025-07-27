-- Add some sample emergency contacts for demonstration
INSERT INTO emergency_contacts (user_id, name, phone, relationship, is_primary) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Dr. Sarah Johnson', '(555) 123-4567', 'Primary Doctor', true),
  ('00000000-0000-0000-0000-000000000000', 'Emergency Services', '911', 'Emergency', false),
  ('00000000-0000-0000-0000-000000000000', 'Mom', '(555) 987-6543', 'Mother', false);