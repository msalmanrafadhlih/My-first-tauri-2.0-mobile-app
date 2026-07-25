# Gemini AI Chat Client (Client-Side)

Aplikasi chat AI berbasis Gemini API buatan Google yang berjalan **100% di sisi client** (tanpa backend/server khusus). Dibangun menggunakan **React 19**, **Tailwind CSS v4**, **shadcn UI design system**, dan disiapkan untuk **Tauri 2.0 Mobile / Desktop**.

---

## 📌 Fitur Utama Aplikasi

- 🔑 **Form Setup Sebelum Chat**: Mengharuskan pengguna memasukkan **API Key Gemini** milik sendiri dan memilih **Model Gemini** sebelum masuk ke layar chat.
- 🗂️ **Manajemen Riwayat Chat (Multi-Session)**:
  - 📝 **Simpan & Muat Riwayat**: Tersimpan secara lokal per sesi di `localStorage`.
  - ➕ **Percakapan Baru (New Chat)**: Membuat sesi percakapan baru dengan satu klik.
  - 🏷️ **Judul Otomatis**: Judul percakapan otomatis dibuat dari pertanyaan pertama pengguna.
  - 🔍 **Fitur Cari Riwayat**: Memudahkan pencarian sesi percakapan lama.
  - 🗑️ **Hapus Percakapan**: Menghapus percakapan tertentu atau seluruh riwayat.
- 🤖 **Pilihan Model Gemini**:
  - `gemini-2.5-flash` (Rekomendasi Utama - Cepat & Cerdas)
  - `gemini-2.5-pro` (Penalaran Tingkat Tinggi)
  - `gemini-2.0-flash` (Sangat Cepat & Responsif)
  - `gemini-1.5-flash` & `gemini-1.5-pro`
  - Opsi Nama Model Kustom (Custom Model ID)
- 💬 **Streaming Real-time Chat**: Menggunakan Server-Sent Events (SSE) langsung dari REST API Google Gemini.
- ⚙️ **Ubah Pengaturan Kapan Saja**: Tombol *Pengaturan* di navigasi atas untuk mengubah API Key atau beralih Model Gemini.
- 🎨 **Modern Dark Glassmorphism UI**: Tampilan responsif dengan Tailwind CSS, Lucide Icons, dan komponen khas shadcn UI.

---

## 🛠️ Langkah-Langkah Instalasi & Penggunaan

### 1. Install Dependencies
Proyek ini sudah dilengkapi dengan semua paket yang dibutuhkan. Cukup jalankan:

```bash
pnpm install
# atau jika menggunakan bun:
bun install
```

### 2. Jalankan Mode Web Dev
Untuk mencoba aplikasi langsung di browser:

```bash
pnpm dev
# atau:
bun run dev
```
Akses di URL lokal (biasanya `http://localhost:1420`).

### 3. Jalankan Mode Desktop / Tauri
Untuk menjalankan sebagai aplikasi desktop native Tauri:

```bash
pnpm desktop
# atau:
bun run desktop
```

### 4. Jalankan Mode Mobile / Android
Untuk menjalankan di emulator/device Android:

```bash
pnpm android
# atau:
bun run android
```

---

## 📂 Struktur Proyek

```text
first-tauri-2.0-mobile-app/
├── components.json              # Konfigurasi shadcn UI CLI
├── index.html                   # HTML Entry Point
├── package.json                 # Dependencies (React, Tailwind, Lucide)
├── tsconfig.json                # TypeScript & Path Alias (@/*)
├── vite.config.ts               # Vite configuration + React & Tailwind plugin
└── src/
    ├── main.tsx                 # React Mount Entry
    ├── App.tsx                  # State manager (Form Config vs Chat Screen)
    ├── styles.css               # Tailwind CSS v4 & shadcn Design Tokens
    ├── lib/
    │   └── utils.ts             # Function helper `cn` (clsx + tailwind-merge)
    ├── services/
    │   ├── gemini.ts            # Client-side Gemini REST API & SSE Streaming Service
    │   └── history.ts           # Service Manajemen Riwayat Chat Multi-Session
    └── components/
        ├── ApiKeyForm.tsx       # Form Pemilihan Model & Input API Key
        ├── Sidebar.tsx          # Panel Samping Riwayat Chat & Pencarian
        └── ChatInterface.tsx    # Layar utama Chat UI & Header
```
