# Skenario Opsional — Image Upload dengan Cloudflare R2

## Posisi Materi

Materi ini hanya dipakai jika peserta meminta pembahasan upload image dan waktu
kelas masih tersedia. Ini bukan bagian Definition of Done Postly dan tidak
mengubah completed plan D01–D08.

Jangan menambahkan materi ini ke participant kit awal. Peserta harus lebih dulu
menyelesaikan flow utama dan memahami alasan penggunaan asset lokal. Bila
materi benar-benar diberikan, buat task lanjutan yang terpisah.

## Jawaban Singkat untuk Peserta

> Kenapa R2? Karena free tier-nya cukup untuk latihan ini dan API-nya kompatibel
> dengan operasi dasar S3. Pilihan ini mengikuti constraint workshop, bukan
> klaim bahwa R2 selalu menjadi object storage terbaik.

Upload image tampak seperti satu input file, tetapi memperkenalkan storage,
credential, validasi file, state upload, orphan object, serta cleanup. Karena
itu Postly utama memakai allowlist asset lokal agar tujuan Build → Break →
Diagnose → Decide → Fix → Prove tetap selesai dalam waktu kelas.

## Gate Berdasarkan Waktu

| Sisa waktu | Pilihan instructor |
|---|---|
| Kurang dari 20 menit | Jelaskan alur dan risiko saja. Jangan live coding. |
| 20–40 menit | Lakukan spike upload satu file sampai object tersedia di R2. |
| Lebih dari 40 menit | Tambahkan tahap finalize dan diskusikan cleanup. |

Hentikan extension jika akun Cloudflare, bucket, network, atau credential belum
siap. Jangan mengorbankan rehearsal dan verification materi utama.

## Arsitektur Minimum

```text
Browser                   Express backend                    Cloudflare R2
   |                              |                                |
   | requestUpload(metadata)      |                                |
   |----------------------------->| generate key + presigned PUT   |
   |<-----------------------------|                                |
   | PUT file ke presigned URL ----------------------------------->|
   |                              |                                |
   | finalizeUpload(objectKey)    | HEAD/validate object           |
   |----------------------------->|------------------------------->|
   |                              | simpan object key               |
   |<-----------------------------|                                |
```

Backend Postly tetap Express. Gunakan `@aws-sdk/client-s3` dan
`@aws-sdk/s3-request-presigner`; tidak perlu memindahkan aplikasi ke Cloudflare
Workers hanya untuk memakai R2. Jika backend suatu hari berjalan sebagai
Worker, R2 dapat diakses langsung melalui binding tanpa S3 SDK.

Simpan konfigurasi berikut sebagai environment variable dan jangan pernah
mengirim secret ke browser:

```text
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET
R2_PUBLIC_BASE_URL
```

Database menyimpan `objectKey`, bukan presigned URL. Presigned URL bersifat
sementara dan diperlakukan seperti bearer token.

## Scope Spike

Spike minimum hanya membuktikan:

1. Backend menerima nama file, media type, dan ukuran yang diklaim client.
2. Backend membuat object key unik di prefix `tmp/<userId>/`.
3. Backend mengembalikan presigned `PUT` berumur singkat.
4. Browser meng-upload satu PNG, JPEG, atau WebP langsung ke R2.
5. Backend memeriksa object dengan `HEAD` saat finalize.
6. Database menyimpan object key yang sudah difinalisasi.

Nilai dari client tidak dipercaya sebagai verifikasi akhir. `Content-Type`
dapat ikut ditandatangani, tetapi pemeriksaan media type dan ukuran tetap perlu
dilakukan setelah upload atau melalui jalur upload yang lebih ketat.

## Cleanup yang Harus Dibahas

- Upload yang belum difinalisasi tetap menjadi orphan object.
- Gunakan prefix `tmp/` dengan lifecycle pendek sebagai safety net.
- Setelah finalize, salin atau pindahkan object ke prefix `posts/`, lalu hapus
  object sementara.
- Saat post dihapus atau gambarnya diganti, tentukan siapa yang menghapus object
  lama.
- Cleanup default untuk multipart upload yang tidak selesai tidak otomatis
  membersihkan orphan dari ordinary single `PUT`.

Untuk spike kelas, lifecycle policy boleh hanya ditunjukkan konfigurasinya.
Jangan mengklaim cleanup sudah berjalan tanpa bukti object benar-benar terhapus
atau tanpa inspection terhadap policy yang dipasang.

## Local Development

MinIO versi lama secara teknis masih dapat dipin dan dijalankan sebagai emulator
lokal S3, tetapi repository open-source resminya telah diarsipkan pada 25 April
2026 dan tidak lagi dipelihara. Jangan menjadikannya dependency wajib peserta.

Pilihan kelas yang lebih sederhana:

- gunakan R2 langsung jika network dan credential tersedia;
- mock interface storage untuk test unit;
- gunakan emulator lokal hanya sebagai opsi instructor, bukan syarat workshop.

Kompatibilitas S3 tidak berarti semua provider mempunyai behavior yang identik.
Integration test tetap dijalankan terhadap R2 untuk operasi yang benar-benar
digunakan.

## Acceptance Condition Jika Diimplementasikan

- Secret R2 tidak terdapat pada bundle atau request frontend.
- Hanya user terautentikasi yang dapat meminta upload URL.
- Object key unik dan dibatasi ke namespace user terkait.
- Media type yang tidak diizinkan ditolak.
- Finalize menolak object yang tidak ada atau tidak dimiliki user tersebut.
- Post menyimpan object key yang stabil, bukan presigned URL.
- Behavior orphan dan delete mempunyai strategi cleanup yang tertulis.
- Test dan evidence berasal dari eksekusi aktual, bukan angka atau screenshot
  yang diasumsikan.

## Prompt Opsional untuk Peserta

```text
Postly saat ini memakai allowlist gambar lokal dan flow utamanya sudah sehat.
Buat rencana extension terpisah untuk satu image upload menggunakan Cloudflare
R2. Backend tetap Express dan credential tidak boleh masuk ke browser.

Mulai dengan menjelaskan state upload, batas ukuran/media type, kepemilikan
object key, finalize, failure mode, dan cleanup orphan. Jangan mengubah source
sebelum rencana diterima. Jika implementasi diminta, kerjakan satu vertical
slice kecil menggunakan presigned PUT dan buktikan hasilnya dari eksekusi nyata.
```

## Referensi Resmi

- [R2 S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/)
- [R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- [R2 object lifecycle rules](https://developers.cloudflare.com/r2/buckets/object-lifecycles/)
- [MinIO repository status](https://github.com/minio/minio)
