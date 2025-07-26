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
