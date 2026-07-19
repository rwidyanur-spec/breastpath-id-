# BreastPath ID

🔬 Alat bantu **gratis dan open source** untuk menyusun laporan patologi anatomi keganasan epitelial payudara — oleh dr. Rizki Widya Nur, Sp.PA.

Grading Nottingham otomatis, staging AJCC 8th edition, kategori HER2 sesuai ASCO/CAP, dan narasi laporan Bahasa Indonesia — semuanya berjalan langsung di browser. **Tidak ada AI, tidak ada server, tidak ada biaya.**

## Demo

Setelah di-deploy: `https://USERNAME.github.io/breastpath-id` (ganti USERNAME dengan akun GitHub-mu).

## Struktur project

```
breastpath-id/
├── src/
│   ├── App.jsx     ← seluruh aplikasi (form + logika penyusun laporan)
│   └── main.jsx     ← entry point React
├── index.html
├── package.json
├── vite.config.js
└── LICENSE
```

## Menjalankan di komputer sendiri (opsional, untuk development)

Butuh [Node.js](https://nodejs.org) terpasang dulu.

```
npm install
npm run dev
```

Buka `http://localhost:5173` di browser.

## Cara upload ke GitHub

1. Buat repository baru di GitHub bernama `breastpath-id` (public, biar bisa diakses gratis lewat GitHub Pages).
2. Di folder ini, jalankan lewat terminal:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/breastpath-id.git
   git push -u origin main
   ```
   Ganti `USERNAME` dengan username GitHub-mu (juga di `package.json` bagian `homepage`, dan `vite.config.js` bagian `base` kalau nama repo bukan `breastpath-id`).

## Cara publish ke GitHub Pages (gratis, otomatis dapat link)

```
npm install
npm run deploy
```

Perintah ini otomatis build lalu upload hasilnya ke branch `gh-pages`. Setelah itu:

1. Buka repository di GitHub → **Settings** → **Pages**.
2. Di bagian **Source**, pilih branch **gh-pages**.
3. Simpan. Tunggu 1-2 menit, situsnya aktif di `https://USERNAME.github.io/breastpath-id`.

## Update setelah revisi

Setiap ada perubahan kode:
```
git add .
git commit -m "Deskripsi perubahan"
git push
npm run deploy
```

## Lisensi

MIT — bebas dipakai, dimodifikasi, dan disebarluaskan siapa saja, termasuk untuk keperluan komersial, selama mencantumkan atribusi (lihat file `LICENSE`).

## Disclaimer

Alat bantu penyusunan laporan, bukan pengganti penilaian klinis. Semua hasil wajib diverifikasi oleh dokter spesialis patologi anatomi sesuai temuan mikroskopis aktual sebelum digunakan.
