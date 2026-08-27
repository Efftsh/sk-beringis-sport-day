import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Event from '#models/event'
import EventResult from '#models/event_result'
import House from '#models/house'

export default class ScoresController {
  /**
   * Save or update results for an event and recalculate house standings (Top 3: Emas, Perak, Gangsa)
   */
  async store({ params, request, response, session }: HttpContext) {
    const eventId = params.id
    const payload = request.only(['results'])

    const event = await Event.findOrFail(eventId)
    const resultsData = payload.results || []

    await db.transaction(async (trx) => {
      // 1. Delete existing results for this event
      await EventResult.query({ client: trx }).where('eventId', eventId).delete()

      const isSaringan = event.stage === 'Saringan'
      const isGroup =
        event.eventName.toLowerCase().includes('4x') ||
        event.eventName.toLowerCase().includes('4 x') ||
        event.eventName.toLowerCase().includes('sukaneka') ||
        event.eventName.toLowerCase().includes('kumpulan') ||
        event.eventName.toLowerCase().includes('perbarisan') ||
        event.eventName.toLowerCase().includes('tercantik')

      // 2. Insert results
      for (const res of resultsData) {
        if (!res.houseId) continue
        const rawName = (res.athleteName || '').trim()
        const athleteName = rawName || `Rumah ${res.houseId.charAt(0).toUpperCase() + res.houseId.slice(1)}`
        const place = Number(res.place) || 1
        
        if (!isSaringan && place > 3) continue // For Akhir events, strictly Top 3 podium

        const medal: 'gold' | 'silver' | 'bronze' | 'fourth' = isSaringan
          ? (place <= 6 ? 'qualifier' as any : 'fourth')
          : (place === 1 ? 'gold' : place === 2 ? 'silver' : 'bronze')

        const defaultPoints = isSaringan
          ? 0
          : isGroup
            ? (place === 1 ? 10 : place === 2 ? 7 : 5)
            : (place === 1 ? 7 : place === 2 ? 5 : 3)
        const points = isSaringan ? 0 : (typeof res.points === 'number' ? res.points : defaultPoints)

        await EventResult.create(
          {
            eventId: event.id,
            houseId: res.houseId,
            athleteName,
            bib: res.bib || null,
            place,
            medal,
            points,
            lane: res.lane ? Number(res.lane) : null,
            recordValue: res.recordValue || null,
            isRecordBroken: Boolean(res.isRecordBroken),
          },
          { client: trx }
        )
      }

      // 3. Mark event as completed
      event.useTransaction(trx)
      event.status = 'completed'
      await event.save()

      // 4. Recalculate house points and medal totals across all FINAL events (exclude Saringan)
      const allResults = await EventResult.query({ client: trx }).preload('event')
      const houseTallies: Record<
        string,
        { points: number; gold: number; silver: number; bronze: number; fourth: number }
      > = {
        merah: { points: 0, gold: 0, silver: 0, bronze: 0, fourth: 0 },
        biru: { points: 0, gold: 0, silver: 0, bronze: 0, fourth: 0 },
        kuning: { points: 0, gold: 0, silver: 0, bronze: 0, fourth: 0 },
        hijau: { points: 0, gold: 0, silver: 0, bronze: 0, fourth: 0 },
      }

      allResults.forEach((r) => {
        // Exclude Saringan heats from House medal tally & points
        if (r.event && r.event.stage === 'Saringan') return

        if (houseTallies[r.houseId]) {
          houseTallies[r.houseId].points += r.points || 0
          if (r.place === 1) houseTallies[r.houseId].gold += 1
          else if (r.place === 2) houseTallies[r.houseId].silver += 1
          else if (r.place === 3) houseTallies[r.houseId].bronze += 1
        }
      })

      // Sort houses by Olympic Medal Priority:
      // 1. Pingat Emas (Gold)
      // 2. Pingat Perak (Silver) - if Emas is a draw
      // 3. Pingat Gangsa (Bronze) - if Perak is a draw
      // 4. Jumlah Mata (Points) - tie-breaker
      const sortedIds = Object.keys(houseTallies).sort((a, b) => {
        return (
          houseTallies[b].gold - houseTallies[a].gold ||
          houseTallies[b].silver - houseTallies[a].silver ||
          houseTallies[b].bronze - houseTallies[a].bronze ||
          houseTallies[b].points - houseTallies[a].points
        )
      })

      for (let rankIndex = 0; rankIndex < sortedIds.length; rankIndex++) {
        const hId = sortedIds[rankIndex]
        const hData = houseTallies[hId]
        await House.query({ client: trx })
          .where('id', hId)
          .update({
            points: hData.points,
            goldMedals: hData.gold,
            silverMedals: hData.silver,
            bronzeMedals: hData.bronze,
            fourthPlaces: 0,
            rank: rankIndex + 1,
          })
      }
    })

    session.flash('notification', {
      type: 'success',
      message: `Keputusan ${event.eventName} (${event.category}) berjaya disimpan dalam pangkalan data!`,
    })

    return response.redirect().back()
  }
}
