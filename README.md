# windows-explorer
To install dependencies:
```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Urutan Langkah backend cara menjalankan nya

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

## Urutan Langkah Frontend cara menjalankan nya

1. Jalankan backend (lihat `apps/backend/README.md`) dan pastikan API berjalan di `http://localhost:3000`.
2. `cd apps/frontend`
3. `bun install` (atau `npm install`)
4. `bun run dev` (atau `npm run dev`)
5. Buka `http://localhost:5173` dan interaksikan UI.