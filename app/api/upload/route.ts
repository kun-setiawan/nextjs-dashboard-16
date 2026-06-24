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
    // Optional: active period UUID hint from client (will be overridden by DB lookup below)
    const idPeriodeHint = (formData.get('periodeId') as string | null) || null;
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

    // ─── Resolve active periode BEFORE inserting bukti_penilaian ────────────
    let activePeriodeId: string | null = idPeriodeHint;
    let jumlahHariKerja: number = 0;

    {
      // Always fetch the active periode from DB to ensure id_periode is correct.
      const { data: periodeData, error: periodeError } = await supabaseAdmin
        .from('periode')
        .select('id_periode, jumlah_hari_kerja')
        .eq('status', 'aktif')
        .single();

      if (periodeError || !periodeData) {
        console.warn('Tidak ada periode aktif ditemukan:', periodeError?.message);
        // Fall back to hint value (may be null); upload still proceeds
      } else {
        activePeriodeId = periodeData.id_periode;
        jumlahHariKerja = periodeData.jumlah_hari_kerja ?? 0;
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

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
        id_periode:         activePeriodeId,
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

    // ─── Update rekap_penilaian_aspek ───────────────────────────────────────
    // activePeriodeId and jumlahHariKerja are already resolved above.

    if (activePeriodeId) {
      // 2. Fetch all aspek_penilaian records
      const { data: allAspekData, error: aspekFetchError } = await supabaseAdmin
        .from('aspek_penilaian')
        .select('id_aspek_penilaian, unit_waktu, jumlah_kegiatan');

      if (aspekFetchError || !allAspekData) {
        console.warn('Gagal mengambil data aspek_penilaian:', aspekFetchError?.message);
      } else {
        // 3. Fetch all staff records
        const { data: allStaffData, error: staffFetchError } = await supabaseAdmin
          .from('staff')
          .select('id_staff');

        if (staffFetchError || !allStaffData) {
          console.warn('Gagal mengambil data staff:', staffFetchError?.message);
        } else {
          // 4. For each combination of staff x aspek, upsert rekap_penilaian_aspek
          for (const aspek of allAspekData) {
            // Calculate total_bukti based on unit_waktu
            let divisor = 1;
            const unitWaktu = (aspek.unit_waktu ?? '').toLowerCase();
            if (unitWaktu === 'bulan') {
              divisor = 30;
            } else if (unitWaktu === 'minggu') {
              divisor = 7;
            }
            // else 'hari' or anything else → divisor = 1

            const totalBukti = Math.floor(jumlahHariKerja / divisor) * (aspek.jumlah_kegiatan ?? 1);

            for (const staff of allStaffData) {
              // 5. Count bukti_penilaian records for this staff + aspek + periode
              const { count: jumlahBukti, error: countError } = await supabaseAdmin
                .from('bukti_penilaian')
                .select('id_bukti_penilaian', { count: 'exact', head: true })
                .eq('id_periode', activePeriodeId)
                .eq('id_staff', staff.id_staff)
                .eq('id_aspek_penilaian', aspek.id_aspek_penilaian);

              if (countError) {
                console.warn(
                  `Gagal menghitung bukti untuk staff ${staff.id_staff} aspek ${aspek.id_aspek_penilaian}:`,
                  countError.message,
                );
                continue;
              }

              const buktiCount = jumlahBukti ?? 0;

              // 6. Calculate penilaian percentage
              const penilaian = totalBukti > 0
                ? Math.min(100, Math.round((buktiCount / totalBukti) * 100))
                : 0;

              // 7. Upsert rekap_penilaian_aspek
              //    ON CONFLICT (id_periode, id_staff, id_aspek_penilaian) → update jumlah_bukti, total_bukti, penilaian
              const { error: upsertError } = await supabaseAdmin
                .from('rekap_penilaian_aspek')
                .upsert(
                  {
                    id_periode:          activePeriodeId,
                    id_staff:            staff.id_staff,
                    id_aspek_penilaian:  aspek.id_aspek_penilaian,
                    jumlah_bukti:        buktiCount,
                    total_bukti:         totalBukti,
                    penilaian:           penilaian,
                  },
                  {
                    onConflict: 'id_periode,id_staff,id_aspek_penilaian',
                    ignoreDuplicates: false,
                  },
                );

              if (upsertError) {
                console.warn(
                  `Gagal upsert rekap_penilaian_aspek untuk staff ${staff.id_staff} aspek ${aspek.id_aspek_penilaian}:`,
                  upsertError.message,
                );
              }
            }
          }
        }
      }
    }

    // ─── Upsert rekap_penilaian_staff ──────────────────────────────────────
    // For every staff in rekap_penilaian_aspek (periode aktif), hitung rata-rata
    // penilaian lalu upsert ke rekap_penilaian_staff.

    if (activePeriodeId) {
      // Ambil semua rekap untuk periode aktif, grouped per staff
      const { data: rekapRows, error: rekapFetchError } = await supabaseAdmin
        .from('rekap_penilaian_aspek')
        .select('id_staff, penilaian')
        .eq('id_periode', activePeriodeId);

      if (rekapFetchError || !rekapRows) {
        console.warn('Gagal mengambil rekap_penilaian_aspek untuk rekap_penilaian_staff:', rekapFetchError?.message);
      } else {
        // Hitung rata-rata penilaian per staff
        const staffPenilaianMap = new Map<string, { total: number; count: number }>();
        for (const row of rekapRows) {
          const existing = staffPenilaianMap.get(row.id_staff) ?? { total: 0, count: 0 };
          staffPenilaianMap.set(row.id_staff, {
            total: existing.total + (row.penilaian ?? 0),
            count: existing.count + 1,
          });
        }

        // Upsert satu record per staff
        for (const [staffId, { total, count }] of staffPenilaianMap.entries()) {
          const avgPenilaian = count > 0 ? Math.round(total / count) : 0;

          const { error: staffUpsertError } = await supabaseAdmin
            .from('rekap_penilaian_staff')
            .upsert(
              {
                id_periode: activePeriodeId,
                id_staff:   staffId,
                penilaian:  avgPenilaian,
              },
              {
                onConflict:       'id_periode,id_staff',
                ignoreDuplicates: false,
              },
            );

          if (staffUpsertError) {
            console.warn(
              `Gagal upsert rekap_penilaian_staff untuk staff ${staffId}:`,
              staffUpsertError.message,
            );
          }
        }
      }
    }

    // ────────────────────────────────────────────────────────────────────────

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

