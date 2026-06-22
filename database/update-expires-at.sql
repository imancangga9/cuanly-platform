-- Add expires_at column to ai_credit_orders table
ALTER TABLE ai_credit_orders
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
