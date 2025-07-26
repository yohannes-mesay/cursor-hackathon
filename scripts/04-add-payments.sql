-- Add payments table for tracking real money transactions
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grant_id UUID REFERENCES grants(id) ON DELETE CASCADE,
    payer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ETB',
    payment_method VARCHAR(50), -- 'chapa', 'telebirr', 'cbebirr', etc.
    chapa_transaction_id VARCHAR(255),
    chapa_payment_status VARCHAR(50), -- 'pending', 'success', 'failed'
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add total funded amount to grants table
ALTER TABLE grants ADD COLUMN total_funded DECIMAL(10,2) DEFAULT 0;
ALTER TABLE grants ADD COLUMN funding_percentage DECIMAL(5,2) DEFAULT 0;

-- Function to update grant funding when payment is successful
CREATE OR REPLACE FUNCTION update_grant_funding(p_grant_id UUID, p_amount DECIMAL)
RETURNS void AS $$
BEGIN
    UPDATE grants 
    SET 
        total_funded = total_funded + p_amount,
        funding_percentage = ROUND(((total_funded + p_amount) / amount_requested) * 100, 2)
    WHERE id = p_grant_id;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for better performance
CREATE INDEX idx_payments_grant_id ON payments(grant_id);
CREATE INDEX idx_payments_payer_id ON payments(payer_id);
CREATE INDEX idx_payments_status ON payments(chapa_payment_status);

-- Add sample payments data
INSERT INTO payments (grant_id, payer_id, amount, payment_method, chapa_payment_status) VALUES
((SELECT id FROM grants LIMIT 1), (SELECT id FROM users WHERE name = 'Meron Tadesse'), 500.00, 'chapa', 'success'),
((SELECT id FROM grants OFFSET 1 LIMIT 1), (SELECT id FROM users WHERE name = 'Daniel Haile'), 250.00, 'telebirr', 'success');

-- Update grant funding based on existing payments
SELECT update_grant_funding(grant_id, amount) FROM payments WHERE chapa_payment_status = 'success'; 