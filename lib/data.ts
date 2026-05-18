// import postgres from 'postgres';
// import {
//   Staff,
// } from './definitions';
// const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
//
//
// export async function fetchStaff() {
//   try {
//     const staffs = await sql<Staff[]>`
//       SELECT
//         id_staff,
//         id_kategori_staff,
//         user_id,
//         nama_staff,
//         foto_profil
//       FROM staff
//       ORDER BY name ASC
//     `;
//
//     return staffs;
//   } catch (err) {
//     console.error('Database Error:', err);
//     throw new Error('Failed to fetch all customers.');
//   }
// }
//
// export async function fetchKategoriStaff() {
//   try {
//     const kategori_staff = await sql<Staff[]>`
//       SELECT
//         id_kategori_staff,
//         nama_kategori
//       FROM kategori_staff
//       ORDER BY name ASC
//     `;
//
//     return kategori_staff;
//   } catch (err) {
//     console.error('Database Error:', err);
//     throw new Error('Failed to fetch all customers.');
//   }
// }



export interface Personnel {
  id: string
  name: string
  position: string
  avatar: string
  performanceScore: number
  status: "excellent" | "good" | "average" | "needs-improvement"
  tasksCompleted: number
  totalTasks: number
}

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  personnel: Personnel[]
  averageScore: number
}

export interface Evidence {
  id: string
  type: "image" | "excel" | "data"
  name: string
  description: string
  url: string
  previewUrl?: string
}

export interface AssessmentAspect {
  id: string
  name: string
  indicator: string
  responsible: string
  weight: number
  evidences: Evidence[]
}

export const assessmentAspects: AssessmentAspect[] = [
  {
    id: "1",
    name: "Kedisiplinan",
    indicator: "Kehadiran tepat waktu, mematuhi jadwal kerja, tidak sering izin tanpa alasan.",
    responsible: "Kepala Sekolah",
    weight: 20,
    evidences: [
      {
        id: "e1",
        type: "excel",
        name: "Rekap Kehadiran Januari 2024",
        description: "Data absensi bulanan periode Januari 2024",
        url: "/files/kehadiran-jan-2024.xlsx",
        previewUrl: "/excel-spreadsheet-attendance-data.jpg",
      },
      {
        id: "e2",
        type: "image",
        name: "Foto Absensi Fingerprint",
        description: "Bukti absensi menggunakan mesin fingerprint",
        url: "/fingerprint-attendance-machine-photo.jpg",
      },
    ],
  },
  {
    id: "2",
    name: "Kebersihan, Kerapihan, dan Tanggung Jawab",
    indicator: "Menjaga kebersihan area kerja, berpenampilan rapi, dan bertanggung jawab atas tugas yang diberikan.",
    responsible: "Wakil Kepala Sekolah",
    weight: 15,
    evidences: [
      {
        id: "e3",
        type: "image",
        name: "Dokumentasi Ruang Kerja",
        description: "Foto kondisi ruang kerja yang bersih dan rapi",
        url: "/clean-organized-office-workspace.jpg",
      },
    ],
  },
  {
    id: "3",
    name: "Pemeliharaan Alat dan Barang",
    indicator: "Menggunakan peralatan dengan benar dan tidak merusak fasilitas.",
    responsible: "Kepala Tata Usaha",
    weight: 15,
    evidences: [
      {
        id: "e4",
        type: "excel",
        name: "Inventaris Barang",
        description: "Daftar inventaris dan kondisi barang",
        url: "/files/inventaris-barang.xlsx",
        previewUrl: "/excel-inventory-list-spreadsheet.jpg",
      },
      {
        id: "e5",
        type: "image",
        name: "Foto Kondisi Peralatan",
        description: "Dokumentasi kondisi peralatan kerja",
        url: "/well-maintained-office-equipment.jpg",
      },
    ],
  },
  {
    id: "4",
    name: "Hubungan Sosial",
    indicator: "Mampu bekerja sama dengan rekan kerja, berkomunikasi dengan baik, dan menjaga hubungan harmonis.",
    responsible: "Kepala Sekolah",
    weight: 15,
    evidences: [
      {
        id: "e6",
        type: "image",
        name: "Dokumentasi Kegiatan Tim",
        description: "Foto kegiatan bersama dan kerja tim",
        url: "/team-collaboration-meeting-school-staff.jpg",
      },
    ],
  },
  {
    id: "5",
    name: "Spiritual",
    indicator: "Mengikuti kegiatan keagamaan, menunjukkan sikap religius dalam keseharian.",
    responsible: "Koordinator Keagamaan",
    weight: 15,
    evidences: [
      {
        id: "e7",
        type: "image",
        name: "Dokumentasi Sholat Berjamaah",
        description: "Foto kegiatan sholat berjamaah",
        url: "/prayer-room-islamic-school.jpg",
      },
      {
        id: "e8",
        type: "image",
        name: "Kegiatan Pengajian",
        description: "Dokumentasi kegiatan pengajian rutin",
        url: "/islamic-study-group-gathering.jpg",
      },
    ],
  },
  {
    id: "6",
    name: "Keaktifan Dalam Organisasi Kemuhammadiyahan",
    indicator: "Aktif dalam kegiatan organisasi Muhammadiyah, mengikuti rapat dan program kerja organisasi.",
    responsible: "Ketua PCM",
    weight: 20,
    evidences: [
      {
        id: "e9",
        type: "excel",
        name: "Rekap Kehadiran Rapat PCM",
        description: "Data kehadiran rapat bulanan PCM",
        url: "/files/kehadiran-rapat-pcm.xlsx",
        previewUrl: "/excel-meeting-attendance-spreadsheet.jpg",
      },
      {
        id: "e10",
        type: "image",
        name: "Dokumentasi Kegiatan PCM",
        description: "Foto kegiatan organisasi Muhammadiyah",
        url: "/muhammadiyah-organization-event-meeting.jpg",
      },
    ],
  },
  {
    id: "7",
    name: "Pendampingan Makan Siang",
    indicator: "Hadir mendampingi siswa dalam sesi Pendampingan Makan Siang.",
    responsible: "Wakil Kepala Sekolah",
    weight: 20,
    evidences: [
      {
        id: "e9",
        type: "excel",
        name: "Rekap Kehadiran Rapat PCM",
        description: "Data kehadiran rapat bulanan PCM",
        url: "/files/kehadiran-rapat-pcm.xlsx",
        previewUrl: "/excel-meeting-attendance-spreadsheet.jpg",
      },
      {
        id: "e10",
        type: "data",
        name: "Dokumentasi Kegiatan PCM",
        description: "Foto kegiatan organisasi Muhammadiyah",
        url: "/muhammadiyah-organization-event-meeting.jpg",
      },
    ],
  },

]

export const categories: Category[] = [
  {
    id: "guru",
    name: "Guru",
    icon: "book",
    description: "Tenaga pengajar dan pendidik",
    averageScore: 87,
    personnel: [
      {
        id: "1",
        name: "Budi Santoso, S.Pd",
        position: "Guru Matematika",
        avatar: "/male-teacher-portrait.png",
        performanceScore: 92,
        status: "excellent",
        tasksCompleted: 48,
        totalTasks: 50,
      },
      {
        id: "2",
        name: "Siti Rahayu, M.Pd",
        position: "Wali Kelas II",
        avatar: "/female-teacher-portrait-hijab.jpg",
        performanceScore: 88,
        status: "good",
        tasksCompleted: 44,
        totalTasks: 50,
      },
      {
        id: "3",
        name: "Ahmad Hidayat, S.Pd",
        position: "Guru IPA",
        avatar: "/male-science-teacher.png",
        performanceScore: 85,
        status: "good",
        tasksCompleted: 42,
        totalTasks: 50,
      },
      {
        id: "4",
        name: "Dewi Lestari, S.Pd",
        position: "Guru Bahasa Inggris",
        avatar: "/female-english-teacher.png",
        performanceScore: 79,
        status: "average",
        tasksCompleted: 38,
        totalTasks: 50,
      },
    ],
  },
  {
    id: "office-boy",
    name: "Office Boy",
    icon: "sparkles",
    description: "Petugas kebersihan dan pelayanan kantor",
    averageScore: 83,
    personnel: [
      {
        id: "5",
        name: "Dedi Mulyadi",
        position: "Office Boy Senior",
        avatar: "/male-janitor-worker.jpg",
        performanceScore: 86,
        status: "good",
        tasksCompleted: 44,
        totalTasks: 50,
      },
      {
        id: "6",
        name: "Yanto Susilo",
        position: "Office Boy",
        avatar: "/male-cleaner-worker.jpg",
        performanceScore: 80,
        status: "average",
        tasksCompleted: 38,
        totalTasks: 50,
      },
    ],
  },
  {
    id: "satpam",
    name: "Satpam",
    icon: "shield",
    description: "Petugas keamanan sekolah",
    averageScore: 86,
    personnel: [
      {
        id: "7",
        name: "Surya Darmawan",
        position: "Kepala Keamanan",
        avatar: "/male-security-guard-uniform.jpg",
        performanceScore: 90,
        status: "excellent",
        tasksCompleted: 48,
        totalTasks: 50,
      },
      {
        id: "8",
        name: "Agus Prasetyo",
        position: "Satpam",
        avatar: "/male-security-officer.jpg",
        performanceScore: 82,
        status: "good",
        tasksCompleted: 40,
        totalTasks: 50,
      },
    ],
  },
  {
    id: "tu-staff",
    name: "TU/Staff Kantor",
    icon: "briefcase",
    description: "Staff administrasi dan tata usaha",
    averageScore: 82,
    personnel: [
      {
        id: "9",
        name: "Rini Wulandari",
        position: "Kepala Tata Usaha",
        avatar: "/placeholder.svg?height=100&width=100",
        performanceScore: 90,
        status: "excellent",
        tasksCompleted: 95,
        totalTasks: 100,
      },
      {
        id: "10",
        name: "Joko Purnomo",
        position: "Staff Administrasi",
        avatar: "/placeholder.svg?height=100&width=100",
        performanceScore: 78,
        status: "average",
        tasksCompleted: 75,
        totalTasks: 100,
      },
      {
        id: "11",
        name: "Ani Suryani",
        position: "Staff Keuangan",
        avatar: "/placeholder.svg?height=100&width=100",
        performanceScore: 85,
        status: "good",
        tasksCompleted: 88,
        totalTasks: 100,
      },
    ],
  },
  {
    id: "staff-toko",
    name: "Staff Toko/Dapur",
    icon: "utensils",
    description: "Pengelola kantin dan dapur sekolah",
    averageScore: 81,
    personnel: [
      {
        id: "12",
        name: "Ibu Siti",
        position: "Staff Toko",
        avatar: "/placeholder.svg?height=100&width=100",
        performanceScore: 84,
        status: "good",
        tasksCompleted: 42,
        totalTasks: 50,
      },
      {
        id: "13",
        name: "Pak Maman",
        position: "Staff Dapur",
        avatar: "/placeholder.svg?height=100&width=100",
        performanceScore: 78,
        status: "average",
        tasksCompleted: 38,
        totalTasks: 50,
      },
    ],
  },
  {
    id: "it",
    name: "IT",
    icon: "monitor",
    description: "Staff teknologi informasi",
    averageScore: 88,
    personnel: [
      {
        id: "14",
        name: "Hendra Kusuma",
        position: "Kepala IT",
        avatar: "/placeholder.svg?height=100&width=100",
        performanceScore: 92,
        status: "excellent",
        tasksCompleted: 47,
        totalTasks: 50,
      },
      {
        id: "15",
        name: "Rizki Pratama",
        position: "Staff IT",
        avatar: "/placeholder.svg?height=100&width=100",
        performanceScore: 84,
        status: "good",
        tasksCompleted: 42,
        totalTasks: 50,
      },
    ],
  },
  {
    id: "publikasi-uks",
    name: "Publikasi dan UKS",
    icon: "megaphone",
    description: "Staff publikasi dan unit kesehatan sekolah",
    averageScore: 85,
    personnel: [
      {
        id: "16",
        name: "Lina Marlina",
        position: "Staff Publikasi",
        avatar: "/placeholder.svg?height=100&width=100",
        performanceScore: 86,
        status: "good",
        tasksCompleted: 43,
        totalTasks: 50,
      },
      {
        id: "17",
        name: "Ns. Ratna, S.Kep",
        position: "Perawat UKS",
        avatar: "/placeholder.svg?height=100&width=100",
        performanceScore: 88,
        status: "good",
        tasksCompleted: 45,
        totalTasks: 50,
      },
    ],
  },
]
