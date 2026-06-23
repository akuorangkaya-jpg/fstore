# Fstore - Transparansi Keuangan

Website transparansi keuangan untuk organisasi Fstore. Dibuat dengan HTML, CSS, dan JavaScript murni, dengan data dari Google Sheets.

## Fitur

- **Intro Animasi**: Tampilan intro dengan logo dan animasi geometris saat pertama kali membuka website
- **Pemilihan Peran**: Pilih antara "Stakeholder" (membutuhkan PIN) atau "Viewer" (akses terbatas)
- **PIN Gate**: Sistem PIN sederhana untuk akses stakeholder (PIN default: 072201)
- **Home**: Halaman beranda dengan informasi tentang Fstore, fitur, dan catatan untuk viewer
- **Dashboard**: Ringkasan total pendapatan, pengeluaran, dan saldo saat ini, beserta grafik aliran kas bulanan dan transaksi terbaru
- **Transaksi**: Tabel semua transaksi dengan fitur filter (kategori, tanggal, bulan) dan pencarian
- **Panduan**: Panduan untuk menambah transaksi baru ke Google Sheets
- **Desain Modern**: Tampilan dengan warna-warna cerah, animasi halus, dan header dengan efek gelombang warna

## Struktur File

- index.html (Dashboard)
- transaksi.html (Transaksi)
- panduan.html (Panduan)
- home.html (Home)
- style.css (Styling)
- config.js (Konfigurasi Google Sheets)
- data.js (Fungsi fetch dan parsing data)
- dashboard.js (Logika dashboard)
- transaksi.js (Logika transaksi)
- auth.js (Logika autentikasi, intro, dan peran)
- logo-fstore.png (Logo Fstore)
- README.md (Dokumentasi)

## Cara Setup

### 1. Buat Google Sheets

Buat Google Sheets baru dengan kolom-kolom berikut (urutan harus sesuai):

| Kolom | Nama Kolom | Keterangan |
|-------|------------|------------|
| A | Tanggal | Format YYYY-MM-DD. Tanggal transaksi ini juga yang akan digunakan untuk label "Terakhir diperbarui" |
| B | Kategori | "Pendapatan" atau "Pengeluaran" |
| C | Deskripsi | Deskripsi transaksi |
| D | Pendapatan | Jumlah pendapatan (angka tanpa format) |
| E | Pengeluaran | Jumlah pengeluaran (angka tanpa format) |
| F | Catatan | Catatan tambahan (opsional) |
| G | Bukti | Link Google Drive ke bukti transaksi (opsional) |

Untuk memperbarui label "Terakhir diperbarui", bendahara hanya perlu menambahkan baris transaksi baru dengan tanggal yang benar di kolom A (Tanggal). Tidak perlu kolom tambahan seperti "UpdatedAt".

### 2. Bagikan Google Sheets

1. Klik "Bagikan" di pojok kanan atas Google Sheets
2. Ubah akses menjadi "Siapa saja yang memiliki tautan dapat melihat"
3. Salin tautan tersebut

### 3. Dapatkan Google Sheets ID

Dari tautan Google Sheets, salin ID-nya. Contoh:
Jika tautan adalah `https://docs.google.com/spreadsheets/d/1234567890abcdefghijklmnopqrstuvwxyz/edit`, maka ID-nya adalah `1234567890abcdefghijklmnopqrstuvwxyz`

### 4. Konfigurasi Website

Buka file `config.js` dan ganti nilai `GOOGLE_SHEETS_ID` dengan ID Google Sheets Anda:

```javascript
const CONFIG = {
  GOOGLE_SHEETS_ID: 'GANTI_DENGAN_ID_GOOGLE_SHEETS_ANDA',
  // ...
};
```

### 5. Deploy ke GitHub Pages

1. Push semua file ke repository GitHub
2. Buka Pengaturan (Settings) repository
3. Gulir ke bagian "Pages"
4. Di "Source", pilih "Deploy from a branch"
5. Pilih branch `main` (atau `master`) dan folder `/ (root)`
6. Klik "Save"

Website Anda akan segera live di alamat: `https://username.github.io/repository-name/`

## Catatan Keamanan

Sistem PIN yang digunakan adalah client-side saja dan **bukan** sistem keamanan yang sesungguhnya. Jangan gunakan PIN yang sama dengan akun penting Anda, dan jangan simpan informasi rahasia di website ini.

## Teknologi yang Digunakan

- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js (untuk grafik)
- Google Sheets (sebagai database)

## Lisensi

MIT
