-- Make sure ai_credit_orders table has all necessary columns
ALTER TABLE ai_credit_orders
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Check if all data is there
-- SELECT * FROM ai_credit_packages;
