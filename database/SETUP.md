# Panduan Setup Database Cuanly

## Langkah-langkah Setup

### 1. Siapkan Environment Variables

Pastikan file `.env.local` Anda memiliki variabel berikut:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

**CATATAN**: `SUPABASE_SERVICE_ROLE_KEY` bersifat rahasia, JANGAN dipublikasikan!

---

### 2. Jalankan SQL Schema di Supabase

Login ke [Supabase Dashboard](https://supabase.com/dashboard), pilih project Anda, lalu buka **SQL Editor**.

#### Opsi A: Gunakan File Schema Gabungan (Rekomendasi)

Copy-paste seluruh isi dari `database/full-schema.sql` ke SQL Editor dan jalankan.

#### Opsi B: Jalankan File Secara Berurutan

Jika Anda ingin setup secara bertahap:

1. Jalankan `database/schema.sql` (tabel dasar)
2. Jalankan `database/schema-v2.sql` (fitur AI & transaksi baru)
3. Jalankan `database/ai-credit-schema.sql` (sistem kredit AI)

---

### 3. Verifikasi Tabel

Setelah menjalankan SQL, pastikan tabel berikut berhasil dibuat di Supabase:

#### Tabel Utama
- `profiles` - profil user
- `products` - produk
- `channels` - channel penjualan
- `expenses` - pengeluaran
- `transactions` - transaksi

#### Tabel AI
- `ai_settings` - pengaturan AI user
- `ai_conversations` - riwayat chat AI
- `product_ai_knowledge` - pengetahuan AI untuk produk
- `product_faq` - FAQ produk

#### Tabel Kredit AI
- `ai_credit_packages` - paket kredit
- `ai_wallet` - dompet kredit user
- `ai_credit_orders` - pesanan pembelian kredit
- `ai_credit_transactions` - riwayat transaksi kredit

---

### 4. Cek Row Level Security (RLS)

Pastikan RLS aktif dan policies sudah dibuat:
- Setiap user hanya bisa melihat/menyunting data mereka sendiri
- Admin bisa mengakses semua data via service role

---

### 5. Test Fitur

Setelah database siap:

1. Jalankan aplikasi: `npm run dev`
2. Register user baru - seharusnya otomatis mendapatkan 25 credit
3. Coba buat pesanan kredit di halaman `/dashboard/ai-credit`
4. Coba generate jawaban AI di halaman `/dashboard/ai`

---

## Troubleshooting

### Error: "Wallet not found"

Pastikan trigger `on_auth_user_created_ai_wallet` berjalan dengan benar. Coba jalankan manual:

```sql
SELECT public.handle_new_user_ai_wallet();
```

### Error: Permission denied pada update wallet

Pastikan:
1. `SUPABASE_SERVICE_ROLE_KEY` sudah di-set di `.env.local`
2. Server actions menggunakan `createServiceRoleClient()` untuk update wallet

### Paket kredit tidak muncul

Pastikan tabel `ai_credit_packages` memiliki data dan `is_active = true`.

---

## Catatan Penting

1. **Service Role Key**: Hanya gunakan di server-side (server actions), jangan di client-side
2. **RLS Policies**: Selalu pastikan kebijakan RLS sesuai kebutuhan keamanan
3. **Backup**: Sebelum mengubah schema, lakukan backup terlebih dahulu
4. **Indexes**: Indexes sudah dibuat untuk performa yang lebih baik

---

## Admin Setup

Untuk verifikasi pesanan, buat halaman admin di `/dashboard/admin/ai-credit-orders`.

Sementara ini, semua user bisa melihat semua pesanan. Untuk production:
1. Tambahkan kolom `role` di tabel `profiles`
2. Tambahkan check admin di server actions
3. Batasi akses halaman admin
