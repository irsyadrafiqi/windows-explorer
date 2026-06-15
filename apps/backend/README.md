<!-- # Elysia with Bun runtime -->

<!-- ## Getting Started
To get started with this template, simply paste this command into your terminal:
```bash
bun create elysia ./elysia-example
``` -->


## Package & Versions

Ringkasan `package.json` untuk `apps/backend` (agar pengguna tidak bingung):

**Versi paket**: 1.0.50

**Scripts**:
```bash
dev: bun run --watch src/index.ts
test: echo "Error: no test specified" && exit 1
```

**Dependencies** (utama):
```text
@elysiajs/cors: ^1.4.2
@elysiajs/swagger: ^1.3.1
@prisma/client: 6.16.2
dotenv: ^17.4.2
elysia: latest
prisma: 6.16.2
zod: ^4.4.3
```

**DevDependencies**:
```text
bun-types: latest
vitest: ^4.1.8
```

Rekomendasi runtime / tooling:
- `bun` (development & script runner)
- MySQL (koneksikan melalui `DATABASE_URL` di `apps/backend/.env`)
- Prisma v6 (gunakan `bun prisma generate` dan `bun prisma db seed`)

Jika ingin, tambahkan file `apps/backend/.env.example` dengan contoh `DATABASE_URL`.


## Menjalankan Backend dan Menguji API

Prasyarat: `bun` terpasang, MySQL berjalan, dan file `apps/backend/.env` berisi `DATABASE_URL` yang benar.

- Install dependencies:
```bash
cd apps/backend
bun install
```

- Konfigurasi environment (`apps/backend/.env`):
```text
DATABASE_URL="mysql://root@localhost:3306/windows_explorer_db"
```

- Generate Prisma Client:
```bash
cd apps/backend
bun prisma generate
```

- Seed database:
```bash
bun prisma db seed
```

- Jalankan backend:
```bash
cd apps/backend
bun run src/index.ts
```

- Contoh tes endpoint (server default: `http://localhost:3000`):
```bash
curl -sS http://localhost:3000/api/v1/folders/tree | jq
curl -sS http://localhost:3000/api/v1/folders/2/children | jq
curl -sS http://localhost:3000/api/v1/folders/2/content | jq
curl -sS "http://localhost:3000/api/v1/folders/search?q=documents" | jq
```

- Bentuk respon yang diharapkan:
	- `/folders/tree` → tree folder (`id`, `name`, `children`)
	- `/:id/content` → `{ "folders": [...], "files": [...] }`

- Troubleshooting singkat:
	- Jika terjadi error Prisma: jalankan ulang `bun prisma generate`.
	- Jika DB gagal konek: cek `DATABASE_URL` dan MySQL.
	- Jika server tidak jalan: periksa log terminal untuk error TypeScript atau port conflict.


## Urutan Langkah (Ringkas)

1. Masuk ke folder backend
```bash
cd apps/backend
```
2. Pasang dependency
```bash
bun install
```
3. Siapkan `apps/backend/.env` dan set `DATABASE_URL`
4. Generate Prisma Client
```bash
bun prisma generate
```
5. Seed database
```bash
bun prisma db seed
```
6. Jalankan server (development/watch)
```bash
bun run dev
# atau
bun run src/index.ts
```
7. Verifikasi endpoint API dengan `curl` (contoh di atas)