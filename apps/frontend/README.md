# Vue 3 + TypeScript + Vite

## Package & Versions

Ringkasan `package.json` untuk `apps/frontend`:

**Versi paket**: 0.0.0

**Scripts**:
```bash
dev: vite
build: vue-tsc -b && vite build
preview: vite preview
```

**Dependencies**:
```text
axios: ^1.17.0
vue: ^3.5.34
```

**DevDependencies**:
```text
@tailwindcss/vite: ^4.3.1
@types/node: ^24.12.3
@vitejs/plugin-vue: ^6.0.6
@vue/tsconfig: ^0.9.1
autoprefixer: ^10.5.0
postcss: ^8.5.15
tailwindcss: ^4.3.1
typescript: ~6.0.2
vite: ^8.0.12
vue-tsc: ^3.2.8
```

Catatan: API base URL dikonfigurasi di `apps/frontend/src/services/api.ts` (default: `http://localhost:3000/api/v1`). Anda bisa menggantinya ke environment variable jika diperlukan.


## Menjalankan Frontend dan Menguji Koneksi ke Backend

1. Masuk ke folder frontend
```bash
cd apps/frontend
```
2. Pasang dependency
```bash
bun install
# atau: npm install
```
3. Jalankan development server
```bash
bun run dev
# atau: npm run dev
```
4. Buka di browser (default Vite): `http://localhost:5173`

Contoh verifikasi koneksi ke backend (asumsi backend berjalan di `http://localhost:3000`):
```bash
curl -sS http://localhost:3000/api/v1/folders/tree | jq
```


## Urutan Langkah (Ringkas)

1. Jalankan backend (lihat `apps/backend/README.md`) dan pastikan API berjalan di `http://localhost:3000`.
2. `cd apps/frontend`
3. `bun install` (atau `npm install`)
4. `bun run dev` (atau `npm run dev`)
5. Buka `http://localhost:5173` dan interaksikan UI.

