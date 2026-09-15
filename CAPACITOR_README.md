# Panduan Membangun APK Android dengan Capacitor

Proyek ini telah dikonfigurasi secara lengkap dengan arsitektur **Capacitor 7**, optimasi memori RAM tingkat lanjut, dan integrasi fitur bawaan Android (seperti tombol fisik Back, mode layar penuh imersif, dan pencegah layar tidur).

---

## ⚡ Fitur Native yang Sudah Terpasang:
1. **Offline 100% (Tanpa CDN Internet):**
   - Skrip worker PDF (`pdf.worker.min.mjs`) di-bundle langsung ke dalam aset lokal aplikasi.
   - Kitab dan berkas PDF dapat dibuka seketika tanpa membutuhkan kuota internet.
2. **Optimasi Memori (Blob URL & RAM Revocation):**
   - Halaman PDF yang dirender tidak menggunakan teks Base64 besar, melainkan Blob pointer langsung ke GPU/WebView.
   - Halaman di luar jendela baca langsung dibersihkan dari RAM HP (*garbage collection friendly*).
3. **Mode Performa Ringan (60 FPS):**
   - Sakelar di menu pengaturan untuk HP dengan RAM 2GB–3GB agar mematikan efek bayangan berat dan fokus pada kelancaran membaca.
4. **Layar Tetap Menyala (Keep Screen Awake):**
   - Layar tidak akan redup atau mati saat pengguna sedang membaca kitab.
5. **Tombol Fisik Back Android (Hardware Back Button):**
   - Menekan tombol kembali di HP akan menutup kitab dan kembali ke rak buku antik secara elegan, bukan keluar dari aplikasi secara mendadak.
6. **Mode Layar Penuh Imersif (Immersive Fullscreen):**
   - Status bar jam dan baterai otomatis disembunyikan saat membaca kitab agar layar terasa luas.

---

## 🛠️ Langkah-Langkah Membangun APK

Jalankan perintah berikut di terminal (laptop/komputer yang sudah terpasang Node.js & Android Studio):

```bash
# 1. Install dependensi
npm install

# 2. Build aplikasi web ke folder dist
npm run build

# 3. Tambahkan platform Android (cukup sekali saat pertama kali)
npx cap add android

# 4. Sinkronkan berkas build ke proyek Android
npx cap sync android

# 5. Buka proyek di Android Studio
npx cap open android
```

### Langkah di Android Studio:
1. Tunggu *Gradle Sync* selesai (biasanya 1–2 menit).
2. Di menu atas Android Studio, pilih **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)** (atau *Generate Signed APK* untuk publikasi Google Play Store).
3. File `.apk` siap diinstal di HP Anda!
