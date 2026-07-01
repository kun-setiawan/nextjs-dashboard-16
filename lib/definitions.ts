// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type Staff = {
  id_staff: string;
  id_kategori_staff: string;
  user_id: string;
  nama_staff: string;
  foto_profil: string;
  rekap_performance_score: number;
  rekap_status: 'excellent' | 'good' | 'average' | 'needs-improvement';
  rekap_tasks_completed: number;
  rekap_total_tasks: number;

  nama_kategori: string;
  status: 'excellent' | 'good' | 'average' | 'needs-improvement';
  performance_score: number;
  tasks_completed: number;
  total_tasks: number;
};

export type KategoriStaff = {
  id_kategori_staff: string;
  nama_kategori: string;
  staffs: Staff[];
  icon: string;
  rekap_avg_score: number;
};

export type UserRole = {
  user_id: string;
  role: string;
};

export type Periode = {
  id_periode: string;
  tahun_periode: string;
  semester: string;
  tanggal_mulai: string | Date;
  tanggal_selesai: string | Date;
  created_by?: string;
  created_at?: string | Date;
  updated_by?: string;
  updated_at?: string | Date;
  jumlah_hari_kerja: number;
  status: 'Aktif' | 'Tidak Aktif';
};
