-- Admin Role Setup

-- Tambahkan kolom role ke tabel profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));

-- Buat RLS policy untuk admin
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('admin', 'super_admin')));

-- Buat fungsi untuk mengecek role admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = $1 
    AND profiles.role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Jadikan user tertentu sebagai admin secara manual
-- Ganti 'your-user-id-here' dengan UUID user yang ingin dijadikan admin
-- UPDATE profiles SET role = 'super_admin' WHERE user_id = 'your-user-id-here';
