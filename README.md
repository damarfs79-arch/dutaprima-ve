# Duta Prima SMK PGRI 05 — Vue 3 + Tailwind

Implementasi koding dari desain PDF (4 halaman) menggunakan Vue 3 (Composition API), Vue Router, dan Tailwind CSS. Fully responsive (mobile, tablet, desktop).

## Halaman
- `/` — Beranda (hero, pilar utama, visi & misi, CTA pendaftaran)
- `/galeri-duta` — Galeri Kebanggaan (filter kategori)
- `/daftar-duta` — Daftar Duta Siswa (search + filter kelas + pagination)
- `/pendaftaran` — Formulir Pendaftaran (alur seleksi + form dengan upload foto)

## Cara Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Build Production

```bash
npm run build
npm run preview
```

## Struktur

```
src/
  components/   NavBar.vue, SiteFooter.vue
  views/        HomeView.vue, GalleryView.vue, DutaListView.vue, RegisterView.vue
  router/       index.js
  assets/       main.css (Tailwind)
```

## Catatan
- Gambar pada Galeri dan Daftar Duta memakai placeholder dari Unsplash — ganti dengan foto asli sekolah di folder `src/assets` lalu update path `img` di masing-masing view.
- Warna brand (oranye, amber, coklat) diatur di `tailwind.config.js` pada bagian `theme.extend.colors.brand` — ubah di sana untuk menyesuaikan identitas visual.
- Form pendaftaran saat ini hanya simulasi (menampilkan pesan sukses), belum terhubung ke backend/API.
