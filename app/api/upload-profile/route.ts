import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, getPublicUrl, BUCKET, FOLDER_PROFILE } from '@/lib/s3';


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const staffId = formData.get('staffId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 },
      );
    }

    if (!staffId) {
      return NextResponse.json(
        { error: 'Staff ID tidak ditemukan' },
        { status: 400 },
      );
    }

    // Validate file size (max 5MB for profile photos)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 5MB' },
        { status: 400 },
      );
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP.' },
        { status: 400 },
      );
    }

    // Gunakan key tetap berdasarkan staffId sehingga upload baru selalu menimpa foto lama.
    // Ekstensi tidak diperlukan karena S3 menyimpan ContentType di metadata objek.
    const filePath = `${FOLDER_PROFILE}/${staffId}/profil`;

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload ke Kilat Storage (S3-compatible)
    try {
      await uploadToS3(BUCKET, filePath, buffer, file.type);
    } catch (uploadErr: unknown) {
      const msg = uploadErr instanceof Error ? uploadErr.message : String(uploadErr);
      console.error('Kilat S3 upload-profile error:', uploadErr);
      return NextResponse.json(
        { error: `Gagal mengupload foto: ${msg}` },
        { status: 500 },
      );
    }

    // Generate public URL dari Kilat Storage
    const publicUrl = getPublicUrl(BUCKET, filePath);

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
    });
  } catch (err) {
    console.error('Upload profile API error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat mengupload foto' },
      { status: 500 },
    );
  }
}
