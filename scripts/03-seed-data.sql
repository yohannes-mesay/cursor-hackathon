-- Insert sample users
INSERT INTO users (name, email, startup_name, stage, tagline, areas_of_help, token_balance) VALUES
('Abebe Kebede', 'abebe@example.com', 'EthioTech', 'mvp', 'Connecting rural farmers with urban markets', ARRAY['funding', 'mentorship'], 15),
('Meron Tadesse', 'meron@example.com', 'HealthBridge', 'idea', 'Telemedicine for remote Ethiopian communities', ARRAY['technical', 'partnerships'], 12),
('Daniel Haile', 'daniel@example.com', 'EduConnect', 'growth', 'Online learning platform for Ethiopian students', ARRAY['scaling', 'marketing'], 20);

-- Insert sample startups
INSERT INTO startups (user_id, name, tagline, stage, support_count) 
SELECT id, startup_name, tagline, stage, FLOOR(RANDOM() * 10) + 1
FROM users WHERE startup_name IS NOT NULL;

-- Insert sample posts
INSERT INTO posts (user_id, title, body, tags) VALUES
((SELECT id FROM users WHERE name = 'Abebe Kebede'), 
 'Building for the Ethiopian Market: Key Insights', 
 'After 6 months of building EthioTech, here are the key insights I''ve learned about the Ethiopian startup ecosystem...', 
 ARRAY['insights', 'ethiopia', 'startup']),
((SELECT id FROM users WHERE name = 'Meron Tadesse'), 
 'The Future of Healthcare in Ethiopia', 
 'Healthcare accessibility remains a major challenge in Ethiopia. Here''s how technology can bridge the gap...', 
 ARRAY['healthcare', 'technology', 'impact']);

-- Insert sample grants
INSERT INTO grants (user_id, title, description, amount_requested, stake_count) VALUES
((SELECT id FROM users WHERE name = 'Abebe Kebede'), 
 'Market Research for Rural Farmers', 
 'Need funding to conduct comprehensive market research in rural areas to better understand farmer needs and pain points.', 
 5000, 8),
((SELECT id FROM users WHERE name = 'Meron Tadesse'), 
 'Prototype Development for Telemedicine App', 
 'Seeking micro-grant to develop initial prototype for our telemedicine platform targeting remote communities.', 
 3000, 12);
