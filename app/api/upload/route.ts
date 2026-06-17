import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use the service role key on the server so uploads bypass RLS policies.
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'evidence';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const personnelId = formData.get('personnelId') as string | null;
    const aspectId = formData.get('aspectId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 },
      );
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 10MB' },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const allowedExcelTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const allowedTypes = [...allowedImageTypes, ...allowedExcelTypes];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipe file tidak didukung. Gunakan JPG, PNG, WebP, GIF, atau Excel.' },
        { status: 400 },
      );
    }

    // Build a unique file path: evidence/{personnelId}/{aspectId}/{timestamp}_{filename}
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const folder = [personnelId || 'unknown', aspectId || 'unknown'].join('/');
    const filePath = `${folder}/${timestamp}_${sanitizedName}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      return NextResponse.json(
        { error: `Gagal mengupload file: ${error.message}` },
        { status: 500 },
      );
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    const isImage = allowedImageTypes.includes(file.type);

    // Parse optional metadata from form
    const namaBukti = (formData.get('namaBukti') as string) || file.name;
    const keterangan = (formData.get('keterangan') as string) || '';

    // Write a record to the bukti_penilaian table
    const { error: dbError } = await supabaseAdmin
      .from('bukti_penilaian')
      .insert({
        personnel_id: personnelId || null,
        aspect_id: aspectId || null,
        file_bukti: data.path,
        nama_bukti: namaBukti,
        keterangan: keterangan,
        tipe_file: isImage ? 'image' : 'excel',
        url_publik: urlData.publicUrl,
      });

    if (dbError) {
      console.error('Supabase DB insert error:', dbError);
      // File was uploaded but DB record failed — log but still return success
      // so the uploaded file isn't "lost" to the user.
    }

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
      type: isImage ? 'image' : 'excel',
      fileName: file.name,
    });
  } catch (err) {
    console.error('Upload API error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat mengupload file' },
      { status: 500 },
    );
  }
}
