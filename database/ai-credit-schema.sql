-- AI Credit System Database Schema
-- Cuanly V1 (Manual Payment)

-- 1. AI Credit Packages Table
CREATE TABLE IF NOT EXISTS ai_credit_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    credit_amount INTEGER NOT NULL,
    price BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_recommended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default packages
INSERT INTO ai_credit_packages (name, credit_amount, price, is_active, is_recommended)
VALUES 
    ('Starter', 100, 15000, TRUE, FALSE),
    ('Growth', 500, 49000, TRUE, TRUE),
    ('Pro', 2000, 149000, TRUE, FALSE)
ON CONFLICT DO NOTHING;

-- 2. AI Wallet Table
CREATE TABLE IF NOT EXISTS ai_wallet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    balance INTEGER DEFAULT 25,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. AI Credit Orders Table
CREATE TABLE IF NOT EXISTS ai_credit_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(20) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    package_id UUID REFERENCES ai_credit_packages(id) NOT NULL,
    package_name VARCHAR(50) NOT NULL,
    package_price BIGINT NOT NULL,
    credit_amount INTEGER NOT NULL,
    unique_code INTEGER NOT NULL,
    total_payment BIGINT NOT NULL,
    proof_image_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ
);

-- 4. AI Credit Transactions Table
CREATE TABLE IF NOT EXISTS ai_credit_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL, -- topup, usage, bonus
    amount INTEGER NOT NULL,
    description TEXT,
    order_id UUID REFERENCES ai_credit_orders(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_wallet_user_id ON ai_wallet(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_credit_orders_user_id ON ai_credit_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_credit_orders_status ON ai_credit_orders(status);
CREATE INDEX IF NOT EXISTS idx_ai_credit_transactions_user_id ON ai_credit_transactions(user_id);

-- 6. Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE ai_credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_credit_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_credit_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AI Credit Packages Policies
-- ============================================
-- Everyone can read active packages
CREATE POLICY "Everyone can read active packages"
    ON ai_credit_packages
    FOR SELECT
    USING (is_active = TRUE);

-- ============================================
-- AI Wallet Policies
-- ============================================
-- Users can only read their own wallet
CREATE POLICY "Users can read their own wallet"
    ON ai_wallet
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own wallet
CREATE POLICY "Users can insert their own wallet"
    ON ai_wallet
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Note: Wallet updates are done via service role (no user policy for UPDATE/DELETE)

-- ============================================
-- AI Credit Orders Policies
-- ============================================
-- Users can read their own orders
CREATE POLICY "Users can read their own orders"
    ON ai_credit_orders
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create their own orders"
    ON ai_credit_orders
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own orders (upload proof)
CREATE POLICY "Users can update their own orders"
    ON ai_credit_orders
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- AI Credit Transactions Policies
-- ============================================
-- Users can read their own transactions
CREATE POLICY "Users can read their own transactions"
    ON ai_credit_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can insert transactions
-- Note: No user insert policy, transactions are system-generated

-- ============================================
-- 7. Function to create wallet for new user
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user_ai_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.ai_wallet (user_id, balance)
    VALUES (NEW.id, 25);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created_ai_wallet ON auth.users;

-- Trigger to create wallet on new user
CREATE OR REPLACE TRIGGER on_auth_user_created_ai_wallet
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_ai_wallet();

-- ============================================
-- 8. Utility Function: Check if user has admin role
-- Note: For admin verification, you can use a separate admin table or metadata
-- For now, we'll use service role for admin operations in the application
-- ============================================

-- ============================================
-- Optional: Create a combined schema file reference
-- ============================================
-- Combine with existing schema:
-- 1. Run schema.sql first (existing tables)
-- 2. Run schema-v2.sql (AI features)
-- 3. Run ai-credit-schema.sql (AI Credit System)
