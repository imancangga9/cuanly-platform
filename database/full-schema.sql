-- Cuanly Full Database Schema
-- Kombinasi semua tabel untuk deployment mudah
-- Urutan eksekusi: schema.sql → schema-v2.sql → ai-credit-schema.sql

-- ============================================
-- PART 1: Base Schema (schema.sql)
-- ============================================

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  store_name TEXT,
  logo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  description TEXT,
  photo_url TEXT,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- Product Channel Prices (Harga Jual Aktif per Channel)
CREATE TABLE IF NOT EXISTS product_channel_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  channel_name TEXT NOT NULL,
  recommended_price NUMERIC NOT NULL DEFAULT 0,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE product_channel_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own product_channel_prices"
  ON product_channel_prices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own product_channel_prices"
  ON product_channel_prices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own product_channel_prices"
  ON product_channel_prices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own product_channel_prices"
  ON product_channel_prices FOR DELETE
  USING (auth.uid() = user_id);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  channel_price_id UUID REFERENCES product_channel_prices(id) ON DELETE SET NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Transaction Deductions (Admin Fee, Voucher, Campaign)
CREATE TABLE IF NOT EXISTS transaction_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE transaction_deductions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transaction_deductions"
  ON transaction_deductions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_deductions.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own transaction_deductions"
  ON transaction_deductions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_deductions.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own transaction_deductions"
  ON transaction_deductions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_deductions.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

-- Transaction Costs (Packing, Bubble Wrap, Operasional)
CREATE TABLE IF NOT EXISTS transaction_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE transaction_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transaction_costs"
  ON transaction_costs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_costs.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own transaction_costs"
  ON transaction_costs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_costs.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own transaction_costs"
  ON transaction_costs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_costs.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

-- Channels
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own channels"
  ON channels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own channels"
  ON channels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own channels"
  ON channels FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own channels"
  ON channels FOR DELETE
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS channel_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('multiply', 'add')),
  value_type TEXT NOT NULL CHECK (value_type IN ('percentage', 'fixed')),
  value NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE channel_factors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own channel factors"
  ON channel_factors FOR SELECT
  USING (EXISTS (SELECT 1 FROM channels WHERE channels.id = channel_factors.channel_id AND channels.user_id = auth.uid()));

CREATE POLICY "Users can insert own channel factors"
  ON channel_factors FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM channels WHERE channels.id = channel_factors.channel_id AND channels.user_id = auth.uid()));

CREATE POLICY "Users can update own channel factors"
  ON channel_factors FOR UPDATE
  USING (EXISTS (SELECT 1 FROM channels WHERE channels.id = channel_factors.channel_id AND channels.user_id = auth.uid()));

CREATE POLICY "Users can delete own channel factors"
  ON channel_factors FOR DELETE
  USING (EXISTS (SELECT 1 FROM channels WHERE channels.id = channel_factors.channel_id AND channels.user_id = auth.uid()));

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 2: AI & Transaction Schema (schema-v2.sql)
-- ============================================

-- Update products table (add new columns)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT true;

-- transactions (header)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT,
  channel TEXT,
  transaction_date TIMESTAMPTZ DEFAULT now(),
  subtotal NUMERIC NOT NULL DEFAULT 0,
  total_deduction NUMERIC NOT NULL DEFAULT 0,
  gross_profit NUMERIC NOT NULL DEFAULT 0,
  total_hpp NUMERIC NOT NULL DEFAULT 0,
  net_profit NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- transaction_items (detail produk)
CREATE TABLE IF NOT EXISTS transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name_snapshot TEXT,
  qty INTEGER NOT NULL DEFAULT 1,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  hpp_price NUMERIC NOT NULL DEFAULT 0,
  total_hpp NUMERIC NOT NULL DEFAULT 0,
  profit NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transaction_items" ON transaction_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_items.transaction_id AND t.user_id = auth.uid())
);
CREATE POLICY "Users can insert own transaction_items" ON transaction_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_items.transaction_id AND t.user_id = auth.uid())
);
CREATE POLICY "Users can delete own transaction_items" ON transaction_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_items.transaction_id AND t.user_id = auth.uid())
);

-- transaction_adjustments (pengurang/pengeluaran dinamis)
CREATE TABLE IF NOT EXISTS transaction_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deduction')), -- for now only deduction
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE transaction_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transaction_adjustments" ON transaction_adjustments FOR SELECT USING (
  EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_adjustments.transaction_id AND t.user_id = auth.uid())
);
CREATE POLICY "Users can insert own transaction_adjustments" ON transaction_adjustments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_adjustments.transaction_id AND t.user_id = auth.uid())
);
CREATE POLICY "Users can delete own transaction_adjustments" ON transaction_adjustments FOR DELETE USING (
  EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_adjustments.transaction_id AND t.user_id = auth.uid())
);

-- product_ai_knowledge (AI knowledge for products)
CREATE TABLE IF NOT EXISTS product_ai_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  ai_description TEXT,
  benefits TEXT,
  usage_instruction TEXT,
  target_customer TEXT,
  allowed_claim TEXT,
  forbidden_claim TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE product_ai_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own product_ai_knowledge" ON product_ai_knowledge FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own product_ai_knowledge" ON product_ai_knowledge FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own product_ai_knowledge" ON product_ai_knowledge FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own product_ai_knowledge" ON product_ai_knowledge FOR DELETE USING (auth.uid() = user_id);

-- product_faq (FAQ for products)
CREATE TABLE IF NOT EXISTS product_faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE product_faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own product_faq" ON product_faq FOR SELECT USING (
  EXISTS (SELECT 1 FROM products p WHERE p.id = product_faq.product_id AND p.user_id = auth.uid())
);
CREATE POLICY "Users can insert own product_faq" ON product_faq FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM products p WHERE p.id = product_faq.product_id AND p.user_id = auth.uid())
);
CREATE POLICY "Users can update own product_faq" ON product_faq FOR UPDATE USING (
  EXISTS (SELECT 1 FROM products p WHERE p.id = product_faq.product_id AND p.user_id = auth.uid())
);
CREATE POLICY "Users can delete own product_faq" ON product_faq FOR DELETE USING (
  EXISTS (SELECT 1 FROM products p WHERE p.id = product_faq.product_id AND p.user_id = auth.uid())
);

-- ai_settings (User AI settings)
CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tone TEXT DEFAULT 'friendly',
  language TEXT DEFAULT 'id',
  custom_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ai_settings" ON ai_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai_settings" ON ai_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ai_settings" ON ai_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai_settings" ON ai_settings FOR DELETE USING (auth.uid() = user_id);

-- ai_conversations (AI conversation history)
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_question TEXT NOT NULL,
  ai_answer TEXT NOT NULL,
  edited_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ai_conversations" ON ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai_conversations" ON ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ai_conversations" ON ai_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai_conversations" ON ai_conversations FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PART 3: AI Credit System (ai-credit-schema.sql)
-- ============================================

-- AI Credit Packages Table
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

-- AI Wallet Table
CREATE TABLE IF NOT EXISTS ai_wallet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    balance INTEGER DEFAULT 25,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- AI Credit Orders Table
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

-- AI Credit Transactions Table
CREATE TABLE IF NOT EXISTS ai_credit_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL, -- topup, usage, bonus
    amount INTEGER NOT NULL,
    description TEXT,
    order_id UUID REFERENCES ai_credit_orders(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_wallet_user_id ON ai_wallet(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_credit_orders_user_id ON ai_credit_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_credit_orders_status ON ai_credit_orders(status);
CREATE INDEX IF NOT EXISTS idx_ai_credit_transactions_user_id ON ai_credit_transactions(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE ai_credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_credit_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_credit_transactions ENABLE ROW LEVEL SECURITY;

-- AI Credit Packages Policies
-- Everyone can read active packages
CREATE POLICY "Everyone can read active packages"
    ON ai_credit_packages
    FOR SELECT
    USING (is_active = TRUE);

-- AI Wallet Policies
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

-- AI Credit Orders Policies
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

-- AI Credit Transactions Policies
-- Users can read their own transactions
CREATE POLICY "Users can read their own transactions"
    ON ai_credit_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can insert transactions
-- Note: No user insert policy, transactions are system-generated

-- Function to create wallet for new user
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
-- END OF FULL SCHEMA
-- ============================================
