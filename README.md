
# Astro Starter Kit: Minimal

```sh
bun create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun dev`             | Starts local dev server at `localhost:4321`      |
| `bun build`           | Build your production site to `./dist/`          |
| `bun preview`         | Preview your build locally, before deploying     |
| `bun astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

---

# Pocket-AI Mobile App (Tauri 2.0 + Astro + React + Tailwind + DaisyUI)

## 🧠 Rekomendasi Stack Backend (Rust) untuk Pocket-AI

Tauri 2.0 membagi aplikasi menjadi **Frontend** (UI di Webview) dan **Backend** (Host Rust). Untuk aplikasi Pocket-AI Chat, berikut rekomendasi stack/crates backend Rust terbaik:

1. **Local State & User Preferences**:
   - `tauri-plugin-store`: Plugin resmi Tauri untuk menyimpan API Key, preferensi tema, dan setelan chat secara aman di disk (JSON format).
2. **Local Chat History (Database)**:
   - `tauri-plugin-sql` dengan driver **SQLite**: Solusi paling efisien untuk mobile database. Riwayat chat disimpan secara lokal dalam SQLite file di storage HP.
3. **AI Integration (Gemini/OpenAI API)**:
   - `reqwest` (dengan feature `stream`): Untuk fetch API dan melakukan streaming tokens (efek mengetik AI saat membalas).
   - _Alternatif_: Gunakan `tauri-plugin-http` di frontend/backend jika ingin bypass limitasi CORS secara native.
4. **On-Device Local Inference (Offline AI)**:
   - `candle-core` (oleh Hugging Face) atau bindings `ort` (ONNX Runtime): Jika Anda berniat menjalankan model kecil (misalnya Qwen-0.5B atau Llama-3-8B-quantized) langsung di CPU/GPU HP tanpa internet. (Catatan: Butuh optimasi performa memory yang cukup ketat di mobile).

---

## 🚀 Panduan Langkah-Langkah Memulai Project

Ikuti urutan langkah di bawah ini untuk mensetup project dari awal hingga siap ngoding:

### Langkah 1: Masuk ke Nix Development Environment

Buka terminal di root project (`/home/tquilla/.repos/first-tauri-2.0-mobile-app`), lalu ketikkan perintah berikut untuk mengaktifkan environment Nix:

```bash
nix develop --impure
```

_Nix akan mengunduh semua dependency (JDK, Android SDK, Rust Toolchain, Bun) secara otomatis dan masuk ke dev shell._

### Langkah 2: Setup Frontend Astro + React + Tailwind + DaisyUI

Karena kita menggunakan Astro sebagai generator halaman statis (SSG) untuk Tauri, kita setup frontend-nya terlebih dahulu di root folder:

1. **Inisialisasi Astro**:

   ```bash
   bun create astro@latest . -- --template minimal
   ```

   _Pilih: **Yes** untuk install dependencies, **Yes** untuk TypeScript._

2. **Integrasikan React**:

   ```bash
   bun astro add react
   ```

3. **Integrasikan Tailwind CSS**:

   ```bash
   bun astro add tailwind
   ```

4. **Instal DaisyUI**:

   ```bash
   bun add -d daisyui@latest
   ```

5. **Konfigurasi Tailwind untuk DaisyUI**:
   Buka file `tailwind.config.mjs` dan tambahkan daisyui di bagian plugins:
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: ["./src/**/*.{astro,html,js,jsx,md,mdx,sgn,ts,tsx,vue}"],
     theme: {
       extend: {},
     },
     plugins: [require("daisyui")],
   };
   ```

### Langkah 3: Setup Konfigurasi Build Astro (Static Site)

Tauri membutuhkan build frontend berupa static files (HTML, CSS, JS). Kita harus mengatur Astro agar melakukan _Static SSG_:
Buka `astro.config.mjs` dan pastikan isinya seperti berikut:

```javascript
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  output: "static", // Menghasilkan file static di folder 'dist'
  integrations: [react(), tailwind()],
});
```

### Langkah 4: Setup Tauri 2.0

Setelah Astro siap, jalankan tauri generator:

```bash
bun create tauri-app@latest .
```

Saat muncul prompt interaktif:

- **What is your app name?**: `pocket-ai`
- **What window title do you want?**: `Pocket AI`
- **Frontend language**: `TypeScript / JavaScript`
- **Package manager**: `bun`
- **UI template**: `Astro (https://astro.build/)` (atau sesuaikan)
- **Web assets path**: `../dist` (Lokasi output build Astro)
- **Dev server URL**: `http://localhost:4321` (URL local development server Astro)

### Langkah 5: Setup Android Support

Di dalam dev shell, jalankan perintah berikut untuk menginisialisasi folder target mobile:

```bash
android-init
```

_Tauri akan membuat folder `src-tauri/gen/android` berisi konfigurasi gradle project._

### Langkah 6: Membuat Emulator Android (AVD)

Jika Anda belum memiliki emulator Android di laptop Anda:

```bash
make-avd
```

_Script ini akan membuat Android Virtual Device (AVD) bernama `tauri-dev` dengan API 34._

### Langkah 7: Jalankan Aplikasi dalam Mode Development

1. **Jalankan Emulator Android**:
   Buka emulator via CLI atau Android Studio. (Biasanya devenv emulator bisa dinyalakan lewat `emulator @tauri-dev`).
2. **Jalankan Tauri Dev Mode**:
   ```bash
   android-dev
   ```
   _Perintah ini akan menyalakan server development Astro dan melakukan kompilasi Rust ke emulator Android Anda secara real-time._
