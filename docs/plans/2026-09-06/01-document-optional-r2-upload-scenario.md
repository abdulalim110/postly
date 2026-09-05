# Dokumentasi Skenario Opsional Image Upload R2

## Status

Status: **selesai didokumentasikan pada 6 September 2026**.

Plan ini mencatat outcome dokumentasi baru setelah plan implementasi D01–D08
selesai. Tidak ada perubahan pada source aplikasi, package manifest, schema,
atau evidence lama.

## Outcome

Instructor memiliki playbook terpisah untuk menjawab permintaan peserta tentang
image upload tanpa menjadikannya scope wajib Postly atau participant kit awal.

## Checklist

- [x] R2 diposisikan sebagai pilihan berdasarkan constraint workshop.
- [x] Materi mempunyai gate berdasarkan sisa waktu dan stop condition.
- [x] Arsitektur presigned upload, finalize, dan penyimpanan object key dijelaskan.
- [x] Credential, validasi, ownership, orphan object, dan cleanup dicatat.
- [x] Status MinIO dibatasi sebagai opsi emulator legacy, bukan dependency wajib.
- [x] Prompt opsional dan acceptance condition tersedia untuk task lanjutan.
- [x] README instructor menunjuk ke playbook baru.

## Acceptance Condition

- Materi tetap instructor-only sampai diberikan sebagai task terpisah.
- Completed plan D01–D08 tidak dibuka kembali.
- Tidak ada klaim hasil upload, test, atau cleanup yang belum dijalankan.
- Tidak ada perubahan source code atau dependency.

## Verification

- Periksa tautan playbook dari `README.md`.
- Periksa bahwa playbook mencakup time gate, architecture, security, cleanup,
  local-development stance, acceptance condition, dan prompt peserta.
- Periksa `git diff` agar perubahan hanya menyentuh dokumentasi baru dan README.

## Log Eksekusi

### 2026-09-06 — dokumentasi selesai

- Menambahkan `docs/facilitation/OPTIONAL-R2-IMAGE-UPLOAD.md` sebagai materi
  instructor-only.
- Menambahkan pointer playbook pada `README.md`.
- Skenario membatasi extension berdasarkan waktu, mempertahankan backend Express,
  dan memisahkan pembahasan upload dari scope utama Postly.
- Tidak menjalankan upload, membuat bucket, menggunakan credential, mengubah
  source aplikasi, atau menciptakan evidence teknis.
