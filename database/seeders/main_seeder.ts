import { BaseSeeder } from '@adonisjs/lucid/seeders'
import House from '#models/house'
import Event from '#models/event'
import Athlete from '#models/athlete'
import User from '#models/user'
import ExcelImporterService from '#services/excel_importer_service'

export default class extends BaseSeeder {
  async run() {
    // 0. Seed Default Admin User
    await User.updateOrCreate(
      { email: 'admin@skberingis.edu.my' },
      {
        fullName: 'Pentadbir Kejohanan SK Beringis',
        email: 'admin@skberingis.edu.my',
        password: 'password123',
      }
    )

    // 1. Seed Clean Houses (0 points, 0 medals - Top 3: Emas, Perak, Gangsa)
    const housesData = [
      {
        id: 'merah',
        name: 'Merah',
        color: '#dc2626',
        lightBg: '#fef2f2',
        badgeBg: 'bg-red-100 text-red-800 border-red-200',
        motto: 'Merah Membara Semangat Juang',
        rank: 1,
        points: 0,
        goldMedals: 0,
        silverMedals: 0,
        bronzeMedals: 0,
        fourthPlaces: 0,
      },
      {
        id: 'biru',
        name: 'Biru',
        color: '#2563eb',
        lightBg: '#eff6ff',
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
        motto: 'Biru Padu Menuju Juara',
        rank: 1,
        points: 0,
        goldMedals: 0,
        silverMedals: 0,
        bronzeMedals: 0,
        fourthPlaces: 0,
      },
      {
        id: 'kuning',
        name: 'Kuning',
        color: '#d97706',
        lightBg: '#fffbeb',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        motto: 'Kuning Gah Pantang Menyerah',
        rank: 1,
        points: 0,
        goldMedals: 0,
        silverMedals: 0,
        bronzeMedals: 0,
        fourthPlaces: 0,
      },
      {
        id: 'hijau',
        name: 'Hijau',
        color: '#16a34a',
        lightBg: '#f0fdf4',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        motto: 'Hijau Perkasa Menggegar Arena',
        rank: 1,
        points: 0,
        goldMedals: 0,
        silverMedals: 0,
        bronzeMedals: 0,
        fourthPlaces: 0,
      },
    ]

    for (const h of housesData) {
      await House.updateOrCreate({ id: h.id }, h)
    }

    // 2. Seed Official 3-Day Championship Events (Tahun 1 - Tahun 6, Saringan & Akhir)
    const eventsData = [
      // ==========================================
      // 📅 HARI 1 — RABU, 26 OGOS 2026 (7:00 AM)
      // Padang SK Beringis (34 Acara Rasmi)
      // ==========================================
      
      // 7.00 PAGI — Balapan Prasekolah / 6 Tahun (Akhir)
      { id: 'ev-01', code: 'A01', eventName: '50 meter', category: 'Lelaki (6 Tahun)', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-02', code: 'A02', eventName: '50 meter', category: 'Perempuan (6 Tahun)', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-03', code: 'A03', eventName: '4x50 meter', category: 'Lelaki (6 Tahun)', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-04', code: 'A04', eventName: '4x50 meter', category: 'Perempuan (6 Tahun)', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },

      // 7.00 PAGI — Acara Padang: Lompat Jauh (Akhir)
      { id: 'ev-05', code: 'A05', eventName: 'Lompat Jauh', category: 'Tahun 4 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-06', code: 'A06', eventName: 'Lompat Jauh', category: 'Tahun 4 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-07', code: 'A07', eventName: 'Lompat Jauh', category: 'Tahun 6 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-08', code: 'A08', eventName: 'Lompat Jauh', category: 'Tahun 6 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-09', code: 'A09', eventName: 'Lompat Jauh', category: 'Tahun 5 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-10', code: 'A10', eventName: 'Lompat Jauh', category: 'Tahun 5 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },

      // 7.00 PAGI — Acara Padang: Lontar Peluru (Akhir)
      { id: 'ev-11', code: 'A11', eventName: 'Lontar Peluru', category: 'Tahun 6 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-12', code: 'A12', eventName: 'Lontar Peluru', category: 'Tahun 6 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-13', code: 'A13', eventName: 'Lontar Peluru', category: 'Tahun 5 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-14', code: 'A14', eventName: 'Lontar Peluru', category: 'Tahun 5 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-15', code: 'A15', eventName: 'Lontar Peluru', category: 'Tahun 4 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-16', code: 'A16', eventName: 'Lontar Peluru', category: 'Tahun 4 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },

      // 7.00 PAGI — Acara Padang: Lompat Tinggi (Akhir)
      { id: 'ev-17', code: 'A17', eventName: 'Lompat Tinggi', category: 'Tahun 5 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-18', code: 'A18', eventName: 'Lompat Tinggi', category: 'Tahun 5 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-19', code: 'A19', eventName: 'Lompat Tinggi', category: 'Tahun 4 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-20', code: 'A20', eventName: 'Lompat Tinggi', category: 'Tahun 4 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-21', code: 'A21', eventName: 'Lompat Tinggi', category: 'Tahun 6 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },
      { id: 'ev-22', code: 'A22', eventName: 'Lompat Tinggi', category: 'Tahun 6 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 1)' },

      // 8.00 PAGI — Balapan: 200 Meter (Saringan)
      { id: 'ev-23', code: 'A23', eventName: '200 meter', category: 'Tahun 4 Perempuan', type: 'track' as const, stage: 'Saringan', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 1)' },
      { id: 'ev-24', code: 'A24', eventName: '200 meter', category: 'Tahun 4 Lelaki', type: 'track' as const, stage: 'Saringan', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 1)' },
      { id: 'ev-25', code: 'A25', eventName: '200 meter', category: 'Tahun 5 Perempuan', type: 'track' as const, stage: 'Saringan', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 1)' },
      { id: 'ev-26', code: 'A26', eventName: '200 meter', category: 'Tahun 5 Lelaki', type: 'track' as const, stage: 'Saringan', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 1)' },
      { id: 'ev-27', code: 'A27', eventName: '200 meter', category: 'Tahun 6 Perempuan', type: 'track' as const, stage: 'Saringan', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 1)' },
      { id: 'ev-28', code: 'A28', eventName: '200 meter', category: 'Tahun 6 Lelaki', type: 'track' as const, stage: 'Saringan', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 1)' },

      // 8.00 PAGI — Balapan: 4 x 200 Meter (Akhir)
      { id: 'ev-29', code: 'A29', eventName: '4x200 meter', category: 'Tahun 4 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 1)' },
      { id: 'ev-30', code: 'A30', eventName: '4x200 meter', category: 'Tahun 4 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 1)' },
      { id: 'ev-31', code: 'A31', eventName: '4x200 meter', category: 'Tahun 5 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 1)' },
      { id: 'ev-32', code: 'A32', eventName: '4x200 meter', category: 'Tahun 5 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 1)' },
      { id: 'ev-33', code: 'A33', eventName: '4x200 meter', category: 'Tahun 6 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 1)' },
      { id: 'ev-34', code: 'A34', eventName: '4x200 meter', category: 'Tahun 6 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 1)' },

      // ==========================================
      // 📅 HARI 2 — KHAMIS, 27 OGOS 2026 (7:00 AM)
      // Padang SK Beringis (18 Acara Rasmi)
      // ==========================================

      // 7.00 PAGI — 200m Akhir (Tahun 4, 5, 6)
      { id: 'ev-35', code: 'A35', eventName: '200 meter', category: 'Tahun 4 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },
      { id: 'ev-36', code: 'A36', eventName: '200 meter', category: 'Tahun 4 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },
      { id: 'ev-37', code: 'A37', eventName: '200 meter', category: 'Tahun 5 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },
      { id: 'ev-38', code: 'A38', eventName: '200 meter', category: 'Tahun 5 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },
      { id: 'ev-39', code: 'A39', eventName: '200 meter', category: 'Tahun 6 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },
      { id: 'ev-40', code: 'A40', eventName: '200 meter', category: 'Tahun 6 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },

      // 7.00 PAGI — 4 x 50m Akhir (Tahun 1 & 2)
      { id: 'ev-41', code: 'A41', eventName: '4x50 meter', category: 'Tahun 1 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },
      { id: 'ev-42', code: 'A42', eventName: '4x50 meter', category: 'Tahun 1 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },
      { id: 'ev-43', code: 'A43', eventName: '4x50 meter', category: 'Tahun 2 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },
      { id: 'ev-44', code: 'A44', eventName: '4x50 meter', category: 'Tahun 2 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },

      // 7.00 PAGI — 4 x 100m Akhir (Tahun 3 hingga 6)
      { id: 'ev-45', code: 'A45', eventName: '4x100 meter', category: 'Tahun 3 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },
      { id: 'ev-46', code: 'A46', eventName: '4x100 meter', category: 'Tahun 3 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },
      { id: 'ev-47', code: 'A47', eventName: '4x100 meter', category: 'Tahun 4 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },
      { id: 'ev-48', code: 'A48', eventName: '4x100 meter', category: 'Tahun 4 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },
      { id: 'ev-49', code: 'A49', eventName: '4x100 meter', category: 'Tahun 5 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },
      { id: 'ev-50', code: 'A50', eventName: '4x100 meter', category: 'Tahun 5 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },
      { id: 'ev-51', code: 'A51', eventName: '4x100 meter', category: 'Tahun 6 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },
      { id: 'ev-52', code: 'A52', eventName: '4x100 meter', category: 'Tahun 6 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 2)' },

      // ==========================================
      // 📅 HARI 3 — JUMAAT, 28 OGOS 2026 (7:00 AM)
      // Padang SK Beringis (13 Acara Rasmi & Acara Kemuncak)
      // ==========================================

      // 7.00 PAGI — 50m Akhir (Tahun 1 & 2)
      { id: 'ev-53', code: 'A53', eventName: '50 meter', category: 'Tahun 1 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 3)' },
      { id: 'ev-54', code: 'A54', eventName: '50 meter', category: 'Tahun 1 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 3)' },
      { id: 'ev-55', code: 'A55', eventName: '50 meter', category: 'Tahun 2 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 3)' },
      { id: 'ev-56', code: 'A56', eventName: '50 meter', category: 'Tahun 2 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 3)' },

      // 7.00 PAGI — 100m Akhir (Tahun 3, 4, 5)
      { id: 'ev-57', code: 'A57', eventName: '100 meter', category: 'Tahun 3 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 3)' },
      { id: 'ev-58', code: 'A58', eventName: '100 meter', category: 'Tahun 3 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 3)' },
      { id: 'ev-59', code: 'A59', eventName: '100 meter', category: 'Tahun 4 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 3)' },
      { id: 'ev-60', code: 'A60', eventName: '100 meter', category: 'Tahun 4 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 3)' },
      { id: 'ev-61', code: 'A61', eventName: '100 meter', category: 'Tahun 5 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 3)' },
      { id: 'ev-62', code: 'A62', eventName: '100 meter', category: 'Tahun 5 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:00 AM (Hari 3)' },

      // 8.30 PAGI — Acara Perasmian, Ikrar & 100m Akhir Tahun 6
      { id: 'ev-63', code: 'A63', eventName: '100 meter', category: 'Tahun 6 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '09:30 AM (Hari 3)' },
      { id: 'ev-64', code: 'A64', eventName: '100 meter', category: 'Tahun 6 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '09:30 AM (Hari 3)' },
      { id: 'ev-65', code: 'A65', eventName: 'Relay Ibubapa/Guru', category: 'Terbuka', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '10:00 AM (Hari 3)' },
    ]

    // Remove any obsolete events not in the current official schedule
    await Event.query().whereNotIn('id', eventsData.map((e) => e.id)).delete()

    for (const ev of eventsData) {
      await Event.updateOrCreate({ id: ev.id }, ev)
    }

    // 3. Seed 293 Real SK Beringis Athletes
    const allAthletes = ExcelImporterService.getAllAthletes()
    for (const ath of allAthletes) {
      await Athlete.updateOrCreate(
        { id: ath.id },
        {
          id: ath.id,
          name: ath.name,
          className: ath.class,
          gender: ath.gender,
          houseId: ath.houseId,
          bib: ath.bib,
          eventsJson: ath.events,
        }
      )
    }
  }
}
