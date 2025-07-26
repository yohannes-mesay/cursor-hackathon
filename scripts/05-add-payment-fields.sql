-- Add payment-related fields to grants table
-- This supports Chappa and other Ethiopian payment methods

-- Add new columns to grants table
ALTER TABLE grants 
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS account_name TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Create index for payment status queries
CREATE INDEX IF NOT EXISTS idx_grants_payment_status ON grants(payment_status);

-- Add constraint to ensure valid payment methods
ALTER TABLE grants 
ADD CONSTRAINT check_payment_method 
CHECK (payment_method IN ('chappa', 'cbe_birr', 'amole', 'm_pesa') OR payment_method IS NULL);

-- Add constraint to ensure valid payment status
ALTER TABLE grants 
ADD CONSTRAINT check_payment_status 
CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed') OR payment_status IS NULL);

-- Update existing grants to have default payment status
UPDATE grants SET payment_status = 'pending' WHERE payment_status IS NULL;

-- Create a view for payment processing
CREATE OR REPLACE VIEW grant_payments AS
SELECT 
    g.id as grant_id,
    g.title,
    g.amount_requested,
    g.payment_method,
    g.phone_number,
    g.account_name,
    g.payment_status,
    g.stake_count,
    u.name as requester_name,
    u.email as requester_email,
    g.created_at
FROM grants g
JOIN users u ON g.user_id = u.id
WHERE g.payment_method IS NOT NULL;

-- Function to update payment status
CREATE OR REPLACE FUNCTION update_grant_payment_status(
    p_grant_id UUID,
    p_status TEXT
)
RETURNS json AS $$
BEGIN
    -- Validate status
    IF p_status NOT IN ('pending', 'processing', 'completed', 'failed') THEN
        RETURN json_build_object('success', false, 'error', 'Invalid payment status');
    END IF;
    
    -- Update the grant
    UPDATE grants 
    SET payment_status = p_status 
    WHERE id = p_grant_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Grant not found');
    END IF;
    
    RETURN json_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', 'Failed to update payment status');
END;
$$ LANGUAGE plpgsql; 