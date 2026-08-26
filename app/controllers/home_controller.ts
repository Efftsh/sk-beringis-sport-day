import type { HttpContext } from '@adonisjs/core/http'
import House from '#models/house'
import Event from '#models/event'
import Athlete from '#models/athlete'

export default class HomeController {
  async index({ inertia }: HttpContext) {
    const championshipInfo = {
      title: 'Kejohanan Olahraga & Sukaneka Tahunan',
      schoolName: 'SK Beringis, Papar',
      edition: 'Kali Ke-27 (2026)',
      dates: '26 - 28 Ogos 2026',
      venue: 'Padang SK Beringis',
      status: 'Sedang Berlangsung',
      eBookletUrl: 'https://heyzine.com/flip-book/cbfede6cee.html',
      photosUrl: 'https://photos.app.goo.gl/ukTxVDzu1WZ4fiPcA',
    }

    // 1. Fetch live houses from Database
    const dbHouses = await House.query().orderBy('rank', 'asc')

    // 2. Fetch live athletes from Database
    const dbAthletes = await Athlete.query().orderBy('id', 'asc')

    const seenAthletes = new Set<string>()
    const registeredAthletes: Array<{
      id: string
      name: string
      class: string
      gender: string
      houseId: string
      bib: string
      events: string[]
    }> = []

    for (const ath of dbAthletes) {
      const cleanName = ath.name.trim()
      if (!cleanName || cleanName.startsWith('*')) continue
      const key = `${ath.houseId}:${cleanName.toLowerCase()}`
      if (!seenAthletes.has(key)) {
        seenAthletes.add(key)
        registeredAthletes.push({
          id: ath.id,
          name: ath.name,
          class: ath.className,
          gender: ath.gender,
          houseId: ath.houseId,
          bib: ath.bib,
          events: ath.eventsJson || [],
        })
      }
    }

    const houses = dbHouses.map((h) => ({
      id: h.id,
      name: h.name,
      color: h.color,
      lightBg: h.lightBg,
      badgeBg: h.badgeBg,
      motto: h.motto,
      rank: h.rank,
      points: h.points,
      medals: {
        gold: h.goldMedals,
        silver: h.silverMedals,
        bronze: h.bronzeMedals,
        fourth: h.fourthPlaces,
      },
      athletesCount: registeredAthletes.filter((a) => a.houseId === h.id).length,
    }))

    // 3. Fetch all events with preloaded results from Database
    const dbEvents = await Event.query()
      .preload('results', (query) => {
        query.orderBy('place', 'asc')
      })
      .orderBy('id', 'asc')

    const eventsList = dbEvents.map((ev) => ({
      id: ev.id,
      code: ev.code,
      eventName: ev.eventName,
      category: ev.category,
      type: ev.type,
      stage: ev.stage,
      status: ev.status,
      scheduledTime: ev.scheduledTime,
      results: ev.results.map((r) => ({
        place: r.place,
        medal: r.medal,
        points: r.points,
        houseId: r.houseId,
        athleteName: r.athleteName,
        bib: r.bib || undefined,
        lane: r.lane || undefined,
        recordValue: r.recordValue || undefined,
        isRecordBroken: r.isRecordBroken,
      })),
    }))

    return inertia.render('home', {
      championshipInfo,
      houses,
      eventsList,
      registeredAthletes,
      totalAthletes: dbAthletes.length,
    })
  }
}

