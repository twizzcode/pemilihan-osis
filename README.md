# PILKOSPAPI — Pemilihan Ketua OSPA & OSPI

Aplikasi pemilihan ketua OSPA & OSPI berbasis web dengan pemisahan paslon **Putra** dan
**Putri**. Dirancang untuk dijalankan sepenuhnya di server sendiri (VPS) tanpa
layanan eksternal — database dan foto tersimpan lokal.

## Fitur

- **Login pemilih** dengan Nama Lengkap + NIS. NIS berfungsi sebagai kunci
  validasi (gender otomatis terdeteksi) dan penanda satu-NIS-satu-suara.
- **Paslon dipisah per gender** — pemilih hanya melihat paslon sesuai kategorinya.
- **Detail paslon** lengkap dengan foto (rasio 3:4), visi, misi, program, dan
  deskripsi tambahan.
- **Setelah memilih langsung keluar** dan diarahkan ke halaman terima kasih.
- **Portal admin** untuk mengelola:
  - Pemilihan (multi-event, satu aktif, jadwal buka/tutup otomatis).
  - Paslon (tambah/edit/hapus + upload foto).
  - Data pemilih (import CSV atau input manual).
  - Rekap hasil dengan grafik, peringkat suara, dan daftar yang belum memilih.
  - Pengaturan profil & ganti password.

## Teknologi

- **Next.js** (App Router) + TypeScript
- **shadcn/ui** untuk komponen & layout
- **SQLite** via **Drizzle ORM** (`better-sqlite3`, mode WAL)
- **Penyimpanan foto**: filesystem lokal di folder `storage/`
- **Autentikasi**: cookie sesi bertanda tangan (HMAC), password di-hash bcrypt

## Menjalankan Secara Lokal

```bash
bun install          # atau npm install
cp .env.example .env.local
bun run dev
```

Buka http://localhost:3000 (halaman pemilih) dan
http://localhost:3000/admin/login (portal admin).

**Akun admin default:** `admin` / `admin123` — segera ganti di menu
**Pengaturan**.

Pada saat pertama dijalankan, aplikasi otomatis membuat file `data.db`,
menjalankan migrasi, dan membuat akun admin default.

## Variabel Lingkungan

| Variabel         | Default       | Keterangan                                    |
| ---------------- | ------------- | --------------------------------------------- |
| `DATABASE_PATH`  | `./data.db`   | Lokasi file SQLite.                           |
| `STORAGE_DIR`    | `./storage`   | Folder penyimpanan foto paslon.               |
| `SESSION_SECRET` | (dev default) | **Wajib diganti** dengan string acak panjang. |

## Alur Import CSV Pemilih

Format kolom: `NIS, Nama, Kelas, Gender` (baris header opsional). Pemisah boleh
koma, titik-koma, atau tab. Kolom gender menerima `L/P`, `Putra/Putri`, atau
`male/female`.

```
NIS,Nama,Kelas,Gender
1001,Ahmad Fauzi,XI IPA 1,L
2001,Siti Nurhaliza,XI IPS 1,P
```

## Deploy ke VPS

Data persisten ada di dua tempat: file `data.db` dan folder `storage/`. Keduanya
**harus berada di volume/direktori persisten** agar tidak hilang saat redeploy.

1. Build aplikasi:

   ```bash
   bun install
   bun run build
   bun run start        # menjalankan server produksi di port 3000
   ```

2. Set variabel lingkungan di produksi (mis. via `.env.production` atau systemd):

   ```
   DATABASE_PATH=/var/lib/pilkospapi/data.db
   STORAGE_DIR=/var/lib/pilkospapi/storage
   SESSION_SECRET=<string-acak-panjang>
   NODE_ENV=production
   ```

3. Pastikan folder `/var/lib/pilkospapi/` ada dan bisa ditulis oleh proses server.
   Dengan begitu, mengganti/men-deploy ulang kode tidak menghapus data.

4. (Disarankan) Jalankan di balik reverse proxy (Nginx/Caddy) untuk HTTPS.

> Catatan: `better-sqlite3` memerlukan build native. Pastikan VPS memiliki
> `build-essential` / `python3` saat `bun install` / `npm install`.

## Skrip

| Perintah             | Fungsi                                   |
| -------------------- | ---------------------------------------- |
| `bun run dev`        | Menjalankan server pengembangan.         |
| `bun run build`      | Build produksi.                          |
| `bun run start`      | Menjalankan hasil build produksi.        |
| `bun run lint`       | Menjalankan ESLint.                      |
| `bunx drizzle-kit generate` | Membuat migrasi dari perubahan schema. |
