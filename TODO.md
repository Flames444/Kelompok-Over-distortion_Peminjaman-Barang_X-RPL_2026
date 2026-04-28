# TODO: Perbaikan Tampilan Nama Peminjam

## Status
- [x] 1. Perbaiki `1data.html` — sudah bersih (tidak ada inline script bentrok)
- [x] 2. Perbaiki `1.pinjam.html` — inline script redundan dihapus
- [x] 3. Verifikasi `app.js` — null-check & optional chaining sudah ada

## Hasil
- `app.js` menangani render sepenuhnya untuk semua halaman
- Nama peminjam ditampilkan dengan fallback `|| '-'` jika kosong
- Tidak ada lagi konflik antara inline script dan `app.js`
