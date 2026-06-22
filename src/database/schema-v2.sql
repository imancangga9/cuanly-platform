-- New Database Structure for Cuanly

-- 1. Update products table (add new columns)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT true;


-- 2. transactions (header)
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


-- 3. transaction_items (detail produk)
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


-- 4. transaction_adjustments (pengurang/pengeluaran dinamis)
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


-- 5. product_ai_knowledge (AI knowledge for products)
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


-- 6. product_faq (FAQ for products)
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


-- 7. ai_settings (User AI settings)
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


-- 8. ai_conversations (AI conversation history)
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
