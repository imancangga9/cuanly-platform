-- ============================================
-- Notifications Table
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- payment_verify, order_update, etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Row Level Security (RLS) Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" 
  ON notifications FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================
-- Update ai_credit_orders table
-- ============================================

ALTER TABLE ai_credit_orders
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending'; -- pending, waiting_verify, verified, rejected

-- Update existing orders
UPDATE ai_credit_orders 
SET payment_status = 'verified' 
WHERE status = 'approved';

UPDATE ai_credit_orders 
SET payment_status = 'rejected' 
WHERE status = 'rejected' AND payment_status IS NULL;
