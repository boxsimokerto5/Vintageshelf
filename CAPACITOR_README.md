# Panduan Membangun APK & AAB Android (Google Play Store)

Aplikasi **Vintage Bookshelf** telah dikonfigurasi penuh dengan arsitektur native Android Capacitor, dukungan pembaca PDF langsung, dan alur pembuatan otomatis (*automated build*) menggunakan **GitHub Actions** serta perintah lokal.

---

## 📋 Informasi Konfigurasi Android

| Konfigurasi | Nilai | Keterangan |
|---|---|---|
| **Package Name (Application ID)** | `com.vintage.bookshelf` | Format standar Google Play Store |
| **App Name** | `Vintage Bookshelf` | Nama aplikasi di peluncur HP |
| **Version Code** | `1` | Nomor build perdana |
| **Version Name** | `1.0.0` | Versi tampilan aplikasi |
| **Target SDK** | Android 14+ (API 34/35) | Memenuhi syarat terbaru Google Play |
| **Min SDK** | Android 7.0 (API 24+) | Kompatibel dengan 98%+ perangkat Android |

---

## 🔑 Informasi Signature Key (Play Store Keystore)

Workflow otomatis telah menyiapkan kunci tanda tangan produksi resmi (*Production Keystore*) dengan standar enkripsi **RSA 2048-bit** (masa berlaku 10.000 hari / ~27 tahun):

- **Nama Berkas Keystore**: `vintage-bookshelf-release.keystore`
- **Alias Kunci**: `vintage_bookshelf`
- **Password Keystore**: `vintagepass2026`
- **Password Kunci**: `vintagepass2026`
- **Organisasi**: `CN=Vintage Bookshelf, OU=Mobile Library, O=Vintage Bookshelf, L=Jakarta, ST=DKI, C=ID`

> 💡 **Penting**: File `.keystore` dan password di atas otomatis dibuat dan disertakan pada hasil unduhan (*Artifacts*) GitHub Actions. Simpan berkas ini baik-baik untuk keperluan pembaruan (*update*) aplikasi di kemudian hari.

---

## 🚀 Cara 1: Otomatis via GitHub Actions (Rekomendasi Tanpa Perlu Install Android Studio)

File workflow telah dibuat di `.github/workflows/build-android.yml`:

1. Buka repositori proyek ini di **GitHub**.
2. Masuk ke tab **Actions** di bagian atas.
3. Di menu kiri, pilih **"Build Android APK & AAB (Signed for Play Store)"**.
4. Klik tombol **Run workflow** > pilih branch `main` > klik **Run workflow**.
5. Tunggu proses build selesai (~3-5 menit).
6. Di bagian bawah halaman hasil build (**Artifacts**), Anda dapat langsung mengunduh:
   - **`VintageBookshelf-APK-v1`**: File `.apk` siap diinstal langsung di HP mana pun (*sideload/direct install*).
   - **`VintageBookshelf-AAB-v1`**: File `.aab` (*Android App Bundle*) siap diunggah ke Google Play Console.
   - **`VintageBookshelf-Keystore-Credentials`**: Berkas `.keystore` beserta catatan kredensialnya.

---

## 💻 Cara 2: Membangun Secara Lokal di Laptop / Komputer

Jika Anda ingin mem-build langsung di laptop menggunakan terminal:

### 1. Buat Keystore Produksi (Cukup Sekali)
```bash
npm run android:keystore
```

### 2. Build Signed APK (Langsung Siap Pakai di HP)
```bash
npm run android:apk
```
*Hasil APK akan berada di:*  
`android/app/build/outputs/apk/release/app-release.apk`

### 3. Build Signed AAB (Untuk Google Play Store)
```bash
npm run android:aab
```
*Hasil AAB akan berada di:*  
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 📄 Kemudahan Upload & Pembacaan PDF di Android

Aplikasi ini sudah dipasangi konfigurasi khusus agar pengguna dapat membaca dan mengimpor PDF dengan sangat mudah di Android:

1. **Intent-Filter Terintegrasi (`VIEW` & `SEND`):**
   - Saat pengguna mengetuk file PDF di **WhatsApp, Pengelola Berkas (File Manager), Folder Download, atau Email**, Android akan menawarkan pilihan untuk langsung membuka file tersebut dengan **Vintage Bookshelf**.
2. **Izin Membaca Berkas Lengkap:**
   - Termasuk `READ_EXTERNAL_STORAGE` dan `READ_MEDIA_IMAGES` serta `requestLegacyExternalStorage="true"` untuk kompatibilitas membaca berkas di berbagai versi Android.
3. **Penyimpanan Lokal Offline 100% (IndexedDB):**
   - PDF yang dibuka/diimpor akan tersimpan di basis data internal HP, sehingga bisa dibaca kembali secara offline kapan saja tanpa koneksi internet.
4. **Layar Tetap Menyala (*Wake Lock*):**
   - Layar HP tidak akan redup atau mati sendiri saat pengguna sedang khusyuk membaca kitab/buku.
5. **Dukungan Tombol Fisik Back:**
   - Menekan tombol kembali di HP akan menutup buku dan kembali ke rak buku tanpa menutup aplikasi secara mendadak.

