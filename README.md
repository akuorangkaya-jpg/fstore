# Fstore - Transparansi Keuangan

Website transparansi keuangan untuk organisasi Fstore. Dibuat dengan HTML, CSS, dan JavaScript murni, dengan data dari Google Sheets.

## Fitur

- **Dashboard**: Ringkasan total pendapatan, pengeluaran, dan saldo saat ini, beserta grafik aliran kas bulanan dan transaksi terbaru.
- **Transaksi**: Tabel semua transaksi dengan fitur filter (kategori, tanggal, bulan) dan pencarian.
- **Panduan**: Panduan untuk menambah transaksi baru ke Google Sheets.

## Cara Setup

### 1. Buat Google Sheets

Buat Google Sheets baru dengan kolom-kolom berikut (urutan harus sesuai):

| Kolom | Nama Kolom | Keterangan |
|-------|------------|------------|
| A     | Tanggal    | Format YYYY-MM-DD |
| B     | Kategori   | "Pendapatan" atau "Pengeluaran" |
| C     | Deskripsi  | Deskripsi transaksi |
| D     | Pendapatan | Jumlah pendapatan (angka tanpa format) |
| E     | Pengeluaran| Jumlah pengeluaran (angka tanpa format) |
| F     | Catatan    | Catatan tambahan (opsional) |
| G     | Bukti      | Link Google Drive ke bukti transaksi (opsional) |

### 2. Bagikan Google Sheets

1. Klik "Bagikan" di pojok kanan atas Google Sheets.
2. Ubah akses menjadi "Siapa saja yang memiliki tautan dapat melihat".
3. Salin tautan tersebut.

### 3. Dapatkan Google Sheets ID

Dari tautan Google Sheets, salin ID-nya. Contoh:

Jika tautan adalah:
`https://docs.google.com/spreadsheets/d/1234567890abcdefghijklmnopqrstuvwxyz/edit`

Maka ID-nya adalah: `1234567890abcdefghijklmnopqrstuvwxyz`

### 4. Konfigurasi Website

Buka file `js/config.js` dan ganti nilai `GOOGLE_SHEETS_ID` dengan ID Google Sheets Anda:

```javascript
const CONFIG = {
  GOOGLE_SHEETS_ID: 'GANTI_DENGAN_ID_GOOGLE_SHEETS_ANDA',
  // ...
};
```

### 5. Deploy ke GitHub Pages

1. Push semua file ke repository GitHub.
2. Buka Pengaturan (Settings) repository.
3. Gulir ke bagian "Pages".
4. Di "Source", pilih "Deploy from a branch".
5. Pilih branch `main` (atau `master`) dan folder `/ (root)`.
6. Klik "Save".

Website Anda akan segera live di alamat: `https://username.github.io/repository-name/`

## Teknologi yang Digunakan

- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js (untuk grafik)
- Google Sheets (sebagai database)

## Lisensi

MIT
