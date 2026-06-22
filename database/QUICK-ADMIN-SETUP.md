# Cara Cepat Menjadikan User Sebagai Admin

## Langkah 1: Login ke Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Cuanly Anda

## Langkah 2: Buka SQL Editor

1. Klik menu **SQL Editor** di sidebar kiri
2. Klik **New query**

## Langkah 3: Jalankan Query Pertama

Jalankan query ini untuk melihat daftar user dan ID mereka:

```sql
SELECT * FROM profiles;
```

Anda akan melihat tabel dengan kolom `user_id`. Salin `user_id` Anda (user yang ingin dijadikan admin).

## Langkah 4: Jadikan User Sebagai Admin

Ganti `'your-user-id-here'` dengan user_id yang Anda salin, lalu jalankan:

```sql
UPDATE profiles 
SET role = 'super_admin' 
WHERE user_id = 'your-user-id-here';
```

Contoh:
```sql
UPDATE profiles 
SET role = 'super_admin' 
WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
```

## Langkah 5: Verifikasi

Jalankan query ini untuk memastikan role sudah terupdate:

```sql
SELECT user_id, role FROM profiles;
```

## Selesai!

Sekarang user tersebut sudah menjadi **super_admin** dan bisa mengakses:
- `/dashboard/admin` - Admin Dashboard
- `/dashboard/admin/ai-credit-orders` - Verifikasi Pesanan Kredit

Menu admin akan otomatis muncul di sidebar.

---

## Catatan:

Jika tabel `profiles` belum memiliki kolom `role`, jalankan terlebih dahulu:

```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));
```
