# Instruksi Kerja Postly Instructor Demo

Aturan ini berlaku untuk seluruh repository. Root `AGENTS.md` dipertahankan
ringkas sebagai pointer agar instruksi ini otomatis ditemukan coding agent.
Penempatan detail di `docs/AGENTS.md` adalah pilihan organisasi repository ini,
bukan syarat universal yang harus ditiru setiap project.

## 1. Sebelum Mengubah File

- Baca `README.md`, file ini, dan plan aktif di `docs/plans/` sampai selesai.
- Gunakan referensi UI yang disebutkan plan; jangan menempel screenshot sebagai
  pengganti implementasi React.
- Kerjakan hanya tahap atau checklist ID yang diminta pengguna.
- Plan implementasi awal sudah selesai. Perubahan dengan outcome atau akar
  masalah baru harus memakai plan baru, bukan membuka ulang checklist lama.

## 2. Bahasa dan Bentuk Jawaban

- Bahasa kerja tidak wajib bahasa Inggris.
- Ikuti bahasa pengguna dan konteks repository. Bahasa Indonesia boleh dipakai
  untuk plan, log, komentar dokumentasi, serta laporan hasil.
- Nama library, operation GraphQL, command, path, dan identifier kode tidak perlu
  diterjemahkan.
- Jangan mengganti bahasa file yang sudah konsisten hanya demi menyeragamkan.
- Laporan akhir harus menyebutkan file yang berubah, command yang dijalankan,
  hasil yang benar-benar teramati, dan residual risk.

## 3. Kontrak Produk

- Frontend menggunakan React dan Apollo Client.
- Backend menggunakan Express 5 dan Apollo Server.
- Data access menggunakan Prisma ORM 7 dan SQLite lokal.
- Model domain hanya `User`, `Post`, dan `Comment`.
- Reply disimpan sebagai `Comment.parentId`, dibatasi satu tingkat, dan parent
  harus berasal dari post yang sama.
- Feed bersifat publik dan diurutkan dari post terbaru.
- Gambar post hanya berasal dari allowlist asset lokal.
- GraphQL adalah kendaraan demonstrasi, bukan positioning utama kelas.
- Jangan menambahkan like, follow, story, chat, notification, subscription,
  sharing, bookmark, recommendation, atau upload pipeline.

## 4. Aturan Plan Bertahap

- Simpan plan di `docs/plans/YYYY-MM-DD/`.
- Satu masalah atau outcome menggunakan satu plan. Buat plan baru jika akar
  masalah berubah secara material.
- Agent membaca seluruh plan, tetapi mengerjakan satu tahap per run kecuali
  pengguna meminta lebih.
- Setiap tahap mempunyai objective, checklist, acceptance condition,
  verification, dan stop condition bila relevan.
- Checklist hanya boleh ditandai selesai jika evidence dicatat pada `Log
  Eksekusi` di file plan yang sama.
- Jangan menggandakan plan hanya untuk mengubah status.
- Jangan menaruh progress tracker atau execution log di root `AGENTS.md`.

## 5. Diagnosis dan Pemilihan Solusi

- Pertahankan behavior baseline saat membandingkan strategi relation loading.
- Ukur sebelum memilih solusi. Prisma relation query, explicit batching, dan
  DataLoader adalah opsi dengan trade-off; DataLoader bukan jawaban otomatis.
- DataLoader atau cache relation harus request-scoped.
- Jangan menyamakan jumlah Prisma Client operation dengan SQL query count.
- Angka pada evidence hanya berlaku untuk operation, seed, source, dan environment
  yang direkam. Ukur ulang setelah input tersebut berubah.
- Jangan membuat klaim latency atau performa umum dari satu rehearsal lokal.

## 6. Verification dan Evidence

- Respons model yang mengatakan `done` bukan evidence.
- Jangan menciptakan screenshot, query count, hasil test, timing, atau klaim
  teknis.
- Gunakan command aktual dan simpan artifact panjang di `output/diagnostics/`
  atau lokasi yang ditentukan plan.
- Jangan mengedit artifact generated untuk membuat hasil terlihat lulus. Jalankan
  ulang generator atau verification terkait.
- Jika verification belum dapat dijalankan, biarkan checklist terbuka dan catat
  alasannya.
- Pekerjaan berulang dengan aturan stabil sebaiknya dijadikan script atau test
  biasa setelah pola dan acceptance condition dipahami.

## 7. Disiplin Repository

- Jaga perubahan kecil dan mudah direview.
- Jangan menambah dependency atau abstraksi tanpa masalah konkret.
- Pertahankan perubahan pengguna yang tidak terkait.
- Hindari operasi Git destruktif dan jangan membersihkan dirty worktree tanpa
  instruksi eksplisit.
- Demo ini hanya memakai data lokal/disposable; jangan menghubungkannya ke data
  production.
