/**
 * SK Beringis Sports Championship - Event and Year Linking Service
 * Handles extracting cohort year, gender, and matching registered events with athletes.
 */

// Helper to extract Year/Grade number ('1'|'2'|'3'|'4'|'5'|'6') from event category or name
export function getEventYear(category: string, eventName?: string): string | null {
  const text = `${category || ''} ${eventName || ''}`.toLowerCase()
  const match = text.match(/tahun\s*([1-6])/) || text.match(/thn\s*([1-6])/) || text.match(/\bt([1-6])\b/)
  if (match) return match[1]
  const matchYear = text.match(/([1-6])\s*tahun/)
  if (matchYear) return matchYear[1]
  return null
}

// Helper to extract Year/Grade number from athlete's class
export function getAthleteYear(className: string): string | null {
  if (!className) return null
  const clean = className.trim().toUpperCase()
  const match = clean.match(/^([1-6])\b/) || clean.match(/^([1-6])\s/) || clean.match(/TAHUN\s*([1-6])/) || clean.match(/\b([1-6])\b/)
  return match ? match[1] : null
}

// Smart event name matching
export function isAthleteRegisteredForEvent(athEventStr: string, currentEventName: string): boolean {
  const cleanAth = athEventStr.toLowerCase().replace(/\s+/g, '')
  const cleanCur = currentEventName.toLowerCase().replace(/\s+/g, '').replace('meter', 'm')

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

// Helper to determine if an event is a relay or group event evaluated by house
export function isGroupEvent(eventName: string): boolean {
  const clean = (eventName || '').toLowerCase()
  return (
    clean.includes('4x') ||
    clean.includes('4 x') ||
    clean.includes('sukaneka') ||
    clean.includes('kumpulan') ||
    clean.includes('relay')
  )
}

export type CohortYear = '6' | '5' | '4' | '3' | '2' | '1' | 'pra' | 'other'

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

export interface AthleteStandingEventItem {
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

export interface AthleteStandingItem {
  name: string
  gender: 'Lelaki' | 'Perempuan'
  year: CohortYear
  className?: string
  houseId: string
  houseName: string
  houseColor: string
  gold: number
  silver: number
  bronze: number
  individualGold: number
  individualSilver: number
  individualBronze: number
  groupGold: number
  groupSilver: number
  groupBronze: number
  totalPoints: number
  brokenRecordsCount: number
  eventsJoined: AthleteStandingEventItem[]
}

/**
 * Calculates athlete standings by combining individual events and group/relay events (4x50, 4x100, 4x200).
 */
export function calculateAthleteStandings(
  events: Array<{
    code?: string
    eventName: string
    category: string
    stage?: string
    status?: string
    results?: Array<{
      place: number
      houseId: string
      athleteName?: string
      points?: number
      recordValue?: string
      isRecordBroken?: boolean
    }>
  }>,
  registeredAthletes: Array<{
    id?: string
    name: string
    class: string
    gender: string
    houseId: string
    events: string[]
  }> = []
): AthleteStandingItem[] {
  const athleteMap = new Map<string, AthleteStandingItem>()

  const getOrCreate = (
    name: string,
    gender: 'Lelaki' | 'Perempuan',
    year: CohortYear,
    houseId: string,
    className?: string
  ): AthleteStandingItem => {
    const key = name.trim().toLowerCase()
    if (!athleteMap.has(key)) {
      athleteMap.set(key, {
        name: name.trim(),
        gender,
        year,
        className,
        houseId,
        houseName: houseId.charAt(0).toUpperCase() + houseId.slice(1),
        houseColor: '#2563eb',
        gold: 0,
        silver: 0,
        bronze: 0,
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
    if (ath.year === 'other' && year !== 'other') ath.year = year
    if (!ath.className && className) ath.className = className
    return ath
  }

  events.forEach((ev) => {
    if (ev.stage === 'Saringan' || !ev.results) return

    const isGroup = isGroupEvent(ev.eventName)
    const evYear = extractCohortYear(ev.category, ev.eventName)
    const evYearNum = getEventYear(ev.category, ev.eventName)
    const isPerempuan = ev.category.toLowerCase().includes('perempuan')
    const evGender: 'Lelaki' | 'Perempuan' = isPerempuan ? 'Perempuan' : 'Lelaki'

    if (isGroup) {
      ev.results.forEach((res) => {
        if (!res.houseId) return
        const place = Number(res.place) || 1
        if (place > 3) return

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

        const matchingAthletes = registeredAthletes.filter((ath) => {
          if (ath.houseId.toLowerCase() !== res.houseId.toLowerCase()) return false
          const athIsFemale = ath.gender?.toLowerCase().includes('perempuan')
          if (isPerempuan !== athIsFemale) return false
          if (evYearNum) {
            const athYear = getAthleteYear(ath.class)
            if (athYear && athYear !== evYearNum) return false
          }
          return ath.events && ath.events.some((eStr) => isAthleteRegisteredForEvent(eStr, ev.eventName))
        })

        matchingAthletes.forEach((athReg) => {
          const detectedYear = (getAthleteYear(athReg.class) as CohortYear) || evYear
          const ath = getOrCreate(athReg.name, evGender, detectedYear, athReg.houseId, athReg.class)

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
          if (res.isRecordBroken) ath.brokenRecordsCount += 1

          ath.eventsJoined.push({
            place,
            eventCode: ev.code || '',
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
      ev.results.forEach((res) => {
        if (!res.athleteName || res.athleteName.trim() === '') return
        const name = res.athleteName.trim()
        if (name.toLowerCase().startsWith('rumah ') || name.toLowerCase().startsWith('kuadren ')) return

        const place = Number(res.place) || 1
        if (place > 3) return

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

        const ath = getOrCreate(name, gender, detectedYear, res.houseId, regMatch?.class)
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
        }

        ath.totalPoints += points
        if (res.isRecordBroken) ath.brokenRecordsCount += 1

        ath.eventsJoined.push({
          place,
          eventCode: ev.code || '',
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

  return Array.from(athleteMap.values()).sort((a, b) => {
    if (b.gold !== a.gold) return b.gold - a.gold
    if (b.silver !== a.silver) return b.silver - a.silver
    if (b.bronze !== a.bronze) return b.bronze - a.bronze
    if (b.brokenRecordsCount !== a.brokenRecordsCount) return b.brokenRecordsCount - a.brokenRecordsCount
    return b.totalPoints - a.totalPoints
  })
}

