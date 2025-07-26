-- =====================================
-- Supabase Database Setup Script
-- =====================================
-- This script sets up all tables, functions, and sample data for the Inkubeta platform
-- Run this script in your Supabase SQL editor to initialize the database

-- =====================================
-- STEP 1: Enable Extensions
-- =====================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================
-- STEP 2: Create Tables
-- =====================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    startup_name TEXT,
    stage TEXT,
    tagline TEXT,
    areas_of_help TEXT[],
    token_balance INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Startups table
CREATE TABLE startups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tagline TEXT,
    stage TEXT,
    support_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grants table
CREATE TABLE grants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    amount_requested INTEGER NOT NULL,
    stake_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stakes table
CREATE TABLE stakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grant_id UUID REFERENCES grants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(grant_id, user_id)
);

-- Pitches table for AI polisher
CREATE TABLE pitches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    clarity_score INTEGER,
    suggestions TEXT[],
    local_tips TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- STEP 3: Create Functions
-- =====================================

-- Function to increment startup support count
CREATE OR REPLACE FUNCTION increment_support_count(startup_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE startups 
    SET support_count = support_count + 1 
    WHERE id = startup_id;
END;
$$ LANGUAGE plpgsql;

-- Function to handle staking
CREATE OR REPLACE FUNCTION stake_tokens(p_grant_id UUID, p_user_id UUID, p_amount INTEGER)
RETURNS json AS $$
DECLARE
    user_balance INTEGER;
    result json;
BEGIN
    -- Check user balance
    SELECT token_balance INTO user_balance FROM users WHERE id = p_user_id;
    
    IF user_balance < p_amount THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient tokens');
    END IF;
    
    -- Insert stake (will fail if already exists due to unique constraint)
    INSERT INTO stakes (grant_id, user_id, amount) 
    VALUES (p_grant_id, p_user_id, p_amount);
    
    -- Update grant stake count
    UPDATE grants SET stake_count = stake_count + p_amount WHERE id = p_grant_id;
    
    -- Update user balance
    UPDATE users SET token_balance = token_balance - p_amount WHERE id = p_user_id;
    
    RETURN json_build_object('success', true);
EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object('success', false, 'error', 'Already staked on this grant');
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', 'Transaction failed');
END;
$$ LANGUAGE plpgsql;

-- =====================================
-- STEP 4: Insert Sample Data (Optional)
-- =====================================
-- Uncomment the following lines if you want to add sample data

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

-- =====================================
-- Database Setup Complete!
-- =====================================
-- Tables created: users, startups, posts, comments, grants, stakes, pitches
-- Functions created: increment_support_count, stake_tokens
-- Sample data inserted (optional)
-- 
-- Next steps:
-- 1. Set up Row Level Security (RLS) policies if needed
-- 2. Configure authentication policies
-- 3. Update your environment variables with Supabase credentials
-- ===================================== 