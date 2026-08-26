import fs from 'node:fs'
import type { HttpContext } from '@adonisjs/core/http'
import Athlete from '#models/athlete'
import ExcelImporterService from '#services/excel_importer_service'

export default class AthletesController {
  /**
   * Register a new athlete in the database
   */
  async store({ request, response, session }: HttpContext) {
    const payload = request.only(['name', 'class', 'gender', 'houseId', 'bib', 'events'])

    const generatedId = `ath-${Date.now()}`
    const generatedBib =
      payload.bib ||
      `${payload.houseId.charAt(0).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`

    await Athlete.create({
      id: generatedId,
      name: payload.name.trim(),
      className: payload.class,
      gender: payload.gender,
      houseId: payload.houseId,
      bib: generatedBib,
      eventsJson: Array.isArray(payload.events) ? payload.events : ['100 M [Individu - Utama]'],
    })

    session.flash('notification', {
      type: 'success',
      message: `Atlet "${payload.name}" berjaya didaftarkan ke Rumah ${payload.houseId.toUpperCase()}!`,
    })

    return response.redirect().back()
  }

  /**
   * Delete an athlete from the database
   */
  async destroy({ params, response, session }: HttpContext) {
    const athlete = await Athlete.findOrFail(params.id)
    await athlete.delete()

    session.flash('notification', {
      type: 'info',
      message: `Rekod atlet telah dipadamkan daripada pangkalan data.`,
    })

    return response.redirect().back()
  }

  /**
   * Delete ALL athletes from the database (Development / Reset tool)
   */
  async clearAll({ response, session }: HttpContext) {
    await Athlete.query().delete()

    session.flash('notification', {
      type: 'warning',
      message: `Semua rekod atlet telah berjaya dipadamkan daripada pangkalan data.`,
    })

    return response.redirect().back()
  }

  /**
   * Upload & dynamically parse any new Excel file (.xlsx) into the database
   */
  async uploadExcel({ request, response, session }: HttpContext) {
    const file = request.file('excel_file', {
      extnames: ['xlsx', 'xls'],
      size: '10mb',
    })

    if (!file || !file.tmpPath) {
      session.flash('notification', {
        type: 'error',
        message: 'Sila pilih fail Excel (.xlsx / .xls) yang sah.',
      })
      return response.redirect().back()
    }

    try {
      const buffer = fs.readFileSync(file.tmpPath)
      const parsedAthletes = ExcelImporterService.parseExcelBuffer(buffer, file.clientName)

      if (parsedAthletes.length === 0) {
        session.flash('notification', {
          type: 'warning',
          message: `Fail "${file.clientName}" dibaca tetapi tiada data atlet ditemui. Pastikan format ada lajur NAMA dan KELAS.`,
        })
        return response.redirect().back()
      }

      for (const ath of parsedAthletes) {
        const existing = await Athlete.query()
          .whereRaw('LOWER(TRIM(name)) = ?', [ath.name.trim().toLowerCase()])
          .where('houseId', ath.houseId)
          .first()

        if (existing) {
          existing.merge({
            className: ath.class,
            gender: ath.gender,
            bib: ath.bib || existing.bib,
            eventsJson: ath.events,
          })
          await existing.save()
        } else {
          await Athlete.create({
            id: ath.id,
            name: ath.name,
            className: ath.class,
            gender: ath.gender,
            houseId: ath.houseId,
            bib: ath.bib,
            eventsJson: ath.events,
          })
        }
      }

      const houseName = parsedAthletes[0]?.houseId.toUpperCase() || 'SUKAN'
      session.flash('notification', {
        type: 'success',
        message: `🎉 Berjaya! ${parsedAthletes.length} atlet dari fail "${file.clientName}" telah dimuat naik & disegerakkan ke Rumah ${houseName}!`,
      })
    } catch (error: any) {
      session.flash('notification', {
        type: 'error',
        message: `Gagal membaca fail Excel: ${error?.message || 'Ralat format fail'}`,
      })
    }

    return response.redirect().back()
  }

  /**
   * Re-sync / import Excel data into the database
   */
  async syncExcel({ response, session }: HttpContext) {
    const allAthletes = ExcelImporterService.getAllAthletes()
    for (const ath of allAthletes) {
      const existing = await Athlete.query()
        .whereRaw('LOWER(TRIM(name)) = ?', [ath.name.trim().toLowerCase()])
        .where('houseId', ath.houseId)
        .first()

      if (existing) {
        existing.merge({
          className: ath.class,
          gender: ath.gender,
          bib: ath.bib || existing.bib,
          eventsJson: ath.events,
        })
        await existing.save()
      } else {
        await Athlete.create({
          id: ath.id,
          name: ath.name,
          className: ath.class,
          gender: ath.gender,
          houseId: ath.houseId,
          bib: ath.bib,
          eventsJson: ath.events,
        })
      }
    }

    session.flash('notification', {
      type: 'success',
      message: `293 atlet berjaya disegerakkan daripada fail Excel rasmi ke pangkalan data!`,
    })

    return response.redirect().back()
  }
}
