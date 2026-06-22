# Setup Supabase Storage untuk Bukti Transfer

## 1. Buat Storage Bucket
1. Buka **Supabase Dashboard**
2. Pilih project Cuanly Anda
3. Klik menu **Storage**
4. Klik **New Bucket**
5. Isi nama bucket: `payment_proofs`
6. Pilih **Public bucket** (Atau private, tapi public lebih mudah untuk preview)
7. Klik **Create Bucket**

## 2. Atur RLS Policy untuk Storage
Di halaman Storage, klik menu **Policies** (di sebelah kanan) dan buat policy berikut:

### Policy 1: User bisa upload file sendiri
- **Policy name**: `Users can upload own payment proofs`
- **Allowed operation**: `INSERT`
- **Policy definition**:
  ```sql
  bucket_id = 'payment_proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- **Role**: `authenticated`

### Policy 2: User bisa melihat file sendiri
- **Policy name**: `Users can view own payment proofs`
- **Allowed operation**: `SELECT`
- **Policy definition**:
  ```sql
  bucket_id = 'payment_proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- **Role**: `authenticated`

### Policy 3: Admin bisa melihat semua file
- **Policy name**: `Admins can view all payment proofs`
- **Allowed operation**: `SELECT`
- **Policy definition**:
  ```sql
  bucket_id = 'payment_proofs'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
  ```
- **Role**: `authenticated`

## 3. Atur CORS (Opsional tapi Recommended)
Di halaman Storage, klik **Settings** > **CORS Configuration**

Tambahkan origin:
```
http://localhost:3000
```
(Atau domain production Anda)

## 4. Jalankan Cleanup Script
Untuk menghapus file lama (lebih dari 7 hari):

```bash
npm run cleanup:proofs
```

Anda bisa menjalankan script ini:
- Secara manual tiap minggu
- Atau setup cron job di server
- Atau pakai Supabase Edge Function dengan cron (untuk auto)

## 5. Test Upload
1. Buka aplikasi Cuanly
2. Login sebagai user
3. Pilih paket credit
4. Upload file bukti transfer
5. Cek di Storage bucket, file harus ada dan ter-compress!
