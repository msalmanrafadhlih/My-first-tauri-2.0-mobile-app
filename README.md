# PocketAi (Gemini AI Chat Client)

**PocketAi** adalah aplikasi antarmuka percakapan (*chat client*) berbasis Google Gemini API yang berjalan **100% di sisi klien** (*client-side*). Aplikasi ini dibangun menggunakan **Tauri 2.0**, **React 19**, **TypeScript**, dan **Tailwind CSS v4** untuk memberikan pengalaman obrolan AI yang cepat, ringan, privat, dan responsif di platform Mobile (Android) maupun Desktop.

---

## Tujuan Utama

- **Privasi & Keamanan Data**: Tidak ada server perantara (*backend* khusus) yang menyimpan pesan atau kunci API. Komunikasi dengan API Google Gemini dilakukan langsung dari perangkat pengguna.
- **Kinerja Tinggi & Hemat Sumber Daya**: Menggunakan arsitektur native Tauri 2.0 dengan konsumsi memori dan ukuran paket yang efisien.
- **Fleksibilitas Kunci API & Model**: Memungkinkan pengguna memasukkan Google Gemini API Key milik sendiri (*Bring Your Own Key*) serta memilih berbagai model Gemini sesuai kebutuhan.

---

## Fitur Utama

- **Client-Side Architecture**: Komunikasi langsung dengan REST API Google Gemini melalui SSE (*Server-Sent Events*) untuk pengiriman respons *real-time streaming*.
- **Manajemen Riwayat Chat (Multi-Session)**:
  - Penyimpanan sesi percakapan lokal di `localStorage`.
  - Pembentukan judul percakapan secara otomatis dari pesan pertama.
  - Pencarian, pemuatan ulang, dan penghapusan sesi percakapan.
- **Dukungan Model Gemini**:
  - `gemini-2.5-flash` (Default - Cepat & Efisien)
  - `gemini-2.5-pro` (Penalaran Kompleks)
  - `gemini-2.0-flash`
  - `gemini-1.5-flash` & `gemini-1.5-pro`
  - Opsi penyesuaian Custom Model ID.
- **Desain UI Modern & Multi-Platform**: Antarmuka berbasis *Dark Mode Glassmorphism* yang responsif untuk layar HP (Android) hingga Desktop.

---

## Panduan Instalasi & Penggunaan

### 1. Download Langsung dari GitHub Releases (Rekomendasi Pengguna)

Cara termudah untuk menggunakan PocketAi tanpa perlu melakukan kompilasi kode:

1. Buka halaman **Releases** pada repositori GitHub ini.
2. Unduh berkas biner sesuai perangkat Anda:
   - **Android**: Berkas `app-universal-release.apk`
   - **Desktop**: Berkas paket installer sesuai OS Anda (Linux `.AppImage`/`.deb`, dsb.)
3. Pasang (*install*) berkas yang telah diunduh di perangkat Anda dan jalankan aplikasi.

---

### 2. Build Manual Menggunakan Nix (Rekomendasi Developer NixOS)

Repositori ini menyediakan konfigurasi **Nix Flakes** dan **Devenv** untuk lingkungan pengembangan dan proses *build* yang terisolasi serta reproduktif.

#### Persyaratan
- System dengan [Nix](https://nixos.org/) dan fitur `flakes` diaktifkan.

#### Menjalankan Development Shell
Untuk mengaktifkan *dev environment* dengan seluruh *dependency* (Bun, Rust, Android SDK):
```bash
nix develop
```

#### Build Paket Menggunakan Nix Flakes
Untuk memicu proses kompilasi aplikasi secara terisolasi via Nix:
```bash
nix build
```

---

### 3. Build Manual Secara Umum (Standard Toolchain)

Jika Anda tidak menggunakan Nix, Anda dapat melakukan kompilasi manual menggunakan paket manager standar (`bun` atau `pnpm`) dan Rust toolchain.

#### Persyaratan Sistem
- **Node.js** (v18+) atau **Bun**
- **Rust Toolchain** (terpasang melalui `rustup`)
- *(Opsional)* **Android SDK & NDK** (jika mem-build target Android)

#### Langkah Build & Running

1. **Clone Repositori & Install Dependencies**:
   ```bash
   git clone https://github.com/msalmanrafadhlih/first-tauri-2.0-mobile-app.git
   cd first-tauri-2.0-mobile-app
   bun install
   ```

2. **Menjalankan dalam Mode Development**:
   - Web Browser:
     ```bash
     bun run dev
     ```
   - Desktop App (Tauri):
     ```bash
     bun run desktop
     ```
   - Android App (Tauri):
     ```bash
     bun run android
     ```

3. **Membuat Package Production (Build Biner)**:
   - Build Desktop Application:
     ```bash
     bun run build:desktop
     ```
   - Build Android APK:
     ```bash
     bun run build:android
     ```
   *Hasil kompilasi biner akan tersimpan di direktori `src-tauri/target/release` atau `src-tauri/gen/android/app/build/outputs/apk/`.*

---

## Struktur Proyek

```text
.
├── apps/                        # Sub-packages / aplikasi pendukung
├── src/                         # Frontend React 19 App
│   ├── components/              # Komponen UI (ChatInterface, ApiKeyForm, Sidebar, dll)
│   ├── services/                # Logika API Gemini & Pengelolaan Riwayat (localStorage)
│   ├── lib/                     # Helper & utilitas UI
│   └── styles.css               # Styling Tailwind CSS v4
├── src-tauri/                   # Konfigurasi & Biner Native Tauri 2.0 (Rust)
│   ├── gen/android/             # Environment & Konfigurasi Android Build
│   ├── src/                     # Rust entrypoint (`main.rs`, `lib.rs`)
│   └── tauri.conf.json          # Manifest Konfigurasi Tauri
├── devenv.nix                   # Konfigurasi Lingkungan Pengembang Devenv
├── flake.nix                    # Definisi Nix Flakes untuk Build & DevShell
├── package.json                 # Manifest Dependency Klien & Script Build
└── vite.config.ts               # Konfigurasi Bundler Vite
```

---

## Lisensi

Proyek ini dirilis di bawah lisensi [MIT License](LICENSE).
