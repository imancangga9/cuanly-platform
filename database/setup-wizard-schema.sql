-- Schema untuk Setup Wizard Cuanly
-- Menyimpan progress setup user

-- Tambahkan kolom ke tabel profiles untuk menandai apakah setup sudah selesai
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS current_setup_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS setup_completed_at TIMESTAMPTZ;

-- Buat tabel untuk menyimpan setup progress sementara (opsional, untuk rollback)
CREATE TABLE IF NOT EXISTS setup_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step INTEGER NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, step)
);

-- Enable RLS
ALTER TABLE setup_progress ENABLE ROW LEVEL SECURITY;

-- Policy untuk user hanya bisa melihat dan mengedit progress sendiri
CREATE POLICY "Users can view their own setup progress" 
  ON setup_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own setup progress" 
  ON setup_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own setup progress" 
  ON setup_progress FOR UPDATE 
  USING (auth.uid() = user_id);
