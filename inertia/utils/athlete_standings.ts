/**
 * SK Beringis Sports Championship - Athlete Standings & Special Awards Engine
 * Computes individual and relay/group contributions for Anugerah Khas (Tahun 6) & Harapan (Tahun 5).
 */

export type CohortYear = '6' | '5' | '4' | '3' | '2' | '1' | 'pra' | 'other'

export interface AthleteStandingEvent {
  place: number
  eventCode: string
  eventName: string
  category: string
  points: number
  recordValue?: string
  isRecordBroken?: boolean
  isGroup: boolean
  eventType: 'Individu' | 'Kumpulan'
  groupTag?: string
}

export interface AthleteStanding {
  name: string
  gender: 'Lelaki' | 'Perempuan'
  year: CohortYear
  category?: string
  className?: string
  houseId: string
  houseName: string
  houseColor: string
  bib?: string
  gold: number
  silver: number
  bronze: number
  fourth: number
  individualGold: number
  individualSilver: number
  individualBronze: number
  groupGold: number
  groupSilver: number
  groupBronze: number
  totalPoints: number
  brokenRecordsCount: number
  eventsJoined: AthleteStandingEvent[]
}

export interface EventResultItem {
  place: number
  medal?: string
  points?: number
  houseId: string
  athleteName?: string
  bib?: string
  lane?: number
  recordValue?: string
  isRecordBroken?: boolean
}

export interface EventRecordItem {
  id: string
  code: string
  eventName: string
  category: string
  type: string
  stage: string
  status: string
  scheduledTime?: string
  results?: EventResultItem[]
}

export interface HouseItem {
  id: string
  name: string
  color: string
}

export interface AthleteRegistrationItem {
  id: string
  name: string
  class: string
  gender: string
  houseId: string
  bib?: string
  events: string[]
}

// Extract Cohort Year ('6' | '5' | '4' | '3' | '2' | '1' | 'pra' | 'other')
export function extractCohortYear(category: string, eventName?: string): CohortYear {
  const text = `${category || ''} ${eventName || ''}`.toLowerCase()
  if (text.includes('tahun 6') || text.includes('thn 6') || text.match(/\bt6\b/)) return '6'
  if (text.includes('tahun 5') || text.includes('thn 5') || text.match(/\bt5\b/)) return '5'
  if (text.includes('tahun 4') || text.includes('thn 4') || text.match(/\bt4\b/)) return '4'
  if (text.includes('tahun 3') || text.includes('thn 3') || text.match(/\bt3\b/)) return '3'
  if (text.includes('tahun 2') || text.includes('thn 2') || text.match(/\bt2\b/)) return '2'
  if (text.includes('tahun 1') || text.includes('thn 1') || text.match(/\bt1\b/)) return '1'
  if (text.includes('6 tahun') || text.includes('prasekolah')) return 'pra'
  return 'other'
}

// Extract Year number from athlete's class
export function getAthleteYear(className: string): string | null {
  if (!className) return null
  const clean = className.trim().toUpperCase()
  const match =
    clean.match(/^([1-6])\b/) ||
    clean.match(/^([1-6])\s/) ||
    clean.match(/TAHUN\s*([1-6])/) ||
    clean.match(/\b([1-6])\b/)
  return match ? match[1] : null
}

// Extract Year number from event category/name
export function getEventYear(category: string, eventName?: string): string | null {
  const text = `${category || ''} ${eventName || ''}`.toLowerCase()
  const match = text.match(/tahun\s*([1-6])/) || text.match(/thn\s*([1-6])/) || text.match(/\bt([1-6])\b/)
  if (match) return match[1]
  const matchYear = text.match(/([1-6])\s*tahun/)
  if (matchYear) return matchYear[1]
  return null
}

// Check if an event is a relay or group event
export function isGroupEvent(eventName: string): boolean {
  const clean = (eventName || '').toLowerCase()
  return (
    clean.includes('4x') ||
    clean.includes('4 x') ||
    clean.includes('sukaneka') ||
    clean.includes('kumpulan') ||
    clean.includes('relay') ||
    clean.includes('berganti') ||
    clean.includes('tarik tali') ||
    clean.includes('perbarisan') ||
    clean.includes('tercantik')
  )
}

// Smart athlete event registration matching
export function isAthleteRegisteredForEvent(athEventStr: string, currentEventName: string): boolean {
  const cleanAth = (athEventStr || '').toLowerCase().replace(/\s+/g, '')
  const cleanCur = (currentEventName || '').toLowerCase().replace(/\s+/g, '').replace('meter', 'm')

  // Relays first to prevent partial '100m' or '50m' collision with '4x100m' / '4x50m'
  if (cleanCur.includes('4x50')) return cleanAth.includes('4x50')
  if (cleanCur.includes('4x100')) return cleanAth.includes('4x100')
  if (cleanCur.includes('4x200')) return cleanAth.includes('4x200')
  if (cleanCur.includes('sukaneka')) return cleanAth.includes('sukaneka')

  // Sprints (50m, 80m, 100m, 200m)
  if (cleanCur.includes('50m') && !cleanCur.includes('4x')) {
    return (cleanAth.includes('50m') || cleanAth.includes('80m') || cleanAth.includes('100m')) && !cleanAth.includes('4x')
  }
  if (cleanCur.includes('80m') && !cleanCur.includes('4x')) {
    return (cleanAth.includes('80m') || cleanAth.includes('50m')) && !cleanAth.includes('4x')
  }
  if (cleanCur.includes('100m') && !cleanCur.includes('4x')) {
    return cleanAth.includes('100m') && !cleanAth.includes('4x')
  }
  if (cleanCur.includes('200m') && !cleanCur.includes('4x')) {
    return cleanAth.includes('200m') && !cleanAth.includes('4x')
  }

  // Field events
  if (cleanCur.includes('tinggi')) return cleanAth.includes('tinggi')
  if (cleanCur.includes('jauh')) return cleanAth.includes('jauh')
  if (cleanCur.includes('peluru')) return cleanAth.includes('peluru')

  return cleanAth.includes(cleanCur)
}

/**
 * Computes comprehensive athlete standings including both individual & 4x50, 4x100, 4x200 relay events.
 */
export function computeAthleteStandings(
  events: EventRecordItem[],
  houses: HouseItem[],
  registeredAthletes: AthleteRegistrationItem[] = []
): AthleteStanding[] {
  const athleteMap = new Map<string, AthleteStanding>()

  const getOrCreateAthlete = (
    name: string,
    gender: 'Lelaki' | 'Perempuan',
    year: CohortYear,
    houseId: string,
    className?: string,
    bib?: string
  ): AthleteStanding => {
    const key = name.trim().toLowerCase()
    if (!athleteMap.has(key)) {
      const house = houses.find((h) => h.id.toLowerCase() === houseId.toLowerCase())
      const houseName = house ? house.name : houseId.charAt(0).toUpperCase() + houseId.slice(1)
      const houseColor = house ? house.color : '#2563eb'

      athleteMap.set(key, {
        name: name.trim(),
        gender,
        year,
        className,
        houseId,
        houseName,
        houseColor,
        bib,
        gold: 0,
        silver: 0,
        bronze: 0,
        fourth: 0,
        individualGold: 0,
        individualSilver: 0,
        individualBronze: 0,
        groupGold: 0,
        groupSilver: 0,
        groupBronze: 0,
        totalPoints: 0,
        brokenRecordsCount: 0,
        eventsJoined: [],
      })
    }

    const ath = athleteMap.get(key)!
    if (ath.year === 'other' && year !== 'other') {
      ath.year = year
    }
    if (!ath.className && className) {
      ath.className = className
    }
    if (!ath.bib && bib) {
      ath.bib = bib
    }
    return ath
  }

  // Pre-seed known registered athletes
  registeredAthletes.forEach((reg) => {
    const detectedYear = (getAthleteYear(reg.class) as CohortYear) || 'other'
    const gender: 'Lelaki' | 'Perempuan' =
      reg.gender?.toLowerCase().includes('perempuan') ? 'Perempuan' : 'Lelaki'
    getOrCreateAthlete(reg.name, gender, detectedYear, reg.houseId, reg.class, reg.bib)
  })

  // Process all completed official championship events (excluding preliminary Saringan heats)
  events.forEach((ev) => {
    if (ev.status !== 'completed' || ev.stage === 'Saringan' || !ev.results || ev.results.length === 0) {
      return
    }

    const isGroup = isGroupEvent(ev.eventName)
    const evYear = extractCohortYear(ev.category, ev.eventName)
    const evYearNum = getEventYear(ev.category, ev.eventName)
    const isPerempuan =
      ev.category.toLowerCase().includes('perempuan') ||
      ev.category.toLowerCase().includes('p1') ||
      ev.category.toLowerCase().includes('p2') ||
      ev.category.toLowerCase().includes('p0')
    const evGender: 'Lelaki' | 'Perempuan' = isPerempuan ? 'Perempuan' : 'Lelaki'

    if (isGroup) {
      // Whole-house events (Perbarisan, Rumah Sukan Tercantik) do not affect individual awards (Anugerah Khas / Harapan)
      const isHouseOnlyEvent =
        ev.eventName.toLowerCase().includes('perbarisan') ||
        ev.eventName.toLowerCase().includes('tercantik')
      if (isHouseOnlyEvent) return

      // ----------------------------------------------------
      // Group / Relay Event (e.g. 4x50m, 4x100m, 4x200m)
      // ----------------------------------------------------
      ev.results.forEach((res) => {
        if (!res.houseId) return
        const place = Number(res.place) || 1
        if (place > 3) return // Top 3 podium only

        const points =
          typeof res.points === 'number'
            ? res.points
            : place === 1
              ? 10
              : place === 2
                ? 7
                : place === 3
                  ? 5
                  : 0

        // Find all assigned athletes of this winning house matching category & cohort
        const matchingAthletesRaw = registeredAthletes.filter((ath) => {
          if (ath.houseId.toLowerCase() !== res.houseId.toLowerCase()) return false

          // Match gender if category is gender-specific
          const athIsFemale = ath.gender?.toLowerCase().includes('perempuan')
          if (isPerempuan !== athIsFemale) return false

          // Match year cohort if event specifies year
          if (evYearNum) {
            const athYear = getAthleteYear(ath.class)
            if (athYear && athYear !== evYearNum) return false
          }

          // Match registered event name
          return ath.events && ath.events.some((eStr) => isAthleteRegisteredForEvent(eStr, ev.eventName))
        })

        // Ensure unique athletes only (prevent duplicate registrations from multiplying medals)
        const matchingAthletes = Array.from(
          new Map(matchingAthletesRaw.map((a) => [a.name.trim().toLowerCase(), a])).values()
        )

        // Award medals and points to every assigned athlete
        matchingAthletes.forEach((athReg) => {
          const detectedYear = (getAthleteYear(athReg.class) as CohortYear) || evYear
          const ath = getOrCreateAthlete(
            athReg.name,
            evGender,
            detectedYear,
            athReg.houseId,
            athReg.class,
            athReg.bib
          )

          // Avoid awarding the same event twice to the same athlete
          const alreadyAwarded = ath.eventsJoined.some(
            (ej) => (ev.code && ej.eventCode === ev.code) || (ej.eventName === ev.eventName && ej.category === ev.category)
          )
          if (alreadyAwarded) return

          if (place === 1) {
            ath.gold += 1
            ath.groupGold += 1
          } else if (place === 2) {
            ath.silver += 1
            ath.groupSilver += 1
          } else if (place === 3) {
            ath.bronze += 1
            ath.groupBronze += 1
          }

          ath.totalPoints += points
          if (res.isRecordBroken) {
            ath.brokenRecordsCount += 1
          }

          ath.eventsJoined.push({
            place,
            eventCode: ev.code,
            eventName: ev.eventName,
            category: ev.category,
            points,
            recordValue: res.recordValue,
            isRecordBroken: res.isRecordBroken,
            isGroup: true,
            eventType: 'Kumpulan',
            groupTag: 'Acara Kumpulan / Relay',
          })
        })
      })
    } else {
      // ----------------------------------------------------
      // Individual Event (e.g. 100m, 200m, Lompat Jauh, etc.)
      // ----------------------------------------------------
      ev.results.forEach((res) => {
        if (!res.athleteName || res.athleteName.trim() === '') return
        const name = res.athleteName.trim()
        if (name.toLowerCase().startsWith('rumah ') || name.toLowerCase().startsWith('kuadren ')) {
          return
        }

        const place = Number(res.place) || 1
        if (place > 3 && ev.stage !== 'Saringan') return

        const regMatch = registeredAthletes.find(
          (a) => a.name.trim().toLowerCase() === name.toLowerCase()
        )
        const detectedYear =
          regMatch && getAthleteYear(regMatch.class)
            ? (getAthleteYear(regMatch.class) as CohortYear)
            : evYear
        const gender = regMatch
          ? (regMatch.gender?.toLowerCase().includes('perempuan') ? 'Perempuan' : 'Lelaki')
          : evGender

        const ath = getOrCreateAthlete(
          name,
          gender,
          detectedYear,
          res.houseId,
          regMatch?.class,
          res.bib || regMatch?.bib
        )

        // Avoid awarding the same event twice to the same athlete
        const alreadyAwarded = ath.eventsJoined.some(
          (ej) => (ev.code && ej.eventCode === ev.code) || (ej.eventName === ev.eventName && ej.category === ev.category)
        )
        if (alreadyAwarded) return

        const points =
          typeof res.points === 'number'
            ? res.points
            : place === 1
              ? 7
              : place === 2
                ? 5
                : place === 3
                  ? 3
                  : 0

        if (place === 1) {
          ath.gold += 1
          ath.individualGold += 1
        } else if (place === 2) {
          ath.silver += 1
          ath.individualSilver += 1
        } else if (place === 3) {
          ath.bronze += 1
          ath.individualBronze += 1
        } else if (place === 4) {
          ath.fourth += 1
        }

        ath.totalPoints += points
        if (res.isRecordBroken) {
          ath.brokenRecordsCount += 1
        }

        ath.eventsJoined.push({
          place,
          eventCode: ev.code,
          eventName: ev.eventName,
          category: ev.category,
          points,
          recordValue: res.recordValue,
          isRecordBroken: res.isRecordBroken,
          isGroup: false,
          eventType: 'Individu',
        })
      })
    }
  })

  // Sort Helper: Prioritize Individual Medals over Relay/Group Medals for Anugerah Khas & Harapan
  // 1. Individual Gold > 2. Individual Silver > 3. Individual Bronze > 4. Broken Records > 5. Group Gold > 6. Group Silver > 7. Group Bronze > 8. Total Points
  const sortAthletes = (a: AthleteStanding, b: AthleteStanding) => {
    if (b.individualGold !== a.individualGold) return b.individualGold - a.individualGold
    if (b.individualSilver !== a.individualSilver) return b.individualSilver - a.individualSilver
    if (b.individualBronze !== a.individualBronze) return b.individualBronze - a.individualBronze
    if (b.brokenRecordsCount !== a.brokenRecordsCount) return b.brokenRecordsCount - a.brokenRecordsCount
    if (b.groupGold !== a.groupGold) return b.groupGold - a.groupGold
    if (b.groupSilver !== a.groupSilver) return b.groupSilver - a.groupSilver
    if (b.groupBronze !== a.groupBronze) return b.groupBronze - a.groupBronze
    return b.totalPoints - a.totalPoints
  }

  // Filter only athletes who actually scored or participated in events
  return Array.from(athleteMap.values())
    .filter((a) => a.eventsJoined.length > 0 || a.totalPoints > 0 || a.gold > 0 || a.silver > 0 || a.bronze > 0)
    .sort(sortAthletes)
}

/**
 * Returns Top Contenders for Anugerah Khas (Tahun 6) and Anugerah Harapan (Tahun 5).
 */
export function getTopAwardContenders(athletes: AthleteStanding[]) {
  const topOlahragawanT6 = athletes.find((a) => a.gender === 'Lelaki' && a.year === '6') || null
  const topOlahragawatiT6 = athletes.find((a) => a.gender === 'Perempuan' && a.year === '6') || null
  const topHarapanBoyT5 = athletes.find((a) => a.gender === 'Lelaki' && a.year === '5') || null
  const topHarapanGirlT5 = athletes.find((a) => a.gender === 'Perempuan' && a.year === '5') || null

  return {
    topOlahragawanT6,
    topOlahragawatiT6,
    topHarapanBoyT5,
    topHarapanGirlT5,
  }
}
