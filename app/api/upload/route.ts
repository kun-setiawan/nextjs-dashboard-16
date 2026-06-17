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
    // id_staff of the uploader
    const idStaff = formData.get('personnelId') as string | null;
    // id_aspek_penilaian
    const idAspek = formData.get('aspectId') as string | null;
    // Optional: active period UUID (sent by client if known)
    const idPeriode = (formData.get('periodeId') as string | null) || null;
    // Optional: the uploader's user_id for created_by
    const createdBy = (formData.get('createdBy') as string | null) || idStaff || null;

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 },
      );
    }

    if (!idStaff) {
      return NextResponse.json(
        { error: 'Staff ID tidak ditemukan' },
        { status: 400 },
      );
    }

    if (!idAspek) {
      return NextResponse.json(
        { error: 'Aspek penilaian ID tidak ditemukan' },
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

    // Build a unique file path: evidence/{idStaff}/{idAspek}/{timestamp}_{filename}
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${idStaff}/${idAspek}/${timestamp}_${sanitizedName}`;

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
    const tipeBukti = isImage ? 'image' : 'excel';

    // Parse optional metadata from form
    const namaBukti = (formData.get('namaBukti') as string) || file.name;
    const keterangan = (formData.get('keterangan') as string) || '';

    // Write a record to the bukti_penilaian table with correct column names
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('bukti_penilaian')
      .insert({
        id_staff:           idStaff,
        id_aspek_penilaian: idAspek,
        id_periode:         idPeriode,
        file_bukti:         urlData.publicUrl,   // store public URL, same as foto_profil
        nama_bukti:         namaBukti,
        keterangan:         keterangan,
        tipe_bukti:         tipeBukti,
        created_by:         createdBy,
      })
      .select('id_bukti_penilaian')
      .single();

    if (dbError) {
      console.error('Supabase DB insert error:', dbError);
      return NextResponse.json(
        { error: `File berhasil diupload tapi gagal menyimpan ke database: ${dbError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      id:       dbData.id_bukti_penilaian,
      url:      urlData.publicUrl,
      path:     data.path,
      type:     tipeBukti,
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

