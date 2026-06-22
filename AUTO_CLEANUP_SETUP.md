# Panduan Auto-Cleanup Tiap Jam 23 Malam

## Opsi 1: Pakai Node-Cron (Jalankan Script Terus)
Ini cara termudah, script berjalan di background dan otomatis tiap jam 23.

### 1. Install dependensi
```bash
npm install node-cron
```

### 2. Jalankan script auto-cleanup
```bash
npm run auto-cleanup
```

Script akan:
- ✅ Jalankan sekali saat startup
- ✅ Otomatis berjalan setiap hari jam 23:00
- ✅ Check file yang lebih dari 7 hari
- ✅ Log aktivitas ke console

---

## Opsi 2: Windows Task Scheduler (Rekomended untuk Production)
Jika Anda ingin script hanya berjalan saat dibutuhkan (tanpa node berjalan terus), gunakan Task Scheduler.

### 1. Buat File Batch
Buat file `start-cleanup.bat` di folder project:
```batch
@echo off
cd /d "D:\Iman Cangga\Herd\cuanly"
npm run cleanup:proofs
```

### 2. Buka Task Scheduler
- Tekan `Win + R`
- Ketik `taskschd.msc`
- Tekan Enter

### 3. Buat Task Baru
1. Klik **Create Basic Task...** (di sebelah kanan)
2. **Name**: `Cuanly Cleanup Proofs`
3. Klik **Next**
4. Pilih **Daily** → Next
5. Atur **Start time**: `23:00:00` (11 PM)
6. Pilih **Recur every**: `1 days` → Next
7. Pilih **Start a program** → Next
8. **Program/script**: Pilih file `start-cleanup.bat` yang dibuat tadi
9. Klik **Next** → **Finish**

---

## Cek Log
Untuk memastikan script berjalan:
- Opsi 1: Lihat console output
- Opsi 2: Cek di Task Scheduler → History tab

## Catatan
- Pastikan PC/server Anda menyala saat jam 23 malam!
- Jika PC tidak selalu menyala, gunakan layanan cloud seperti Vercel Cron atau Supabase Edge Function.
