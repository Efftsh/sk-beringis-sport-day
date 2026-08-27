import { BaseSeeder } from '@adonisjs/lucid/seeders'
import House from '#models/house'
import Event from '#models/event'
import EventResult from '#models/event_result'
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
      const existing = await House.find(h.id)
      if (!existing) {
        await House.create(h)
      } else {
        // Only update metadata, keep existing points and medals!
        await House.query().where('id', h.id).update({
          name: h.name,
          color: h.color,
          lightBg: h.lightBg,
          badgeBg: h.badgeBg,
          motto: h.motto,
        })
      }
    }

    // 2. Seed Official 3-Day Championship Events (Tahun 1 - Tahun 6, Saringan & Akhir)
    const eventsData = [
      // ==========================================
      // 📅 HARI 1 — RABU, 26 OGOS 2026 (7:30 AM)
      // Padang SK Beringis (30 Acara Rasmi)
      // ==========================================

      // 7.30 PAGI — Acara Padang: Lompat Jauh (Tahun 3 & 4)
      { id: 'ev-01', code: 'A01', eventName: 'Lompat Jauh', category: 'Tahun 3 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 1)' },
      { id: 'ev-02', code: 'A02', eventName: 'Lompat Jauh', category: 'Tahun 3 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 1)' },
      { id: 'ev-03', code: 'A03', eventName: 'Lompat Jauh', category: 'Tahun 4 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 1)' },
      { id: 'ev-04', code: 'A04', eventName: 'Lompat Jauh', category: 'Tahun 4 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 1)' },

      // 8.00 PAGI — Balapan: 200 Meter (Akhir)
      { id: 'ev-17', code: 'A17', eventName: '200 meter', category: 'Tahun 4 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:30 AM (Hari 1)' },
      { id: 'ev-18', code: 'A18', eventName: '200 meter', category: 'Tahun 4 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:30 AM (Hari 1)' },
      { id: 'ev-19', code: 'A19', eventName: '200 meter', category: 'Tahun 5 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:30 AM (Hari 1)' },
      { id: 'ev-20', code: 'A20', eventName: '200 meter', category: 'Tahun 5 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:30 AM (Hari 1)' },
      { id: 'ev-21', code: 'A21', eventName: '200 meter', category: 'Tahun 6 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:30 AM (Hari 1)' },
      { id: 'ev-22', code: 'A22', eventName: '200 meter', category: 'Tahun 6 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:30 AM (Hari 1)' },

      // 8.00 PAGI — Balapan: 4 x 100 Meter (Akhir)
      { id: 'ev-23', code: 'A23', eventName: '4x100 meter', category: 'Tahun 3 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '09:00 AM (Hari 1)' },
      { id: 'ev-24', code: 'A24', eventName: '4x100 meter', category: 'Tahun 3 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '09:00 AM (Hari 1)' },
      { id: 'ev-25', code: 'A25', eventName: '4x100 meter', category: 'Tahun 4 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '09:00 AM (Hari 1)' },
      { id: 'ev-26', code: 'A26', eventName: '4x100 meter', category: 'Tahun 4 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '09:00 AM (Hari 1)' },
      { id: 'ev-27', code: 'A27', eventName: '4x100 meter', category: 'Tahun 5 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '09:00 AM (Hari 1)' },
      { id: 'ev-28', code: 'A28', eventName: '4x100 meter', category: 'Tahun 5 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '09:00 AM (Hari 1)' },
      { id: 'ev-29', code: 'A29', eventName: '4x100 meter', category: 'Tahun 6 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '09:00 AM (Hari 1)' },
      { id: 'ev-30', code: 'A30', eventName: '4x100 meter', category: 'Tahun 6 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '09:00 AM (Hari 1)' },

      // ==========================================
      // 📅 HARI 2 — KHAMIS, 27 OGOS 2026 (7:30 AM)
      // Padang SK Beringis (32 Acara Rasmi)
      // ==========================================

      // 7.30 PAGI — Acara Padang: Lompat Tinggi (Tahun 4, 5, 6), Lontar Peluru (Tahun 6, 5, 4) & Lompat Jauh (Tahun 6, 5)
      { id: 'ev-05', code: 'A05', eventName: 'Lompat Tinggi', category: 'Tahun 5 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 2)' },
      { id: 'ev-06', code: 'A06', eventName: 'Lompat Tinggi', category: 'Tahun 5 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 2)' },
      { id: 'ev-07', code: 'A07', eventName: 'Lompat Tinggi', category: 'Tahun 4 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 2)' },
      { id: 'ev-08', code: 'A08', eventName: 'Lompat Tinggi', category: 'Tahun 4 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 2)' },
      { id: 'ev-09', code: 'A09', eventName: 'Lompat Tinggi', category: 'Tahun 6 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 2)' },
      { id: 'ev-10', code: 'A10', eventName: 'Lompat Tinggi', category: 'Tahun 6 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 2)' },

      // 7.30 PAGI — Acara Padang: Lontar Peluru (Tahun 6, 5, 4) & Lompat Jauh (Tahun 6, 5)
      { id: 'ev-31', code: 'B01', eventName: 'Lontar Peluru', category: 'Tahun 6 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 2)' },
      { id: 'ev-32', code: 'B02', eventName: 'Lontar Peluru', category: 'Tahun 6 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 2)' },
      { id: 'ev-33', code: 'B03', eventName: 'Lontar Peluru', category: 'Tahun 5 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 2)' },
      { id: 'ev-34', code: 'B04', eventName: 'Lontar Peluru', category: 'Tahun 5 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 2)' },
      { id: 'ev-35', code: 'B05', eventName: 'Lontar Peluru', category: 'Tahun 4 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 2)' },
      { id: 'ev-36', code: 'B06', eventName: 'Lontar Peluru', category: 'Tahun 4 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 2)' },
      { id: 'ev-37', code: 'B07', eventName: 'Lompat Jauh', category: 'Tahun 6 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 2)' },
      { id: 'ev-38', code: 'B08', eventName: 'Lompat Jauh', category: 'Tahun 6 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 2)' },
      { id: 'ev-39', code: 'B09', eventName: 'Lompat Jauh', category: 'Tahun 5 Perempuan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 2)' },
      { id: 'ev-40', code: 'B10', eventName: 'Lompat Jauh', category: 'Tahun 5 Lelaki', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 2)' },

      // 8.00 PAGI — Balapan: 80 Meter (Tahun 1 & 2)
      { id: 'ev-41', code: 'B11', eventName: '80 meter', category: 'Tahun 1 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 2)' },
      { id: 'ev-42', code: 'B12', eventName: '80 meter', category: 'Tahun 1 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 2)' },
      { id: 'ev-43', code: 'B13', eventName: '80 meter', category: 'Tahun 2 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 2)' },
      { id: 'ev-44', code: 'B14', eventName: '80 meter', category: 'Tahun 2 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 2)' },

      // 8.00 PAGI — Balapan: 100 Meter (Tahun 3, 4, 5, 6)
      { id: 'ev-45', code: 'B15', eventName: '100 meter', category: 'Tahun 3 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 2)' },
      { id: 'ev-46', code: 'B16', eventName: '100 meter', category: 'Tahun 3 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 2)' },
      { id: 'ev-47', code: 'B17', eventName: '100 meter', category: 'Tahun 4 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 2)' },
      { id: 'ev-48', code: 'B18', eventName: '100 meter', category: 'Tahun 4 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 2)' },
      { id: 'ev-49', code: 'B19', eventName: '100 meter', category: 'Tahun 5 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 2)' },
      { id: 'ev-50', code: 'B20', eventName: '100 meter', category: 'Tahun 5 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 2)' },
      { id: 'ev-51', code: 'B21', eventName: '100 meter', category: 'Tahun 6 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 2)' },
      { id: 'ev-52', code: 'B22', eventName: '100 meter', category: 'Tahun 6 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:00 AM (Hari 2)' },

      // 8.00 PAGI — Balapan: 4 x 50 Meter (Tahun 1 & 2)
      { id: 'ev-53', code: 'B23', eventName: '4x50 meter', category: 'Tahun 1 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:30 AM (Hari 2)' },
      { id: 'ev-54', code: 'B24', eventName: '4x50 meter', category: 'Tahun 1 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:30 AM (Hari 2)' },
      { id: 'ev-55', code: 'B25', eventName: '4x50 meter', category: 'Tahun 2 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:30 AM (Hari 2)' },
      { id: 'ev-56', code: 'B26', eventName: '4x50 meter', category: 'Tahun 2 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:30 AM (Hari 2)' },

      // ==========================================
      // 📅 HARI 3 — JUMAAT, 28 OGOS 2026 (7:30 AM)
      // Padang SK Beringis (9 Acara Rasmi & Acara Kemuncak)
      // ==========================================

      // 7.30 PAGI — Balapan: 4 x 200m Akhir (Tahun 4, 5, 6)
      { id: 'ev-57', code: 'C01', eventName: '4x200 meter', category: 'Tahun 4 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 3)' },
      { id: 'ev-58', code: 'C02', eventName: '4x200 meter', category: 'Tahun 4 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 3)' },
      { id: 'ev-59', code: 'C03', eventName: '4x200 meter', category: 'Tahun 5 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 3)' },
      { id: 'ev-60', code: 'C04', eventName: '4x200 meter', category: 'Tahun 5 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 3)' },
      { id: 'ev-61', code: 'C05', eventName: '4x200 meter', category: 'Tahun 6 Perempuan', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 3)' },
      { id: 'ev-62', code: 'C06', eventName: '4x200 meter', category: 'Tahun 6 Lelaki', type: 'track' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '07:30 AM (Hari 3)' },

      // 8.30 PAGI — Acara Khas Antara Rumah Sukan (Perbarisan & Hiasan Rumah Sukan)
      { id: 'ev-64', code: 'C08', eventName: 'Perbarisan', category: 'Antara Rumah Sukan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '08:30 AM (Hari 3)' },
      { id: 'ev-65', code: 'C09', eventName: 'Rumah Sukan Tercantik', category: 'Antara Rumah Sukan', type: 'field' as const, stage: 'Akhir', status: 'pending' as const, scheduledTime: '09:00 AM (Hari 3)' },
    ]

    // Remove any obsolete events and their results not in the current official schedule
    await EventResult.query().whereNotIn('eventId', eventsData.map((e) => e.id)).delete()
    await Event.query().whereNotIn('id', eventsData.map((e) => e.id)).delete()

    for (const ev of eventsData) {
      await Event.updateOrCreate(
        { id: ev.id },
        {
          id: ev.id,
          code: ev.code,
          eventName: ev.eventName,
          category: ev.category,
          type: ev.type,
          stage: ev.stage,
          scheduledTime: ev.scheduledTime,
        }
      )
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
