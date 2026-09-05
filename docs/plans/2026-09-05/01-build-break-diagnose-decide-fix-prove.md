# Build, Break, Diagnose, Decide, Fix, dan Prove Postly

## 1. Status dan Cara Menjalankan

Status: **selesai lokal dan sudah direhearsal pada 5 September 2026**.

Plan ini menyimpan riwayat implementasi instructor demo D01–D08. Jangan membuka
kembali checklist untuk task baru. Jika ditemukan outcome atau akar masalah baru,
buat plan bertanggal baru. Checklist di bawah ditandai selesai karena evidence
aktualnya tercatat pada `Log Eksekusi` dan artifact yang ditautkan.

## 2. Sumber dan Artifact

- `README.md`
- `docs/AGENTS.md`
- `../output/Postly-Instructor-Demo-Plan.md`
- UI reference pada workspace workshop
- `docs/assets/ASSET-PROMPTS.md`
- `output/d05-rendered/`
- `output/diagnostics/d06-baseline-feed.md`
- `output/diagnostics/d07-strategy-comparison.md`
- `output/diagnostics/d07-decision.md`
- `output/diagnostics/d08-proof.md`
- `output/diagnostics/d08-naive-to-dataloader.diff`

## 3. Outcome

Menyediakan aplikasi Postly instructor-only yang dapat dijalankan end to end
dan dipakai untuk mengajar alur Build → Break → Diagnose → Decide → Fix → Prove.

## 4. Kontrak Domain

- Stack: React, Apollo Client, Express 5, Apollo Server, Prisma ORM 7, dan SQLite.
- Domain hanya `User`, `Post`, dan `Comment`.
- Reply memakai `Comment.parentId`, hanya satu tingkat, dan parent berasal dari
  post yang sama.
- Feed publik menampilkan post terbaru lebih dahulu.
- Create post hanya menerima image key dari allowlist lokal.
- Instrumentation bersifat opt-in dan terisolasi per request.
- Strategi relation loading harus menghasilkan response behavior yang sama.

## 5. Non-Goal dan Larangan

- Tidak menambah like, follow, story, chat, notification, subscription, sharing,
  bookmark, recommendation, atau upload pipeline.
- Tidak menjadikan GraphQL sebagai positioning utama kelas.
- Tidak memilih DataLoader tanpa diagnosis dan pembanding trade-off.
- Tidak mengarang query count, hasil test, screenshot, atau klaim performa.
- Tidak memakai data production atau dependency internet saat demo.

## 6. Decompose Checklist

### D01 — Project Foundation

- [x] D01.1 Scaffold frontend React dan backend Express.
- [x] D01.2 Tambahkan root command dan environment example.
- [x] D01.3 Verifikasi frontend dan backend dapat berjalan bersama.

### D01.R — Revisi Alignment Apollo

- [x] D01.R1 Gunakan Apollo Server pada Express 5 tanpa mengubah schema contract.
- [x] D01.R2 Gunakan Apollo Client, `ApolloProvider`, dan bearer-token middleware.
- [x] D01.R3 Migrasikan operation aktif dan verifikasi ulang seluruh flow.

### D02 — Static Asset

- [x] D02.1 Tambahkan lima gambar post yang dapat dipilih.
- [x] D02.2 Tambahkan empat avatar seed.
- [x] D02.3 Verifikasi demo tidak membutuhkan internet.

### D03 — Data dan Auth

- [x] D03.1 Buat Prisma schema dengan tiga tabel domain.
- [x] D03.2 Buat migration dan repeatable seed.
- [x] D03.3 Implement register, login, JWT context, dan auth guard.

### D04 — Product Behavior

- [x] D04.1 Implement public feed.
- [x] D04.2 Implement create post dengan image allowlist.
- [x] D04.3 Implement top-level comment.
- [x] D04.4 Implement reply menggunakan `Comment.parentId`.
- [x] D04.5 Implement public profile.

### D05 — Visual Implementation

- [x] D05.1 Cocokkan login dan register dengan UI reference.
- [x] D05.2 Cocokkan feed dan create post dengan UI reference.
- [x] D05.3 Cocokkan profile dengan UI reference.
- [x] D05.4 Periksa loading, empty, validation, error, dan long-content state.

### D06 — Break dan Diagnose

- [x] D06.1 Pertahankan working baseline dengan naive relation resolver.
- [x] D06.2 Tambahkan request-scoped query instrumentation.
- [x] D06.3 Reproduce dan simpan query evidence aktual.

### D07 — Decide dan Fix

- [x] D07.1 Implement Prisma relation-query sebagai pembanding.
- [x] D07.2 Implement explicit batching sebagai pembanding.
- [x] D07.3 Implement request-scoped DataLoader sebagai pembanding.
- [x] D07.4 Catat trade-off dan pilih fix utama untuk demo.

### D08 — Prove

- [x] D08.1 Jalankan behavior test pada baseline.
- [x] D08.2 Jalankan test yang sama setelah fix.
- [x] D08.3 Rekam query count dari eksekusi nyata.
- [x] D08.4 Review diff dan rehearsal dari database bersih.

## 7. Definition of Done

- [x] Register, login, feed, create post, comment, reply, dan profile bekerja.
- [x] Hanya tiga tabel domain yang digunakan.
- [x] Reply memakai `Comment.parentId` dan guard parent/post.
- [x] Seluruh gambar aplikasi tersedia secara lokal.
- [x] Seed dapat dijalankan berulang tanpa menggandakan seed record.
- [x] Baseline relation loading dapat direproduksi.
- [x] Prisma relation query, explicit batching, dan DataLoader dibandingkan dengan
  input serta behavior check yang sama.
- [x] Query count berasal dari eksekusi aktual.
- [x] Visual QA mencakup desktop, mobile, state khusus, dan long content.
- [x] Demo dapat direhearsal dari disposable database tanpa internet.

## 8. Log Eksekusi

### 2026-09-05 — D01 dan D01.R selesai

- Root workspace menyediakan command `dev`, `build`, dan `test`.
- `npm install` selesai dengan 0 vulnerability dan build frontend selesai
  menggunakan Vite 8.2.2.
- `npm run dev` menjalankan kedua service. Frontend, `/api/health`, dan operation
  GraphQL health memberikan response sukses.
- Backend memakai Apollo Server 5.5.1 pada Express 5; frontend memakai Apollo
  Client 4.2.12 dengan bearer-token link.
- Live check mencakup register, `me`, create post, comment, reply dengan
  `parentId` yang tepat, dan public profile. Record sementara dibersihkan dan
  data kembali menjadi 4 user, 8 post, dan 22 comment.

### 2026-09-05 — D02 selesai

- Lima post image dinormalisasi menjadi 1200 × 800 WebP dan empat avatar menjadi
  512 × 512 WebP.
- Seluruh sembilan asset memberikan HTTP 200 dengan `image/webp`, ikut tersalin
  pada production build, dan source scan tidak menemukan asset HTTP(S) eksternal.
- Prompt dan constraint asset tercatat di `docs/assets/ASSET-PROMPTS.md`.

### 2026-09-05 — D03 selesai

- Prisma ORM 7.10.0 berhasil memvalidasi schema dan menghasilkan client.
- Migration hanya membuat tabel `User`, `Post`, dan `Comment`; `parentId` adalah
  self-relation nullable dan tidak ditemukan tabel domain tambahan.
- Dua seed run berturut-turut sama-sama menghasilkan 4 user, 8 post, dan 22
  comment termasuk 6 reply.
- Live GraphQL check mencakup register, login email/username, `me`, duplicate
  account, wrong password, unauthenticated guard, dan tidak mengekspos
  `passwordHash`.

### 2026-09-05 — D04 selesai

- Public feed mengembalikan 8 seed post dengan urutan terbaru lebih dahulu.
- Create post berhasil dengan asset yang diizinkan serta menolak request tanpa
  auth dan image key yang tidak dikenal.
- Comment dan reply berhasil melalui browser dan GraphQL. Backend menolak reply
  terhadap reply serta parent dari post lain.
- Public profile menormalisasi username dan hanya menampilkan post milik user
  tersebut. Record verification sementara dibersihkan setelah pemeriksaan.

### 2026-09-05 — D05 selesai

- Login, register, feed, create post, profile, loading, network error, validation,
  empty state, caption limit, dan long content dirender ulang setelah migrasi
  Apollo.
- Seluruh 19 render tersimpan di `output/d05-rendered/` dan diperiksa pada ukuran
  desktop serta mobile.
- Pemeriksaan menemukan nol broken image dan tidak ada horizontal overflow pada
  page yang diukur.

### 2026-09-05 — D06 selesai

- Baseline mempertahankan direct per-parent relation resolver.
- Instrumentation opt-in mencatat operation per request hanya bila environment
  dan request header diaktifkan; concurrent request mempunyai trace terpisah.
- Dua run `npm run diagnose:baseline` pada seed yang sama mengamati 8 post, 16
  top-level comment, 6 reply, 55 Prisma Client operation, dan 26 SQL query.
- Operation, source hash, SQL, parameter, dan detail run tersimpan di
  `output/diagnostics/d06-baseline-feed.md` dan file JSON pasangannya.

### 2026-09-05 — D07 selesai

- Semua strategi menghasilkan response yang sama dengan baseline.
- Run pembanding mengamati: naive 55 Prisma operation/26 SQL query; Prisma
  relation query 1 operation/6 SQL query; explicit batching 4 operation/4 SQL
  query; DataLoader 4 operation/4 SQL query.
- Dua concurrent DataLoader run mempunyai trace ID terpisah dan masing-masing
  tetap request-scoped.
- DataLoader dipilih untuk demo utama karena lesson berpusat pada reusable nested
  field resolver dan request lifecycle, bukan karena dianggap solusi universal.
- Raw evidence dan keputusan berada di `output/diagnostics/d07-strategy-comparison.md`
  serta `output/diagnostics/d07-decision.md`.

### 2026-09-05 — D08 selesai

- Baseline naive dan DataLoader menjalankan behavior suite yang sama pada
  disposable SQLite database; masing-masing lulus 15 check dengan signature dan
  end state yang sama.
- `npm test` selesai dengan 2 strategy test lulus dan tanpa failure.
- `npm run prove:d08` menghasilkan proof, raw JSON, dan diff tanpa mengubah
  `backend/dev.db`.
- Rehearsal dari database kosong menjalankan migration, repeatable seed, login,
  feed, create post, comment, exact-parent reply, profile, dan nested feed.
- Artifact final berada di `output/diagnostics/d08-proof.md`, file JSON
  pasangannya, dan `output/diagnostics/d08-naive-to-dataloader.diff`.

## 9. Residual dan Batas Interpretasi

- Query count di plan ini hanya berlaku pada source, operation, seed, dan
  environment yang direkam. Ukur ulang bila salah satunya berubah.
- Hasil lokal tidak membuktikan peningkatan latency atau performa production.
- Demo memakai SQLite lokal dan tidak melakukan write ke sistem eksternal.
