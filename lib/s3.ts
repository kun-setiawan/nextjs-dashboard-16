import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// ─── Kilat Storage (CloudKilat S3-compatible) Configuration ──────────────────
// Semua nilai diambil dari environment variables agar tidak hardcoded.
const endpoint = process.env.KILAT_S3_ENDPOINT!;
const accessKeyId = process.env.KILAT_S3_ACCESS_KEY!;
const secretAccessKey = process.env.KILAT_S3_SECRET_KEY!;
const region = process.env.KILAT_S3_REGION || 'us-east-1';

export const BUCKET_EVIDENCE = process.env.KILAT_S3_BUCKET_EVIDENCE || 'evidence';
export const BUCKET_PROFILE = process.env.KILAT_S3_BUCKET_PROFILE || 'profile-photos';

// ─── S3 Client Instance ───────────────────────────────────────────────────────
export const s3Client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  // forcePathStyle diperlukan untuk sebagian besar S3-compatible storage
  // yang tidak menggunakan virtual-hosted-style URL.
  forcePathStyle: true,
});

// ─── Helper: Upload File ke S3 ───────────────────────────────────────────────
/**
 * Upload buffer ke Kilat Storage S3.
 *
 * @param bucket      - Nama bucket tujuan
 * @param key         - Path/key file di dalam bucket (contoh: "staff-id/aspek-id/file.jpg")
 * @param body        - Isi file dalam bentuk Buffer atau Uint8Array
 * @param contentType - MIME type file (contoh: "image/jpeg")
 */
export async function uploadToS3(
  bucket: string,
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    // ACL public-read agar file bisa diakses langsung via URL publik.
    // Pastikan bucket di panel CloudKilat juga sudah diset sebagai public.
    ACL: 'public-read',
  });
  await s3Client.send(command);
}

// ─── Helper: Generate Public URL ─────────────────────────────────────────────
/**
 * Mendapatkan public URL dari sebuah objek di Kilat Storage.
 * Format URL: {endpoint}/{bucket}/{key}
 *
 * @param bucket - Nama bucket
 * @param key    - Path/key file di dalam bucket
 */
export function getPublicUrl(bucket: string, key: string): string {
  // Pastikan endpoint tidak diakhiri dengan slash
  const base = endpoint.replace(/\/$/, '');
  return `${base}/${bucket}/${key}`;
}
