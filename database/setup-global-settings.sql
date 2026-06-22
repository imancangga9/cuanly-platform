-- Enable RLS on global_settings
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

-- Policy untuk admin/superadmin bisa melihat dan mengedit semua global settings
CREATE POLICY "Admins can view all global settings"
ON global_settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can update global settings"
ON global_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can insert global settings"
ON global_settings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Insert default prompt jika belum ada
INSERT INTO global_settings (key, value, description)
VALUES (
  'default_custom_prompt',
  'Anda adalah customer service profesional untuk toko online.
- Selalu jawab dengan ramah dan profesional
- Gunakan bahasa Indonesia yang santai
- Pastikan informasi harga selalu dicantumkan dengan jelas
- Jika ada pertanyaan yang tidak bisa dijawab, arahkan customer untuk menghubungi admin
- Jangan membuat informasi baru yang tidak ada di data produk
- Berikan rekomendasi yang relevan jika memungkinkan',
  'Default custom prompt untuk user baru'
)
ON CONFLICT (key) DO NOTHING;
