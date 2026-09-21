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

Deploy memakai **bundle standalone** (semua dependency ikut, tak perlu build di
server). Yang penting: **database (`data.db`) dan folder `storage/` tidak boleh
ikut ter-rsync**, agar data tidak terhapus walau pakai `--delete`.

### 1. Build di komputer dev

```bash
bun install
bun run build:standalone      # output di .next/standalone/
```

### 2. Kirim ke server

```bash
rsync -avz --delete \
  --exclude='.env' \
  --exclude='data.db' \
  --exclude='data.db-shm' \
  --exclude='data.db-wal' \
  --exclude='storage/' \
  .next/standalone/ \
  twizz@43.156.14.234:/var/www/osis-sma/
```

> Exclude `data.db*`, `storage/`, dan `.env` **wajib** ada supaya rsync tidak
> menghapus database, foto, dan konfigurasi di server.

### 3. Setup awal di VPS (sekali saja)

```bash
# a) Buat folder data persisten (di LUAR folder deploy)
sudo mkdir -p /var/lib/pilkospapi/storage
sudo chown -R $USER:$USER /var/lib/pilkospapi

# b) Buat file .env di folder deploy
cd /var/www/osis-sma
cp .env.example .env
nano .env        # isi SESSION_SECRET (openssl rand -hex 32)

# c) Jalankan (test dulu di foreground)
bun server.js    # atau: node server.js
```

Buka `http://<ip-vps>:3000`. Login admin: `admin` / `admin123` (segera ganti
di menu Pengaturan).

### 4. Jalankan permanen (systemd)

Buat `/etc/systemd/system/pilkospapi.service`:

```ini
[Unit]
Description=PILKOSPAPI (Pemilihan OSPA & OSPI)
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/osis-sma
EnvironmentFile=/var/www/osis-sma/.env
ExecStart=/usr/bin/bun server.js
Restart=always
RestartSec=3
User=twizz

[Install]
WantedBy=multi-user.target
```

Lalu:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now pilkospapi
sudo systemctl status pilkospapi     # cek status
```

### 5. Update (deploy ulang)

Ulangi langkah 1–2, lalu:

```bash
sudo systemctl restart pilkospapi
```

> **Penting:** karena `data.db` & `storage/` dikecualikan dari rsync dan
> `DATABASE_PATH`/`STORAGE_DIR` diarahkan ke `/var/lib/pilkospapi/`, data
> pemilih, paslon, suara, dan foto **aman** setiap deploy ulang.

> (Disarankan) Jalankan di balik reverse proxy (Nginx/Caddy) untuk HTTPS.

## Skrip

| Perintah              | Fungsi                                                       |
| --------------------- | ------------------------------------------------------------ |
| `bun run dev`         | Menjalankan server pengembangan.                             |
| `bun run build`       | Build produksi biasa (`.next`).                              |
| `bun run build:standalone` | Build bundle mandiri di `.next/standalone/` untuk di-rsync. |
| `bun run start`       | Menjalankan hasil build produksi.                            |
| `bun run lint`        | Menjalankan ESLint.                                          |
| `bunx drizzle-kit generate` | Membuat migrasi dari perubahan schema.                |
