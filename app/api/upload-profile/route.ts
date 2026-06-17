import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'profile-photos';

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

    // Build file path: profile-photos/{staffId}/{timestamp}_{filename}
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `${staffId}/${timestamp}_profile.${ext}`;

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      return NextResponse.json(
        { error: `Gagal mengupload foto: ${error.message}` },
        { status: 500 },
      );
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
    });
  } catch (err) {
    console.error('Upload profile API error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat mengupload foto' },
      { status: 500 },
    );
  }
}
