import { useState } from 'react'
import {
  Crown,
  Search,
  Star,
  Flame,
  Sparkles,
} from 'lucide-react'
import { EventRecord, HouseItem, isGroupEvent } from './EventResultsTab'

interface SpecialAwardsTabProps {
  events: EventRecord[]
  houses: HouseItem[]
}

export type CohortYear = '6' | '5' | '4' | '3' | '2' | '1' | 'pra' | 'other'

interface AthleteStanding {
  name: string
  gender: 'Lelaki' | 'Perempuan'
  year: CohortYear
  houseId: string
  houseName: string
  houseColor: string
  gold: number
  silver: number
  bronze: number
  totalPoints: number
  brokenRecordsCount: number
  eventsJoined: Array<{
    place: number
    text: string
  }>
}

const RibbonMedalIcon = ({ place }: { place: number }) => {
  const discFill = place === 1 ? '#eab308' : place === 2 ? '#cbd5e1' : place === 3 ? '#d97706' : '#e2e8f0'
  const discBorder = place === 1 ? '#ca8a04' : place === 2 ? '#94a3b8' : place === 3 ? '#b45309' : '#cbd5e1'
  const innerRing = place === 1 ? '#fef08a' : place === 2 ? '#f8fafc' : place === 3 ? '#fde68a' : '#ffffff'

  return (
    <svg width="22" height="24" viewBox="0 0 22 24" fill="none" style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}>
      {/* Red Left Ribbon */}
      <path d="M7 2 L3.5 11 L8.5 9.5 L11 4 Z" fill="#dc2626" />
      {/* Blue Right Ribbon */}
      <path d="M15 2 L18.5 11 L13.5 9.5 L11 4 Z" fill="#2563eb" />
      {/* Medal Disc */}
      <circle cx="11" cy="15" r="7" fill={discFill} stroke={discBorder} strokeWidth="1.2" />
      <circle cx="11" cy="15" r="5.2" fill="none" stroke={innerRing} strokeWidth="0.8" opacity="0.8" />
    </svg>
  )
}

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

export default function SpecialAwardsTab({ events, houses }: SpecialAwardsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'khas' | 'harapan' | 'Lelaki' | 'Perempuan'>('all')

  // Calculate individual athlete scores dynamically from all completed events (excluding relay/sukaneka)
  const athleteMap = new Map<string, AthleteStanding>()

  events.forEach((ev) => {
    // Only count individual events for Olahragawan / Olahragawati / Harapan
    const isGroup = isGroupEvent(ev.eventName)
    if (isGroup || ev.status !== 'completed' || ev.stage === 'Saringan' || !ev.results) return

    const isLelaki = ev.category.toLowerCase().includes('lelaki')
    const isPerempuan = ev.category.toLowerCase().includes('perempuan')
    const detectedYear = extractCohortYear(ev.category, ev.eventName)

    ev.results.forEach((res) => {
      if (!res.athleteName || res.athleteName.trim() === '') return
      const name = res.athleteName.trim()
      if (name.toLowerCase().startsWith('rumah ') || name.toLowerCase().startsWith('kuadren ')) return

      const house = houses.find((h) => h.id === res.houseId)
      const houseName = house ? house.name : res.houseId
      const houseColor = house ? house.color : '#2563eb'

      let gender: 'Lelaki' | 'Perempuan' = isLelaki ? 'Lelaki' : 'Perempuan'
      if (!isLelaki && !isPerempuan) {
        gender = 'Lelaki' // fallback for mixed
      }

      if (!athleteMap.has(name)) {
        athleteMap.set(name, {
          name,
          gender,
          year: detectedYear,
          houseId: res.houseId,
          houseName,
          houseColor,
          gold: 0,
          silver: 0,
          bronze: 0,
          totalPoints: 0,
          brokenRecordsCount: 0,
          eventsJoined: [],
        })
      }

      const ath = athleteMap.get(name)!
      if (ath.year === 'other' && detectedYear !== 'other') {
        ath.year = detectedYear
      }

      if (res.place === 1) ath.gold += 1
      else if (res.place === 2) ath.silver += 1
      else if (res.place === 3) ath.bronze += 1

      ath.totalPoints += res.points || 0
      if (res.isRecordBroken) ath.brokenRecordsCount += 1

      ath.eventsJoined.push({
        place: res.place,
        text: `${ev.eventName} (${ev.category})`,
      })
    })
  })

  // Sort helper: Gold medals first, then Silver, then Bronze, then broken records, then points
  const sortAthletes = (a: AthleteStanding, b: AthleteStanding) => {
    if (b.gold !== a.gold) return b.gold - a.gold
    if (b.silver !== a.silver) return b.silver - a.silver
    if (b.bronze !== a.bronze) return b.bronze - a.bronze
    if (b.brokenRecordsCount !== a.brokenRecordsCount) return b.brokenRecordsCount - a.brokenRecordsCount
    return b.totalPoints - a.totalPoints
  }

  const allAthletes = Array.from(athleteMap.values())

  // 1. Anugerah Khas (Tahun 6 Sahaja)
  const topOlahragawanT6 = allAthletes.filter((a) => a.gender === 'Lelaki' && a.year === '6').sort(sortAthletes)[0] || null
  const topOlahragawatiT6 = allAthletes.filter((a) => a.gender === 'Perempuan' && a.year === '6').sort(sortAthletes)[0] || null

  // 2. Anugerah Harapan (Tahun 5 Sahaja)
  const topHarapanBoyT5 = allAthletes.filter((a) => a.gender === 'Lelaki' && a.year === '5').sort(sortAthletes)[0] || null
  const topHarapanGirlT5 = allAthletes.filter((a) => a.gender === 'Perempuan' && a.year === '5').sort(sortAthletes)[0] || null

  const filteredList = allAthletes
    .filter((a) => {
      if (activeFilterTab === 'khas') return a.year === '6'
      if (activeFilterTab === 'harapan') return a.year === '5'
      if (activeFilterTab === 'Lelaki') return a.gender === 'Lelaki'
      if (activeFilterTab === 'Perempuan') return a.gender === 'Perempuan'
      return true
    })
    .sort(sortAthletes)
    .filter(
      (a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.houseName.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const getHouseTextColor = (houseName: string) => {
    const lower = houseName.toLowerCase()
    if (lower.includes('merah')) return '#dc2626'
    if (lower.includes('kuning')) return '#ca8a04'
    if (lower.includes('hijau')) return '#16a34a'
    if (lower.includes('biru')) return '#2563eb'
    return '#475569'
  }

  const getHouseBadgeStyle = (houseName: string, houseColor: string) => {
    const lower = houseName.toLowerCase()
    if (lower.includes('merah')) return { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' }
    if (lower.includes('kuning')) return { bg: '#fef3c7', text: '#d97706', border: '#fde68a' }
    if (lower.includes('hijau')) return { bg: '#dcfce7', text: '#16a34a', border: '#86efac' }
    if (lower.includes('biru')) return { bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' }
    return { bg: `${houseColor}15`, text: houseColor, border: `${houseColor}30` }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0 40px' }}>
      {/* Header Title Section */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 900,
            color: '#111827',
            lineHeight: 1.2,
            marginBottom: '8px',
            letterSpacing: '-0.5px',
          }}
        >
          Athlete Special Awards Dashboard
        </h1>
        <p style={{ fontSize: '15px', color: '#4b5563', margin: 0, fontWeight: 500 }}>
          Anugerah Khas Kejohanan (Tahun 6) & Anugerah Harapan (Tahun 5)
        </p>
      </div>

      {/* ========================================================
          1. ANUGERAH KHAS (TAHUN 6 SAHAJA)
      ======================================================== */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div
            style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: '4px 12px',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid #fde68a',
            }}
          >
            <Crown size={16} />
            <span>ANUGERAH KHAS KEJOHANAN (TAHUN 6 SAHAJA)</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            Calon Olahragawan & Olahragawati Kejohanan
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Card 1: SPORTSMAN (TAHUN 6 LELAKI) */}
          <div
            style={{
              background: '#dcebff',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid #bfdbfe',
              boxShadow: '0 4px 20px rgba(37, 99, 235, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '260px',
            }}
          >
            <div>
              {/* Top Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: '#93c5fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1e3a8a',
                    }}
                  >
                    <Crown size={18} fill="#1e3a8a" />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#1e293b', letterSpacing: '0.5px' }}>
                    OLAHRAGAWAN (TAHUN 6)
                  </span>
                </div>
                <span
                  style={{
                    background: '#bfdbfe',
                    color: '#1e40af',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '4px 14px',
                    borderRadius: '9999px',
                  }}
                >
                  #1 Lelaki T6
                </span>
              </div>

              {/* Athlete Content */}
              {topOlahragawanT6 ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <h2
                      style={{
                        fontSize: '22px',
                        fontWeight: 900,
                        color: '#2563eb',
                        margin: '0 0 8px 0',
                        letterSpacing: '-0.3px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {topOlahragawanT6.name}
                    </h2>
                    <div>
                      {(() => {
                        const style = getHouseBadgeStyle(topOlahragawanT6.houseName, topOlahragawanT6.houseColor)
                        return (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: style.bg,
                              color: style.text,
                              border: `1px solid ${style.border}`,
                              padding: '3px 14px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              fontWeight: 800,
                            }}
                          >
                            <span>🏠</span>
                            <span>Rumah {topOlahragawanT6.houseName}</span>
                          </span>
                        )
                      })()}
                    </div>
                  </div>

                  {/* 4-Stat Box */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      padding: '12px 8px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      textAlign: 'center',
                      border: '1px solid #dbeafe',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥇</span> {topOlahragawanT6.gold}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Emas</div>
                    </div>
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥈</span> {topOlahragawanT6.silver}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Perak</div>
                    </div>
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥉</span> {topOlahragawanT6.bronze}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Gangsa</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                        <Star size={15} className="text-amber-500 fill-amber-500" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                        <span>{topOlahragawanT6.totalPoints}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Mata</div>
                    </div>
                  </div>

                  {/* Pencapaian Acara */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>Pencapaian Acara:</span>
                    {topOlahragawanT6.eventsJoined.map((ev, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '9999px',
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#1e293b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                        }}
                      >
                        <RibbonMedalIcon place={ev.place} />
                        <span>{ev.text}</span>
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '140px',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  Belum ada keputusan acara individu Tahun 6 Lelaki direkodkan.
                </div>
              )}
            </div>
          </div>

          {/* Card 2: SPORTSWOMAN (TAHUN 6 PEREMPUAN) */}
          <div
            style={{
              background: '#fde5e8',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid #fecdd3',
              boxShadow: '0 4px 20px rgba(225, 29, 72, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '260px',
            }}
          >
            <div>
              {/* Top Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: '#fbcfe8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9d174d',
                    }}
                  >
                    <Crown size={18} fill="#9d174d" />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#1e293b', letterSpacing: '0.5px' }}>
                    OLAHRAGAWATI (TAHUN 6)
                  </span>
                </div>
                <span
                  style={{
                    background: '#fbcfe8',
                    color: '#9d174d',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '4px 14px',
                    borderRadius: '9999px',
                  }}
                >
                  #1 Perempuan T6
                </span>
              </div>

              {/* Athlete Content */}
              {topOlahragawatiT6 ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <h2
                      style={{
                        fontSize: '22px',
                        fontWeight: 900,
                        color: '#e11d48',
                        margin: '0 0 8px 0',
                        letterSpacing: '-0.3px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {topOlahragawatiT6.name}
                    </h2>
                    <div>
                      {(() => {
                        const style = getHouseBadgeStyle(topOlahragawatiT6.houseName, topOlahragawatiT6.houseColor)
                        return (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: style.bg,
                              color: style.text,
                              border: `1px solid ${style.border}`,
                              padding: '3px 14px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              fontWeight: 800,
                            }}
                          >
                            <span>🏠</span>
                            <span>Rumah {topOlahragawatiT6.houseName}</span>
                          </span>
                        )
                      })()}
                    </div>
                  </div>

                  {/* 4-Stat Box */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      padding: '12px 8px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      textAlign: 'center',
                      border: '1px solid #fce7f3',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥇</span> {topOlahragawatiT6.gold}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Emas</div>
                    </div>
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥈</span> {topOlahragawatiT6.silver}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Perak</div>
                    </div>
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥉</span> {topOlahragawatiT6.bronze}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Gangsa</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                        <Star size={15} className="text-amber-500 fill-amber-500" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                        <span>{topOlahragawatiT6.totalPoints}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Mata</div>
                    </div>
                  </div>

                  {/* Pencapaian Acara */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>Pencapaian Acara:</span>
                    {topOlahragawatiT6.eventsJoined.map((ev, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #fbcfe8',
                          borderRadius: '9999px',
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#1e293b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                        }}
                      >
                        <RibbonMedalIcon place={ev.place} />
                        <span>{ev.text}</span>
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '140px',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 600,
                    textAlign: 'center',
                    padding: '20px',
                  }}
                >
                  Belum ada keputusan acara individu Tahun 6 Perempuan direkodkan.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. ANUGERAH HARAPAN (TAHUN 5 SAHAJA)
      ======================================================== */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div
            style={{
              background: '#ecfdf5',
              color: '#065f46',
              padding: '4px 12px',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid #a7f3d0',
            }}
          >
            <Sparkles size={16} />
            <span>ANUGERAH HARAPAN (TAHUN 5 SAHAJA)</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            Calon Olahragawan & Olahragawati Harapan
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Card 3: HARAPAN LELAKI (TAHUN 5) */}
          <div
            style={{
              background: '#d1fae5',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid #a7f3d0',
              boxShadow: '0 4px 20px rgba(5, 150, 105, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '260px',
            }}
          >
            <div>
              {/* Top Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: '#6ee7b7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#065f46',
                    }}
                  >
                    <Star size={18} fill="#065f46" />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#064e3b', letterSpacing: '0.5px' }}>
                    OLAHRAGAWAN HARAPAN (TAHUN 5)
                  </span>
                </div>
                <span
                  style={{
                    background: '#a7f3d0',
                    color: '#065f46',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '4px 14px',
                    borderRadius: '9999px',
                  }}
                >
                  #1 Lelaki T5
                </span>
              </div>

              {/* Athlete Content */}
              {topHarapanBoyT5 ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <h2
                      style={{
                        fontSize: '22px',
                        fontWeight: 900,
                        color: '#059669',
                        margin: '0 0 8px 0',
                        letterSpacing: '-0.3px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {topHarapanBoyT5.name}
                    </h2>
                    <div>
                      {(() => {
                        const style = getHouseBadgeStyle(topHarapanBoyT5.houseName, topHarapanBoyT5.houseColor)
                        return (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: style.bg,
                              color: style.text,
                              border: `1px solid ${style.border}`,
                              padding: '3px 14px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              fontWeight: 800,
                            }}
                          >
                            <span>🏠</span>
                            <span>Rumah {topHarapanBoyT5.houseName}</span>
                          </span>
                        )
                      })()}
                    </div>
                  </div>

                  {/* 4-Stat Box */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      padding: '12px 8px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      textAlign: 'center',
                      border: '1px solid #a7f3d0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥇</span> {topHarapanBoyT5.gold}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Emas</div>
                    </div>
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥈</span> {topHarapanBoyT5.silver}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Perak</div>
                    </div>
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥉</span> {topHarapanBoyT5.bronze}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Gangsa</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                        <Star size={15} className="text-amber-500 fill-amber-500" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                        <span>{topHarapanBoyT5.totalPoints}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Mata</div>
                    </div>
                  </div>

                  {/* Pencapaian Acara */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>Pencapaian Acara:</span>
                    {topHarapanBoyT5.eventsJoined.map((ev, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #a7f3d0',
                          borderRadius: '9999px',
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#064e3b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                        }}
                      >
                        <RibbonMedalIcon place={ev.place} />
                        <span>{ev.text}</span>
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '140px',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  Belum ada keputusan acara individu Tahun 5 Lelaki direkodkan.
                </div>
              )}
            </div>
          </div>

          {/* Card 4: HARAPAN PEREMPUAN (TAHUN 5) */}
          <div
            style={{
              background: '#ffedd5',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid #fed7aa',
              boxShadow: '0 4px 20px rgba(234, 88, 12, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '260px',
            }}
          >
            <div>
              {/* Top Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: '#fdba74',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9a3412',
                    }}
                  >
                    <Star size={18} fill="#9a3412" />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#7c2d12', letterSpacing: '0.5px' }}>
                    OLAHRAGAWATI HARAPAN (TAHUN 5)
                  </span>
                </div>
                <span
                  style={{
                    background: '#fed7aa',
                    color: '#9a3412',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '4px 14px',
                    borderRadius: '9999px',
                  }}
                >
                  #1 Perempuan T5
                </span>
              </div>

              {/* Athlete Content */}
              {topHarapanGirlT5 ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <h2
                      style={{
                        fontSize: '22px',
                        fontWeight: 900,
                        color: '#c2410c',
                        margin: '0 0 8px 0',
                        letterSpacing: '-0.3px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {topHarapanGirlT5.name}
                    </h2>
                    <div>
                      {(() => {
                        const style = getHouseBadgeStyle(topHarapanGirlT5.houseName, topHarapanGirlT5.houseColor)
                        return (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: style.bg,
                              color: style.text,
                              border: `1px solid ${style.border}`,
                              padding: '3px 14px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              fontWeight: 800,
                            }}
                          >
                            <span>🏠</span>
                            <span>Rumah {topHarapanGirlT5.houseName}</span>
                          </span>
                        )
                      })()}
                    </div>
                  </div>

                  {/* 4-Stat Box */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      padding: '12px 8px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      textAlign: 'center',
                      border: '1px solid #fed7aa',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥇</span> {topHarapanGirlT5.gold}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Emas</div>
                    </div>
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥈</span> {topHarapanGirlT5.silver}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Perak</div>
                    </div>
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥉</span> {topHarapanGirlT5.bronze}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Gangsa</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                        <Star size={15} className="text-amber-500 fill-amber-500" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                        <span>{topHarapanGirlT5.totalPoints}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Mata</div>
                    </div>
                  </div>

                  {/* Pencapaian Acara */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>Pencapaian Acara:</span>
                    {topHarapanGirlT5.eventsJoined.map((ev, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #fed7aa',
                          borderRadius: '9999px',
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#7c2d12',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                        }}
                      >
                        <RibbonMedalIcon place={ev.place} />
                        <span>{ev.text}</span>
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '140px',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 600,
                    textAlign: 'center',
                    padding: '20px',
                  }}
                >
                  Belum ada keputusan acara individu Tahun 5 Perempuan direkodkan.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overall Standings Section */}
      <div>
        {/* Section Header with Title & Search */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '0 0 2px 0' }}>
              Overall Standings
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: 500 }}>
              Senarai Pungutan Pingat Atlet Individu
            </p>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="Cari atlet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 38px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                fontSize: '13px',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Unified Forest Green Filter & Table Container */}
        <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid #cbd5e1', background: '#f1f5f3' }}>
          {/* 1. Forest Green Filter Bar */}
          <div
            style={{
              background: '#235937',
              borderRadius: '15px 15px 0 0',
              padding: '10px 14px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              minWidth: '920px',
              flexWrap: 'wrap',
            }}
          >
            {[
              { key: 'all', label: `Semua Atlet (${allAthletes.length})` },
              { key: 'khas', label: '👑 Anugerah Khas (Tahun 6)' },
              { key: 'harapan', label: '⭐ Anugerah Harapan (Tahun 5)' },
              { key: 'Lelaki', label: 'Lelaki' },
              { key: 'Perempuan', label: 'Perempuan' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilterTab(tab.key as any)}
                style={{
                  background: activeFilterTab === tab.key ? '#ffffff' : 'transparent',
                  color: activeFilterTab === tab.key ? '#1e293b' : '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: activeFilterTab === tab.key ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 2. Table Area */}
          <div style={{ padding: '14px 16px 16px 16px', minWidth: '920px' }}>
            {/* Table Header Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '45px 2.2fr 95px 60px 60px 60px 70px 100px 2fr',
                padding: '0 16px 12px 16px',
                fontSize: '13px',
                fontWeight: 800,
                color: '#0f172a',
                alignItems: 'center',
              }}
            >
              <div>Ked.</div>
              <div>Nama Atlet & Rumah</div>
              <div>Kelayakan</div>
              <div style={{ textAlign: 'center' }}>Emas</div>
              <div style={{ textAlign: 'center' }}>Perak</div>
              <div style={{ textAlign: 'center' }}>Gangsa</div>
              <div style={{ textAlign: 'center' }}>Rekod</div>
              <div style={{ textAlign: 'center' }}>Jumlah Mata</div>
              <div>Acara Ditandingi</div>
            </div>

            {/* Table Rows */}
            {filteredList.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '36px',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: '1px solid #e2e8f0',
                }}
              >
                Tiada maklumat atlet ditemui untuk tapisan ini.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredList.map((ath, idx) => {
                  const houseColor = getHouseTextColor(ath.houseName)
                  const isT6 = ath.year === '6'
                  const isT5 = ath.year === '5'

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '45px 2.2fr 95px 60px 60px 60px 70px 100px 2fr',
                        padding: '12px 16px',
                        background: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        alignItems: 'center',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                        fontSize: '13px',
                      }}
                    >
                      {/* Rank */}
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                        #{idx + 1}
                      </div>

                      {/* Athlete Name & House */}
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px', textTransform: 'uppercase' }}>
                          {ath.name}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: houseColor, marginTop: '2px' }}>
                          Rumah {ath.houseName} • {ath.gender}
                        </div>
                      </div>

                      {/* Kelayakan Badge */}
                      <div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: isT6 ? '#fef3c7' : isT5 ? '#ecfdf5' : '#f1f5f9',
                            color: isT6 ? '#92400e' : isT5 ? '#065f46' : '#475569',
                            border: isT6 ? '1px solid #fde68a' : isT5 ? '1px solid #a7f3d0' : 'none',
                            display: 'inline-block',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isT6 ? '👑 Tahun 6' : isT5 ? '⭐ Tahun 5' : ath.year !== 'other' && ath.year !== 'pra' ? `Tahun ${ath.year}` : '-'}
                        </span>
                      </div>

                      {/* Emas */}
                      <div style={{ textAlign: 'center', fontWeight: 500, color: '#0f172a', fontSize: '13px' }}>
                        {ath.gold}
                      </div>

                      {/* Perak */}
                      <div style={{ textAlign: 'center', fontWeight: 500, color: '#0f172a', fontSize: '13px' }}>
                        {ath.silver}
                      </div>

                      {/* Gangsa */}
                      <div style={{ textAlign: 'center', fontWeight: 500, color: '#0f172a', fontSize: '13px' }}>
                        {ath.bronze}
                      </div>

                      {/* Rekod */}
                      <div style={{ textAlign: 'center', fontWeight: 500, color: ath.brokenRecordsCount > 0 ? '#dc2626' : '#0f172a' }}>
                        {ath.brokenRecordsCount > 0 ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}>
                            <Flame size={14} /> {ath.brokenRecordsCount}
                          </span>
                        ) : (
                          '-'
                        )}
                      </div>

                      {/* Jumlah Mata */}
                      <div style={{ textAlign: 'center', fontWeight: 500, color: '#0f172a', fontSize: '13px' }}>
                        {ath.totalPoints} pts
                      </div>

                      {/* Acara Ditandingi */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {ath.eventsJoined.map((ev, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#0f172a',
                            }}
                          >
                            <RibbonMedalIcon place={ev.place} />
                            <span>{ev.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
