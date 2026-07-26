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

<br>
<br>

## Build Manual Secara Umum (Standard Toolchain)

#### Persyaratan Depedencies
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
