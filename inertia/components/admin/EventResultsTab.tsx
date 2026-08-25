import { useState, type FormEvent } from 'react'
import {
  CheckCircle2,
  Clock,
  Search,
  Filter,
  X,
  Edit3,
  Printer,
  Sparkles,
  Check,
  RotateCcw,
} from 'lucide-react'
import { AthleteRegistrationItem } from './AthleteRegistrationTab'

export interface EventResultEntry {
  place: number // 1, 2, 3 (Podium: Emas, Perak, Gangsa)
  medal: 'gold' | 'silver' | 'bronze'
  points: number
  houseId: string
  athleteName: string
  bib?: string
  lane?: number
  recordValue?: string
  isRecordBroken?: boolean
  isManual?: boolean
}

export interface EventRecord {
  id: string
  code: string
  eventName: string
  category: string
  type: 'track' | 'field'
  stage: string
  status: 'pending' | 'completed'
  scheduledTime: string
  results?: EventResultEntry[]
}

export interface HouseItem {
  id: string
  name: string
  color: string
  lightBg: string
  badgeBg: string
  motto: string
  rank: number
  points: number
  medals: {
    gold: number
    silver: number
    bronze: number
    fourth?: number
  }
  athletesCount: number
}

interface EventResultsTabProps {
  events: EventRecord[]
  houses: HouseItem[]
  athletes?: AthleteRegistrationItem[]
  onSaveResult: (eventId: string, results: EventResultEntry[]) => void
}

// Benchmark records reference for SK Beringis
const BENCHMARK_RECORDS: Record<string, string> = {
  '80 meter': '12.40s',
  '100 meter': '13.15s',
  '200 meter': '28.30s',
  'Lompat Jauh': '4.45m',
  'Lompat Tinggi': '1.35m',
  'Lontar Peluru': '8.20m',
  '4x50 meter': '32.10s',
  '4x100 meter': '58.20s',
  '4x200 meter': '2:04.50s',
  'Sukaneka': '1:15.00s',
}

// Helper to extract Year/Grade number ('1'|'2'|'3'|'4'|'5'|'6') from event category or name
export const getEventYear = (category: string, eventName?: string): string | null => {
  const text = `${category || ''} ${eventName || ''}`.toLowerCase()
  const match = text.match(/tahun\s*([1-6])/) || text.match(/thn\s*([1-6])/) || text.match(/\bt([1-6])\b/)
  if (match) return match[1]
  const matchYear = text.match(/([1-6])\s*tahun/)
  if (matchYear) return matchYear[1]
  return null
}

// Helper to extract Year/Grade number from athlete's class
export const getAthleteYear = (className: string): string | null => {
  if (!className) return null
  const clean = className.trim().toUpperCase()
  const match = clean.match(/^([1-6])\b/) || clean.match(/^([1-6])\s/) || clean.match(/TAHUN\s*([1-6])/) || clean.match(/\b([1-6])\b/)
  return match ? match[1] : null
}

// Smart event name matching
export const isAthleteRegisteredForEvent = (athEventStr: string, currentEventName: string): boolean => {
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
export const isGroupEvent = (eventName: string): boolean => {
  const clean = (eventName || '').toLowerCase()
  return (
    clean.includes('4x') ||
    clean.includes('4 x') ||
    clean.includes('sukaneka') ||
    clean.includes('kumpulan') ||
    clean.includes('relay')
  )
}

export default function EventResultsTab({
  events,
  houses,
  athletes = [],
  onSaveResult,
}: EventResultsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEventType, setSelectedEventType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedDayFilter, setSelectedDayFilter] = useState<'all' | 'day1' | 'day2' | 'day3'>('all')
  const [selectedYearFilter, setSelectedYearFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5' | '6'>('all')

  // Scoring modal state
  const [scoringEvent, setScoringEvent] = useState<EventRecord | null>(null)
  const [formResults, setFormResults] = useState<EventResultEntry[]>([])
  const [manualInputFlags, setManualInputFlags] = useState<boolean[]>([false, false, false])

  // Printable scorecard modal state
  const [printEvent, setPrintEvent] = useState<EventRecord | null>(null)

  const eventTypes = [
    '50 meter',
    '80 meter',
    '100 meter',
    '200 meter',
    'Lompat Jauh',
    'Lontar Peluru',
    'Lompat Tinggi',
    '4x50 meter',
    '4x100 meter',
    '4x200 meter',
  ]

  const isFieldEvent = (name: string) => {
    const fieldKeywords = ['lompat jauh', 'lontar peluru', 'lompat tinggi']
    return fieldKeywords.some((keyword) => name.toLowerCase().includes(keyword))
  }

  const getEventUnitPlaceholder = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes('tinggi')) return '1.25 m'
    if (lower.includes('jauh')) return '4.20 m'
    if (lower.includes('peluru')) return '7.50 m'
    if (lower.includes('4x') || lower.includes('200')) return '00:29.50 s'
    return '00:13.20 s'
  }

  const getBenchmarkRecord = (eventName: string) => {
    for (const [key, val] of Object.entries(BENCHMARK_RECORDS)) {
      if (eventName.toLowerCase().includes(key.toLowerCase())) {
        return val
      }
    }
    return '13.50s'
  }

  // Helper to parse timing string into seconds for accurate sorting
  const parseTimeToSeconds = (val?: string): number => {
    if (!val || val.trim() === '') return 999999
    const clean = val.toLowerCase().replace(/s$/, '').trim()
    if (clean.includes(':')) {
      const parts = clean.split(':')
      const mins = parseFloat(parts[0]) || 0
      const secs = parseFloat(parts[1]) || 0
      return mins * 60 + secs
    }
    const secs = parseFloat(clean)
    return isNaN(secs) || secs <= 0 ? 999999 : secs
  }

  // Find corresponding Saringan for a 200m Akhir event
  const getRelatedSaringan = (ev: EventRecord): EventRecord | null => {
    if (ev.stage !== 'Akhir' || !ev.eventName.toLowerCase().includes('200')) return null
    return (
      events.find(
        (e) =>
          e.stage === 'Saringan' &&
          e.eventName.toLowerCase().includes('200') &&
          e.category.toLowerCase() === ev.category.toLowerCase()
      ) || null
    )
  }

  // Get the 6 qualified finalists from a completed Saringan event
  const getQualifiedFinalists = (saringanEvent: EventRecord | null): EventResultEntry[] => {
    if (!saringanEvent || !saringanEvent.results) return []
    return [...saringanEvent.results]
      .filter((r) => r.athleteName && r.athleteName.trim() !== '')
      .sort((a, b) => {
        if (a.place && b.place && a.place !== b.place) return a.place - b.place
        return parseTimeToSeconds(a.recordValue) - parseTimeToSeconds(b.recordValue)
      })
      .slice(0, 6)
  }

  const openScoringModal = (ev: EventRecord) => {
    setScoringEvent(ev)

    const isSaringan = ev.stage === 'Saringan'
    const isGroup = isGroupEvent(ev.eventName)
    const defaultHouses = ['merah', 'biru', 'kuning', 'hijau']

    // Standard MSSM points for Top 3 (Group/Relay: 10, 7, 5; Individual: 7, 5, 3)
    const defaultGold = isGroup ? 10 : 7
    const defaultSilver = isGroup ? 7 : 5
    const defaultBronze = isGroup ? 5 : 3

    if (isSaringan) {
      // Saringan 200m: Exactly 6 form slots (Lorong 1 - 6)
      if (ev.results && ev.results.length > 0) {
        setFormResults(
          ev.results.slice(0, 6).map((r, i) => ({
            place: r.place || i + 1,
            medal: 'qualifier' as any,
            points: 0,
            houseId: r.houseId || defaultHouses[i % 4],
            athleteName: r.athleteName || '',
            bib: r.bib || '',
            lane: r.lane || i + 1,
            recordValue: r.recordValue || '',
            isRecordBroken: r.isRecordBroken || false,
          }))
        )
        setManualInputFlags(new Array(Math.min(ev.results.length, 6)).fill(false))
      } else {
        // Initialize 6 clean blank slots (Lorong 1 - 6)
        const initialSlots: EventResultEntry[] = []
        for (let i = 0; i < 6; i++) {
          initialSlots.push({
            place: i + 1,
            medal: 'qualifier' as any,
            points: 0,
            houseId: defaultHouses[i % 4],
            athleteName: '',
            bib: '',
            lane: i + 1,
            recordValue: '',
            isRecordBroken: false,
          })
        }
        setFormResults(initialSlots)
        setManualInputFlags(new Array(6).fill(false))
      }
    } else {
      // Akhir (Finals): Exactly 3 Podium places (Emas, Perak, Gangsa)
      setManualInputFlags([false, false, false])

      if (ev.results && ev.results.length >= 3) {
        setFormResults(
          ev.results.slice(0, 3).map((r, i) => {
            const hId = r.houseId || defaultHouses[i % 4]
            const hName = getHouseName(hId)
            return {
              place: i + 1,
              medal: i === 0 ? 'gold' : i === 1 ? 'silver' : 'bronze',
              points: r.points || (i === 0 ? defaultGold : i === 1 ? defaultSilver : defaultBronze),
              houseId: hId,
              athleteName: isGroup ? `Rumah ${hName}` : (r.athleteName || ''),
              bib: isGroup ? '' : (r.bib || ''),
              lane: r.lane || i + 1,
              recordValue: r.recordValue || '',
              isRecordBroken: r.isRecordBroken || false,
            }
          })
        )
      } else {
        // Automatically make the 6 qualifiers from Saringan available for 200m Akhir!
        const saringan = getRelatedSaringan(ev)
        const finalists = saringan ? getQualifiedFinalists(saringan) : []

        setFormResults([
          {
            place: 1,
            medal: 'gold',
            points: defaultGold,
            houseId: finalists[0] ? finalists[0].houseId : defaultHouses[0],
            athleteName: isGroup
              ? `Rumah ${getHouseName(defaultHouses[0])}`
              : (finalists[0] ? finalists[0].athleteName : ''),
            bib: finalists[0] ? finalists[0].bib || '' : '',
            lane: 1,
            recordValue: '',
            isRecordBroken: false,
          },
          {
            place: 2,
            medal: 'silver',
            points: defaultSilver,
            houseId: finalists[1] ? finalists[1].houseId : defaultHouses[1],
            athleteName: isGroup
              ? `Rumah ${getHouseName(defaultHouses[1])}`
              : (finalists[1] ? finalists[1].athleteName : ''),
            bib: finalists[1] ? finalists[1].bib || '' : '',
            lane: 2,
            recordValue: '',
            isRecordBroken: false,
          },
          {
            place: 3,
            medal: 'bronze',
            points: defaultBronze,
            houseId: finalists[2] ? finalists[2].houseId : defaultHouses[2],
            athleteName: isGroup
              ? `Rumah ${getHouseName(defaultHouses[2])}`
              : (finalists[2] ? finalists[2].athleteName : ''),
            bib: finalists[2] ? finalists[2].bib || '' : '',
            lane: 3,
            recordValue: '',
            isRecordBroken: false,
          },
        ])
      }
    }
  }

  // Auto-sort Saringan by fastest time (Lorong 1 - 6)
  const handleAutoSortSaringan = () => {
    setFormResults((prev) => {
      const withTimes = prev.filter((r) => r.athleteName && r.athleteName.trim() !== '')
      const empties = prev.filter((r) => !r.athleteName || r.athleteName.trim() === '')

      // Sort populated runners by fastest time (lowest seconds)
      withTimes.sort((a, b) => {
        const timeA = parseTimeToSeconds(a.recordValue)
        const timeB = parseTimeToSeconds(b.recordValue)
        return timeA - timeB
      })

      const combined = [...withTimes, ...empties]

      return combined.map((res, i) => ({
        ...res,
        place: i + 1,
        medal: 'qualifier' as any,
        points: 0,
      }))
    })
  }

  // Load 6 qualified finalists from Saringan into Akhir form
  const handleLoadFinalistsIntoAkhir = (finalists: EventResultEntry[]) => {
    setFormResults((prev) => {
      return prev.map((res, i) => {
        if (finalists[i]) {
          return {
            ...res,
            athleteName: finalists[i].athleteName,
            houseId: finalists[i].houseId,
            bib: finalists[i].bib || '',
          }
        }
        return res
      })
    })
  }

  const handleFieldChange = (index: number, field: keyof EventResultEntry, value: any) => {
    setFormResults((prev) =>
      prev.map((res, i) => {
        if (i === index) {
          return { ...res, [field]: value }
        }
        return res
      })
    )
  }

  const handleAthleteDropdownSelect = (index: number, athleteId: string) => {
    if (!athleteId) return
    const selectedAth = athletes.find((a) => a.id === athleteId)
    if (selectedAth) {
      setFormResults((prev) =>
        prev.map((res, i) => {
          if (i === index) {
            return {
              ...res,
              athleteName: selectedAth.name,
              bib: selectedAth.bib,
            }
          }
          return res
        })
      )
    }
  }

  const toggleManualInput = (index: number) => {
    setManualInputFlags((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  const handleModalSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (scoringEvent) {
      onSaveResult(scoringEvent.id, formResults)
      setScoringEvent(null)
    }
  }

  const getHouseColor = (houseId: string) => {
    const h = houses.find((x) => x.id === houseId)
    return h ? h.color : '#64748b'
  }

  const getHouseName = (houseId: string) => {
    const h = houses.find((x) => x.id === houseId)
    return h ? h.name : houseId
  }

  // Filter candidates for an event linked strictly by Year (Tahun), Gender, and House
  const getHouseCandidates = (houseId: string) => {
    if (!scoringEvent) return { main: [], reserve: [], allHouse: [], targetYear: null, totalEligible: 0 }

    const evYear = getEventYear(scoringEvent.category, scoringEvent.eventName)
    const houseAthletes = athletes.filter((a) => a.houseId === houseId)

    // Filter by Gender & Target Year
    const eligibleAthletes = houseAthletes.filter((ath) => {
      // 1. Gender Match
      if (scoringEvent.category.toLowerCase().includes('perempuan') && ath.gender !== 'Perempuan') {
        return false
      }
      if (scoringEvent.category.toLowerCase().includes('lelaki') && ath.gender !== 'Lelaki') {
        return false
      }

      // 2. Year (Tahun) Match: Strict link with event year
      if (evYear) {
        const athYear = getAthleteYear(ath.class)
        if (athYear && athYear !== evYear) {
          return false
        }
      }

      return true
    })

    const mainList: AthleteRegistrationItem[] = []
    const reserveList: AthleteRegistrationItem[] = []
    const otherList: AthleteRegistrationItem[] = []

    eligibleAthletes.forEach((ath) => {
      const matchingEvent = ath.events.find((ev) => isAthleteRegisteredForEvent(ev, scoringEvent.eventName))

      if (matchingEvent) {
        if (matchingEvent.toLowerCase().includes('simpanan')) {
          reserveList.push(ath)
        } else {
          mainList.push(ath)
        }
      } else {
        otherList.push(ath)
      }
    })

    return {
      main: mainList,
      reserve: reserveList,
      allHouse: otherList,
      targetYear: evYear,
      totalEligible: eligibleAthletes.length,
    }
  }

  // Live progress calculation
  const totalEventsCount = events.length
  const completedEventsCount = events.filter((e) => e.status === 'completed').length
  const progressPercent = totalEventsCount > 0 ? Math.round((completedEventsCount / totalEventsCount) * 100) : 0

  // Count calculations for sidebar filters
  const yearCounts = {
    all: events.length,
    '1': events.filter((e) => getEventYear(e.category, e.eventName) === '1').length,
    '2': events.filter((e) => getEventYear(e.category, e.eventName) === '2').length,
    '3': events.filter((e) => getEventYear(e.category, e.eventName) === '3').length,
    '4': events.filter((e) => getEventYear(e.category, e.eventName) === '4').length,
    '5': events.filter((e) => getEventYear(e.category, e.eventName) === '5').length,
    '6': events.filter((e) => getEventYear(e.category, e.eventName) === '6').length,
  }

  const dayCounts = {
    all: events.length,
    day1: events.filter((e) => {
      const s = e.scheduledTime.toLowerCase()
      return s.includes('hari 1') || s.includes('26')
    }).length,
    day2: events.filter((e) => {
      const s = e.scheduledTime.toLowerCase()
      return s.includes('hari 2') || s.includes('27')
    }).length,
    day3: events.filter((e) => {
      const s = e.scheduledTime.toLowerCase()
      return s.includes('hari 3') || s.includes('28')
    }).length,
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedYearFilter('all')
    setSelectedDayFilter('all')
    setSelectedStatus('all')
    setSelectedEventType('all')
  }

  // Filter events
  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.code.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType =
      selectedEventType === 'all' ||
      ev.eventName.toLowerCase().includes(selectedEventType.toLowerCase())

    const matchesStatus = selectedStatus === 'all' || ev.status === selectedStatus

    const scheduledLower = ev.scheduledTime.toLowerCase()
    const isDay1 = scheduledLower.includes('hari 1') || scheduledLower.includes('26')
    const isDay2 = scheduledLower.includes('hari 2') || scheduledLower.includes('27')
    const isDay3 = scheduledLower.includes('hari 3') || scheduledLower.includes('28')
    const matchesDay =
      selectedDayFilter === 'all' ||
      (selectedDayFilter === 'day1' && isDay1) ||
      (selectedDayFilter === 'day2' && isDay2) ||
      (selectedDayFilter === 'day3' && isDay3)

    const evYear = getEventYear(ev.category, ev.eventName)
    const matchesYear = selectedYearFilter === 'all' || evYear === selectedYearFilter

    return matchesSearch && matchesType && matchesStatus && matchesDay && matchesYear
  })

  return (
    <div className="event-results-tab-container">
      {/* Live Event Progress Bar Banner */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '18px',
          padding: '18px 24px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--forest-green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              KEMAJUAN KEPUTUSAN ACARA RASMI (TOP 3: EMAS, PERAK, GANGSA)
            </span>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
              {completedEventsCount} daripada {totalEventsCount} Acara Telah Selesai Direkodkan ({progressPercent}%)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
              🥇 7 pts (Ind) / 10 pts (Kump)
            </span>
            <span style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
              🥈 5 pts / 7 pts
            </span>
            <span style={{ background: '#ffedd5', color: '#9a3412', border: '1px solid #fed7aa', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
              🥉 3 pts / 5 pts
            </span>
          </div>
        </div>

        {/* Progress Track */}
        <div style={{ background: '#f1f5f9', height: '10px', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981 0%, #2d7a5f 100%)',
              transition: 'width 0.4s ease',
              borderRadius: '9999px',
            }}
          />
        </div>
      </div>

      {/* 2-Column Responsive Layout with Sidebar Filter Card */}
      <div className="event-results-layout-grid">
        {/* Left Column: Tapis Acara Sidebar Card */}
        <aside
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '20px 16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            position: 'sticky',
            top: '20px',
          }}
        >
          {/* Card Title Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '4px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              Tapis Acara
            </h3>
            {(selectedYearFilter !== 'all' || selectedDayFilter !== 'all' || selectedStatus !== 'all' || selectedEventType !== 'all' || searchQuery) && (
              <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                Ditapis
              </span>
            )}
          </div>

          {/* Section 1: Peringkat Tahun */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Peringkat Tahun
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Semua Tahun */}
              <button
                type="button"
                onClick={() => setSelectedYearFilter('all')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: selectedYearFilter === 'all' ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                  background: selectedYearFilter === 'all' ? '#e2e8f0' : '#ffffff',
                  color: selectedYearFilter === 'all' ? '#0f172a' : '#334155',
                  fontWeight: selectedYearFilter === 'all' ? 800 : 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      background: selectedYearFilter === 'all' ? '#22c55e' : '#ffffff',
                      border: selectedYearFilter === 'all' ? 'none' : '1.5px solid #94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    {selectedYearFilter === 'all' && <Check size={13} strokeWidth={3} />}
                  </div>
                  <span>Semua Tahun</span>
                </div>
              </button>

              {/* Tahun 1 - 6 */}
              {(['1', '2', '3', '4', '5', '6'] as const).map((yr) => {
                const isSelected = selectedYearFilter === yr
                const count = yearCounts[yr]
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedYearFilter(yr)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: isSelected ? '1px solid #16a34a' : '1px solid #e2e8f0',
                      background: isSelected ? '#16a34a' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#334155',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '5px',
                          background: isSelected ? '#ffffff' : '#ffffff',
                          border: isSelected ? 'none' : '1.5px solid #94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSelected ? '#16a34a' : 'transparent',
                        }}
                      >
                        {isSelected && <Check size={13} strokeWidth={3} />}
                      </div>
                      <span>Tahun {yr}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#ffffff' : '#64748b' }}>
                      ({count})
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 2: Hari Acara */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Hari Acara
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Semua Hari */}
              <button
                type="button"
                onClick={() => setSelectedDayFilter('all')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: selectedDayFilter === 'all' ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                  background: selectedDayFilter === 'all' ? '#e2e8f0' : '#ffffff',
                  color: selectedDayFilter === 'all' ? '#0f172a' : '#334155',
                  fontWeight: selectedDayFilter === 'all' ? 800 : 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      background: selectedDayFilter === 'all' ? '#22c55e' : '#ffffff',
                      border: selectedDayFilter === 'all' ? 'none' : '1.5px solid #94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    {selectedDayFilter === 'all' && <Check size={13} strokeWidth={3} />}
                  </div>
                  <span>Semua Hari</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: selectedDayFilter === 'all' ? '#475569' : '#94a3b8' }}>
                  ({dayCounts.all})
                </span>
              </button>

              {[
                { id: 'day1', label: 'Hari 1 (26 Ogos...)' },
                { id: 'day2', label: 'Hari 2 (27 Ogos...)' },
                { id: 'day3', label: 'Hari 3 (28 Ogos...)' },
              ].map((day) => {
                const isSelected = selectedDayFilter === day.id
                const count = dayCounts[day.id as keyof typeof dayCounts]
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedDayFilter(day.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: isSelected ? '1px solid #16a34a' : '1px solid #e2e8f0',
                      background: isSelected ? '#16a34a' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#334155',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '5px',
                          background: isSelected ? '#ffffff' : '#ffffff',
                          border: isSelected ? 'none' : '1.5px solid #94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSelected ? '#16a34a' : 'transparent',
                        }}
                      >
                        {isSelected && <Check size={13} strokeWidth={3} />}
                      </div>
                      <span>{day.label}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#ffffff' : '#64748b' }}>
                      ({count})
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 3: Status & Jenis Acara */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Status Acara
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'Semua' },
                { id: 'completed', label: '✅ Selesai' },
                { id: 'pending', label: '⏳ Belum' },
              ].map((st) => {
                const isSelected = selectedStatus === st.id
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStatus(st.id)}
                    style={{
                      flex: '1 1 0',
                      padding: '6px 8px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid #16a34a' : '1px solid #e2e8f0',
                      background: isSelected ? '#16a34a' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#334155',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '11px',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {st.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Reset Filters Button */}
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              width: '100%',
              padding: '11px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '13px',
              color: '#0f172a',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
        </aside>

        {/* Right Main Content Area */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Search and Type Controls */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-input-wrap" style={{ flex: '1 1 260px' }}>
              <Search size={16} className="search-icon-svg" />
              <input
                type="text"
                placeholder="Cari acara (cth: 100 meter, Lompat Jauh, Tahun 4)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tab-search-input"
              />
            </div>

            <div className="filter-select-wrap" style={{ minWidth: '180px' }}>
              <Filter size={14} className="filter-icon" />
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="tab-select"
              >
                <option value="all">Semua Jenis Acara</option>
                {eventTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(selectedYearFilter !== 'all' || selectedDayFilter !== 'all' || selectedStatus !== 'all' || selectedEventType !== 'all' || searchQuery) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                padding: '8px 12px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            >
              <span style={{ fontWeight: 800, color: '#64748b' }}>Penapis Aktif:</span>

              {selectedYearFilter !== 'all' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#dcfce7',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                  }}
                >
                  🏷️ Tahun {selectedYearFilter}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedYearFilter('all')} />
                </span>
              )}

              {selectedDayFilter !== 'all' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                  }}
                >
                  📅 {selectedDayFilter === 'day1' ? 'Hari 1' : selectedDayFilter === 'day2' ? 'Hari 2' : 'Hari 3'}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedDayFilter('all')} />
                </span>
              )}

              {selectedStatus !== 'all' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                  }}
                >
                  {selectedStatus === 'completed' ? '✅ Selesai' : '⏳ Belum Catat'}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedStatus('all')} />
                </span>
              )}

              {selectedEventType !== 'all' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                  }}
                >
                  🎯 {selectedEventType}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedEventType('all')} />
                </span>
              )}

              {searchQuery && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                  }}
                >
                  🔍 "{searchQuery}"
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginLeft: 'auto',
                  fontSize: '11px',
                  textDecoration: 'underline',
                }}
              >
                Set Semula
              </button>
            </div>
          )}

          {/* Results Summary Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            <span>
              Memaparkan <strong style={{ color: '#0f172a' }}>{filteredEvents.length}</strong> daripada {events.length} acara
              {selectedYearFilter !== 'all' && ` (Tahun ${selectedYearFilter})`}
            </span>
          </div>

          {/* Events Grid / Cards */}
          {filteredEvents.length === 0 ? (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Tiada Acara Dijumpai</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Sila cuba tukar tetapan penapis atau kata kunci carian anda.</div>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{ padding: '8px 16px', background: '#2d7a5f', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Set Semula Penapis
              </button>
            </div>
          ) : (
            <div className="events-catalog-grid" style={{ margin: 0 }}>
              {filteredEvents.map((ev) => {
                const isField = isFieldEvent(ev.eventName)
                const isDone = ev.status === 'completed'
                const benchmark = getBenchmarkRecord(ev.eventName)
                const evYear = getEventYear(ev.category, ev.eventName)

                return (
                  <div
                    key={ev.id}
                    className={`event-catalog-card ${isDone ? 'is-completed' : 'is-pending'}`}
                  >
                    <div className="event-card-top">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className="event-code-badge">{ev.code}</div>
                        {evYear && (
                          <span
                            style={{
                              background: '#f3e8ff',
                              color: '#7e22ce',
                              border: '1px solid #e9d5ff',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 800,
                            }}
                          >
                            Tahun {evYear}
                          </span>
                        )}
                      </div>
                      <div className="event-type-pill">
                        {isField ? '🎯 Acara Padang' : '🏃 Acara Balapan'}
                      </div>
                      {ev.stage === 'Saringan' && (
                        <div style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                          ⏱️ Saringan (6 Lorong)
                        </div>
                      )}
                      <div className={`event-status-tag ${isDone ? 'tag-done' : 'tag-pending'}`}>
                        {isDone ? '✅ Selesai' : '⏳ Belum Catat'}
                      </div>
                    </div>

                    <h4 className="event-card-name">{ev.eventName}</h4>
                    <div className="event-card-category">{ev.category}</div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0', fontSize: '11px', color: '#64748b' }}>
                      <div className="event-time-row" style={{ margin: 0 }}>
                        <Clock size={12} />
                        <span>{ev.scheduledTime}</span>
                      </div>
                      <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        📌 Rekod: {benchmark}
                      </span>
                    </div>

                    {/* Display Placings if Completed */}
                    {isDone && ev.results && ev.results.length > 0 && (
                      <div className="card-podium-preview" style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                          {ev.stage === 'Saringan' ? '🏅 6 Peserta Layak ke Akhir (6 Lorong)' : 'Keputusan Rasmi (Podium Top 3)'}
                        </div>
                        {ev.results.slice(0, ev.stage === 'Saringan' ? 6 : 3).map((res, i) => {
                          const medalEmoji = ev.stage === 'Saringan' ? '🟢 Q' : (i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉')
                          const isGroup = isGroupEvent(ev.eventName)
                          return (
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '12px',
                                padding: '3px 0',
                                borderBottom: i < (ev.stage === 'Saringan' ? 5 : 2) ? '1px dashed #e2e8f0' : 'none',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 800, color: ev.stage === 'Saringan' ? '#047857' : '#0f172a' }}>{medalEmoji} #{res.place}</span>
                                {isGroup ? (
                                  <span style={{ color: getHouseColor(res.houseId), fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getHouseColor(res.houseId), display: 'inline-block' }} />
                                    Rumah {getHouseName(res.houseId)}
                                  </span>
                                ) : (
                                  <>
                                    <strong style={{ color: '#0f172a' }}>{res.athleteName}</strong>
                                    <span style={{ color: getHouseColor(res.houseId), fontWeight: 700 }}>
                                      ({getHouseName(res.houseId)})
                                    </span>
                                  </>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {res.recordValue && (
                                  <span style={{ color: '#64748b', fontWeight: 600 }}>{res.recordValue}</span>
                                )}
                                {ev.stage !== 'Saringan' && (
                                  <span style={{ fontWeight: 800, color: 'var(--forest-green)' }}>+{res.points}pt</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Action Buttons: Input Result + Print Scorecard */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                      <button
                        type="button"
                        className="btn-record-score"
                        onClick={() => openScoringModal(ev)}
                        style={{ flex: 1 }}
                      >
                        {isDone
                          ? (ev.stage === 'Saringan' ? '✏️ Kemas Kini Saringan (6 Pelari)' : '✏️ Kemas Kini Keputusan')
                          : (ev.stage === 'Saringan' ? '➕ Rekod Saringan 200m (6 Lorong)' : '➕ Rekod Keputusan (Top 3)')}
                      </button>

                      {isDone && (
                        <button
                          type="button"
                          onClick={() => setPrintEvent(ev)}
                          title="Cetak Borang Hakim Penamat"
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '10px',
                            padding: '0 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          <Printer size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Scoring Modal */}
      {scoringEvent && (
        <div className="modal-backdrop-custom" onClick={() => setScoringEvent(null)}>
          <div
            className="modal-content-card"
            style={{ maxWidth: scoringEvent.stage === 'Saringan' ? '780px' : isGroupEvent(scoringEvent.eventName) ? '760px' : '720px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="modal-code-tag">{scoringEvent.code}</span>
                  <span className="modal-title-bold">{scoringEvent.eventName}</span>
                  {isGroupEvent(scoringEvent.eventName) ? (
                    <span
                      style={{
                        background: '#ecfdf5',
                        color: '#047857',
                        border: '1px solid #a7f3d0',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      👥 Acara Kumpulan / Berganti-ganti (Pemenang Mengikut Rumah Sukan)
                    </span>
                  ) : scoringEvent.stage === 'Saringan' ? (
                    <span
                      style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        border: '1px solid #fde68a',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      ⏱️ Pusingan Saringan (6 Lorong Balapan)
                    </span>
                  ) : (
                    <span
                      style={{
                        background: '#ecfdf5',
                        color: '#047857',
                        border: '1px solid #a7f3d0',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      🏆 Peringkat Akhir (Top 3)
                    </span>
                  )}
                  {getEventYear(scoringEvent.category, scoringEvent.eventName) && (
                    <span
                      style={{
                        background: '#f3e8ff',
                        color: '#7e22ce',
                        border: '1px solid #e9d5ff',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      Tahun {getEventYear(scoringEvent.category, scoringEvent.eventName)}
                    </span>
                  )}
                </div>
                <div className="modal-category-sub">
                  {scoringEvent.category} • {scoringEvent.type === 'track' ? '🏃 Balapan (6 Lorong)' : '🎯 Padang'} • {scoringEvent.scheduledTime}
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setScoringEvent(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Saringan Specific Info & Action Banner */}
            {scoringEvent.stage === 'Saringan' && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fcd34d',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontSize: '12px', fontWeight: 700 }}>
                  <span style={{ fontSize: '18px' }}>⏱️</span>
                  <div>
                    <strong>Format Saringan 200m:</strong> Masukkan catatan masa bagi 6 pelari di Lorong 1 hingga 6. Klik butang <strong>'⚡ Susun Mengikut Masa Terpantas'</strong> untuk menyusun kedudukan mengikut catatan masa.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAutoSortSaringan}
                  style={{
                    background: '#d97706',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 2px 4px rgba(217, 119, 6, 0.2)',
                  }}
                >
                  <span>⚡ Susun Mengikut Masa Terpantas</span>
                </button>
              </div>
            )}

            {/* 200m Akhir: Saringan Finalists Integration Banner */}
            {scoringEvent.stage === 'Akhir' && scoringEvent.eventName.toLowerCase().includes('200') && (() => {
              const saringan = getRelatedSaringan(scoringEvent)
              const finalists = saringan ? getQualifiedFinalists(saringan) : []

              if (finalists.length > 0) {
                return (
                  <div
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      marginBottom: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065f46', fontSize: '13px', fontWeight: 800 }}>
                        <Sparkles size={16} />
                        <span>6 Finalis dari Saringan Hari 1 ({saringan?.code}) Berjaya Layak ke Akhir!</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px', fontWeight: 600 }}>
                        {finalists.map((f, idx) => `#${idx + 1} ${f.athleteName} (${f.recordValue || '-'})`).join(' • ')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLoadFinalistsIntoAkhir(finalists)}
                      style={{
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <span>✨ Muatkan 6 Finalis ke Borang</span>
                    </button>
                  </div>
                )
              }
              return null
            })()}

            {/* Group Event Information Banner vs Individual Year Matching Banner */}
            {isGroupEvent(scoringEvent.eventName) ? (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  fontSize: '12px',
                  color: '#166534',
                  fontWeight: 700,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🏆</span>
                  <span>
                    <strong>Pemenang Acara Kumpulan:</strong> Kedudukan dan pingat adalah milik <strong>Rumah Sukan</strong> secara keseluruhan (tiada pendaftaran nama peserta individu).
                  </span>
                </div>
                <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                  Mata: Emas (10), Perak (7), Gangsa (5)
                </span>
              </div>
            ) : (() => {
              const evYear = getEventYear(scoringEvent.category, scoringEvent.eventName)
              const isFemale = scoringEvent.category.toLowerCase().includes('perempuan')
              const isMale = scoringEvent.category.toLowerCase().includes('lelaki')
              const genderText = isFemale ? 'Perempuan' : isMale ? 'Lelaki' : 'Terbuka'
              return (
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '10px',
                    padding: '9px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    fontSize: '12px',
                    color: '#1e40af',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>🎯</span>
                    <span>
                      Pautan Pintar: <strong style={{ color: '#1d4ed8' }}>{evYear ? `Hanya Murid Tahun ${evYear}` : 'Semua Murid'} ({genderText})</strong> dipaparkan dalam pilihan dropdown.
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                    Tahun Lain Disaring
                  </span>
                </div>
              )
            })()}

            {/* Benchmark Record Banner */}
            <div
              style={{
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontSize: '13px', fontWeight: 800 }}>
                <Sparkles size={16} />
                <span>Rekod Kejohanan SK Beringis: {getBenchmarkRecord(scoringEvent.eventName)}</span>
              </div>
              <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 700 }}>
                {scoringEvent.stage === 'Saringan' ? 'Pusingan Saringan (6 Lorong Balapan)' : isGroupEvent(scoringEvent.eventName) ? 'Acara Kumpulan (Mata 10 / 7 / 5)' : 'Top 3 Podium (Mata 7 / 5 / 3)'}
              </span>
            </div>

            <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
              {/* Positions Loop */}
              {formResults.map((res, posIdx) => {
                const isSaringan = scoringEvent.stage === 'Saringan'
                const isGroup = isGroupEvent(scoringEvent.eventName)
                const medalEmoji = isSaringan ? '🏃' : (posIdx === 0 ? '🥇' : posIdx === 1 ? '🥈' : '🥉')
                const placeLabel = isSaringan
                  ? `Lorong ${posIdx + 1} (Kedudukan #${res.place || posIdx + 1})`
                  : (posIdx === 0
                      ? 'Tempat Pertama (Pingat Emas)'
                      : posIdx === 1
                        ? 'Tempat Ke-2 (Pingat Perak)'
                        : 'Tempat Ke-3 (Pingat Gangsa)')

                const isManual = manualInputFlags[posIdx] || false
                const candidates = getHouseCandidates(res.houseId)
                const unitPlaceholder = getEventUnitPlaceholder(scoringEvent.eventName)
                const targetYearLabel = candidates.targetYear ? `Tahun ${candidates.targetYear}` : 'Tahun Berkenaan'

                // For 200m Akhir, see if we can highlight qualified saringan runners
                const relatedSaringan = getRelatedSaringan(scoringEvent)
                const saringanFinalists = relatedSaringan ? getQualifiedFinalists(relatedSaringan) : []

                return (
                  <div
                    key={posIdx}
                    style={{
                      background: posIdx === 0 ? '#fffdfa' : '#ffffff',
                      border: `1px solid ${posIdx === 0 ? '#fde68a' : '#cbd5e1'}`,
                      borderRadius: '14px',
                      padding: '14px 16px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    }}
                  >
                    {/* Top Row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                        borderBottom: '1px solid #f1f5f9',
                        paddingBottom: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{medalEmoji}</span>
                        <span style={{ fontWeight: 900, fontSize: '13px', color: '#0f172a' }}>
                          {placeLabel}
                        </span>
                        {!isSaringan ? (
                          <span
                            style={{
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#047857',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 800,
                            }}
                          >
                            +{res.points} Mata
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: '#475569',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 800,
                            }}
                          >
                            Saringan (0 Mata)
                          </span>
                        )}
                      </div>

                      {!isGroup && (
                        <button
                          type="button"
                          onClick={() => toggleManualInput(posIdx)}
                          style={{
                            background: isManual ? '#eff6ff' : '#f8fafc',
                            border: `1px solid ${isManual ? '#93c5fd' : '#cbd5e1'}`,
                            color: isManual ? '#1d4ed8' : '#475569',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Edit3 size={11} />
                          <span>{isManual ? 'Guna Dropdown' : '✏️ Manual'}</span>
                        </button>
                      )}
                    </div>

                    {isGroup ? (
                      /* Group / Relay Event: Streamlined House-Only Interface */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '11px', marginBottom: '6px', display: 'block' }}>
                            Pilih Rumah Sukan Pemenang ({medalEmoji} {posIdx === 0 ? 'Emas' : posIdx === 1 ? 'Perak' : 'Gangsa'})
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                            {houses.map((h) => {
                              const isSelected = res.houseId === h.id
                              return (
                                <button
                                  key={h.id}
                                  type="button"
                                  onClick={() => {
                                    handleFieldChange(posIdx, 'houseId', h.id)
                                    handleFieldChange(posIdx, 'athleteName', `Rumah ${h.name}`)
                                    handleFieldChange(posIdx, 'bib', '')
                                  }}
                                  style={{
                                    background: isSelected ? `${h.color}15` : '#ffffff',
                                    border: isSelected ? `2px solid ${h.color}` : '1px solid #cbd5e1',
                                    color: isSelected ? h.color : '#334155',
                                    borderRadius: '10px',
                                    padding: '10px 12px',
                                    fontSize: '13px',
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.15s ease',
                                    boxShadow: isSelected ? `0 2px 8px ${h.color}25` : 'none',
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '12px',
                                      height: '12px',
                                      borderRadius: '50%',
                                      backgroundColor: h.color,
                                      display: 'inline-block',
                                    }}
                                  />
                                  <span>Rumah {h.name}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                            gap: '10px',
                            alignItems: 'center',
                          }}
                        >
                          {/* Lorong (1 - 6) */}
                          <div>
                            <label className="form-label" style={{ fontSize: '11px' }}>Lorong (1-6)</label>
                            <select
                              value={res.lane || posIdx + 1}
                              onChange={(e) => handleFieldChange(posIdx, 'lane', parseInt(e.target.value) || 1)}
                              className="entry-select"
                              style={{ width: '100%' }}
                            >
                              {[1, 2, 3, 4, 5, 6].map((laneNum) => (
                                <option key={laneNum} value={laneNum}>
                                  Lorong {laneNum}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Catatan Masa */}
                          <div>
                            <label className="form-label" style={{ fontSize: '11px' }}>Catatan Masa</label>
                            <input
                              type="text"
                              value={res.recordValue || ''}
                              onChange={(e) => handleFieldChange(posIdx, 'recordValue', e.target.value)}
                              placeholder={unitPlaceholder}
                              className="entry-input"
                              style={{ width: '100%' }}
                            />
                          </div>

                          {/* Points */}
                          <div>
                            <label className="form-label" style={{ fontSize: '11px' }}>Mata</label>
                            <input
                              type="number"
                              value={res.points}
                              onChange={(e) => handleFieldChange(posIdx, 'points', Number(e.target.value))}
                              className="entry-input"
                              style={{ width: '100%' }}
                              min={0}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Individual Event Form */
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                          gap: '10px',
                          alignItems: 'center',
                        }}
                      >
                        {/* House select */}
                        <div>
                          <label className="form-label" style={{ fontSize: '11px' }}>Rumah Sukan</label>
                          <select
                            value={res.houseId}
                            onChange={(e) => {
                              handleFieldChange(posIdx, 'houseId', e.target.value)
                              handleFieldChange(posIdx, 'athleteName', '')
                              handleFieldChange(posIdx, 'bib', '')
                            }}
                            className="entry-select"
                            style={{ width: '100%' }}
                          >
                            {houses.map((h) => (
                              <option key={h.id} value={h.id}>
                                Rumah {h.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Athlete selection */}
                        <div style={{ gridColumn: 'span 2' }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>
                            Nama Atlet ({targetYearLabel})
                          </label>

                          {isManual ? (
                            <input
                              type="text"
                              placeholder="Taip nama atlet..."
                              value={res.athleteName}
                              onChange={(e) => handleFieldChange(posIdx, 'athleteName', e.target.value)}
                              className="entry-input"
                              style={{ width: '100%' }}
                            />
                          ) : (
                            <select
                              value={
                                athletes.find((a) => a.name === res.athleteName && a.houseId === res.houseId)?.id ||
                                ''
                              }
                              onChange={(e) => handleAthleteDropdownSelect(posIdx, e.target.value)}
                              className="entry-select"
                              style={{ width: '100%', fontWeight: res.athleteName ? 700 : 400 }}
                            >
                              <option value="">
                                -- Pilih Atlet {getHouseName(res.houseId)} ({targetYearLabel}) --
                              </option>

                              {/* Show Qualified Finalists first for 200m Akhir */}
                              {saringanFinalists.length > 0 && (
                                <optgroup label="🌟 6 Finalis Layak dari Saringan Hari 1">
                                  {saringanFinalists
                                    .filter((f) => f.houseId === res.houseId)
                                    .map((f, i) => (
                                      <option key={`fin-${i}`} value={athletes.find((a) => a.name === f.athleteName)?.id || f.athleteName}>
                                        ⭐ {f.athleteName} (Masa Saringan: {f.recordValue || '-'})
                                      </option>
                                    ))}
                                </optgroup>
                              )}

                              {candidates.main.length > 0 && (
                                <optgroup label={`🌟 Peserta Berdaftar (${targetYearLabel})`}>
                                  {candidates.main.map((ath) => (
                                    <option key={ath.id} value={ath.id}>
                                      {ath.name} ({ath.class} • {ath.bib})
                                    </option>
                                  ))}
                                </optgroup>
                              )}

                              {candidates.reserve.length > 0 && (
                                <optgroup label={`🔄 Peserta Simpanan (${targetYearLabel})`}>
                                  {candidates.reserve.map((ath) => (
                                    <option key={ath.id} value={ath.id}>
                                      {ath.name} ({ath.class} • {ath.bib})
                                    </option>
                                  ))}
                                </optgroup>
                              )}

                              {candidates.allHouse.length > 0 && (
                                <optgroup label={`👥 Atlet Lain ${targetYearLabel} (Rumah ${getHouseName(res.houseId)})`}>
                                  {candidates.allHouse.map((ath) => (
                                    <option key={ath.id} value={ath.id}>
                                      {ath.name} ({ath.class} • {ath.bib})
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                            </select>
                          )}
                        </div>

                        {/* BIB */}
                        <div>
                          <label className="form-label" style={{ fontSize: '11px' }}>No. BIB</label>
                          <input
                            type="text"
                            value={res.bib || ''}
                            onChange={(e) => handleFieldChange(posIdx, 'bib', e.target.value)}
                            placeholder="M-01"
                            className="entry-input"
                            style={{ width: '100%' }}
                          />
                        </div>

                        {/* Lorong (1 - 6) */}
                        {!isFieldEvent(scoringEvent.eventName) && (
                          <div>
                            <label className="form-label" style={{ fontSize: '11px' }}>Lorong (1-6)</label>
                            <select
                              value={res.lane || posIdx + 1}
                              onChange={(e) => handleFieldChange(posIdx, 'lane', parseInt(e.target.value) || 1)}
                              className="entry-select"
                              style={{ width: '100%' }}
                            >
                              {[1, 2, 3, 4, 5, 6].map((laneNum) => (
                                <option key={laneNum} value={laneNum}>
                                  Lorong {laneNum}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Time / Distance */}
                        <div>
                          <label className="form-label" style={{ fontSize: '11px' }}>
                            {isFieldEvent(scoringEvent.eventName) ? 'Jarak / Ketinggian' : 'Catatan Masa (cth: 28.45s)'}
                          </label>
                          <input
                            type="text"
                            value={res.recordValue || ''}
                            onChange={(e) => handleFieldChange(posIdx, 'recordValue', e.target.value)}
                            placeholder={unitPlaceholder}
                            className="entry-input"
                            style={{ width: '100%' }}
                          />
                        </div>

                        {/* Points */}
                        {!isSaringan && (
                          <div>
                            <label className="form-label" style={{ fontSize: '11px' }}>Mata</label>
                            <input
                              type="number"
                              value={res.points}
                              onChange={(e) => handleFieldChange(posIdx, 'points', Number(e.target.value))}
                              className="entry-input"
                              style={{ width: '100%' }}
                              min={0}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Record broken indicator checkbox */}
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: res.isRecordBroken ? '#b91c1c' : '#64748b', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(res.isRecordBroken)}
                          onChange={(e) => handleFieldChange(posIdx, 'isRecordBroken', e.target.checked)}
                          style={{ accentColor: '#dc2626' }}
                        />
                        <span>🔥 Catatan Memecah Rekod Kejohanan!</span>
                      </label>
                    </div>
                  </div>
                )
              })}

              <div className="modal-actions-row" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', position: 'sticky', bottom: 0, background: '#ffffff', paddingTop: '10px' }}>
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={() => setScoringEvent(null)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-submit-modal" style={{ background: 'var(--forest-green)', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: 800, cursor: 'pointer' }}>
                  <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  {scoringEvent.stage === 'Saringan' ? 'Simpan Keputusan Saringan (6 Pelari)' : isGroupEvent(scoringEvent.eventName) ? 'Simpan Keputusan Acara Kumpulan (Mata Rumah)' : 'Simpan Keputusan Top 3 & Kira Mata'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Scorecard Modal */}
      {printEvent && (
        <div className="modal-backdrop-custom" onClick={() => setPrintEvent(null)}>
          <div
            className="modal-content-card printable-card"
            style={{ maxWidth: '680px', background: '#ffffff', padding: '32px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* School Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                SEKOLAH KEBANGSAAN BERINGIS, PAPAR
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                {printEvent.stage === 'Saringan'
                  ? 'BORANG KEPUTUSAN RASMI SARINGAN 200 METER'
                  : isGroupEvent(printEvent.eventName)
                    ? 'BORANG KEPUTUSAN RASMI ACARA BERGANTI-GANTI / KUMPULAN'
                    : 'BORANG KEPUTUSAN RASMI HAKIM PENAMAT'}
              </h2>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Kejohanan Olahraga & Sukaneka Tahunan Kali Ke-27 (2026) • {printEvent.stage === 'Saringan' ? 'Keputusan Saringan (6 Finalis Layak ke 6 Lorong Balapan)' : isGroupEvent(printEvent.eventName) ? 'Kedudukan Rumah Sukan (Emas, Perak, Gangsa)' : 'Podium Pemenang'}
              </div>
            </div>

            {/* Event Meta Table */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
              <div><strong>Kod Acara:</strong> {printEvent.code} ({printEvent.stage})</div>
              <div><strong>Masa:</strong> {printEvent.scheduledTime}</div>
              <div><strong>Acara:</strong> {printEvent.eventName}</div>
              <div><strong>Kategori:</strong> {printEvent.category}</div>
            </div>

            {/* Results Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', marginBottom: '30px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '10px', fontSize: '12px', fontWeight: 800 }}>KED.</th>
                  <th style={{ padding: '10px', fontSize: '12px', fontWeight: 800 }}>{printEvent.stage === 'Saringan' ? 'STATUS KELAYAKAN' : 'PINGAT'}</th>
                  <th style={{ padding: '10px', fontSize: '12px', fontWeight: 800, textAlign: 'left' }}>
                    {isGroupEvent(printEvent.eventName) ? 'RUMAH SUKAN / PASUKAN' : 'NAMA ATLET / PASUKAN'}
                  </th>
                  <th style={{ padding: '10px', fontSize: '12px', fontWeight: 800 }}>RUMAH</th>
                  <th style={{ padding: '10px', fontSize: '12px', fontWeight: 800 }}>LORONG</th>
                  <th style={{ padding: '10px', fontSize: '12px', fontWeight: 800 }}>CATATAN MASA</th>
                  {printEvent.stage !== 'Saringan' && <th style={{ padding: '10px', fontSize: '12px', fontWeight: 800 }}>MATA</th>}
                </tr>
              </thead>
              <tbody>
                {printEvent.results
                  ?.slice(0, printEvent.stage === 'Saringan' ? 6 : 3)
                  .map((res, i) => {
                    const isGroup = isGroupEvent(printEvent.eventName)
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: printEvent.stage === 'Saringan' ? '#f0fdf4' : 'transparent' }}>
                        <td style={{ padding: '10px', fontWeight: 900 }}>#{res.place || i + 1}</td>
                        <td style={{ padding: '10px', fontSize: '12px', fontWeight: 800 }}>
                          {printEvent.stage === 'Saringan' ? (
                            <span style={{ color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>🟢 LAYAK (Q)</span>
                          ) : (
                            i === 0 ? '🥇 Emas' : i === 1 ? '🥈 Perak' : '🥉 Gangsa'
                          )}
                        </td>
                        <td style={{ padding: '10px', fontWeight: 800, textAlign: 'left', color: isGroup ? getHouseColor(res.houseId) : '#0f172a' }}>
                          {isGroup ? `Rumah ${getHouseName(res.houseId)}` : res.athleteName}
                        </td>
                        <td style={{ padding: '10px', fontWeight: 700, color: getHouseColor(res.houseId) }}>
                          {getHouseName(res.houseId)}
                        </td>
                        <td style={{ padding: '10px', fontWeight: 700 }}>{res.lane ? `L${res.lane}` : '-'}</td>
                        <td style={{ padding: '10px', fontWeight: 600 }}>{res.recordValue || '-'}</td>
                        {printEvent.stage !== 'Saringan' && (
                          <td style={{ padding: '10px', fontWeight: 900, color: 'var(--forest-green)' }}>+{res.points}</td>
                        )}
                      </tr>
                    )
                  })}
              </tbody>
            </table>

            {/* Signature Block */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px' }}>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ borderBottom: '1px solid #0f172a', height: '40px' }} />
                <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '6px' }}>Hakim Pelepas / Penjaga Masa</div>
              </div>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ borderBottom: '1px solid #0f172a', height: '40px' }} />
                <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '6px' }}>Ketua Hakim Penamat</div>
              </div>
            </div>

            {/* Print and Close Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' }} className="no-print">
              <button
                type="button"
                onClick={() => setPrintEvent(null)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 16px', fontWeight: 700, cursor: 'pointer' }}
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ background: 'var(--forest-green)', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={16} />
                <span>Cetak / Cetakan PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
