import { useState, useMemo } from 'react'
import {
  Crown,
  Search,
  Star,
  Flame,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react'
import { EventRecord, HouseItem } from './EventResultsTab'
import {
  computeAthleteStandings,
  getTopAwardContenders,
  AthleteRegistrationItem,
  AthleteStanding,
} from '../../utils/athlete_standings'

interface SpecialAwardsTabProps {
  events: EventRecord[]
  houses: HouseItem[]
  registeredAthletes?: AthleteRegistrationItem[]
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

export default function SpecialAwardsTab({
  events,
  houses,
  registeredAthletes = [],
}: SpecialAwardsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'khas' | 'harapan' | 'Lelaki' | 'Perempuan'>('all')
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteStanding | null>(null)

  // Dynamic athlete calculations including 4x50, 4x100, 4x200 relay events
  const allAthletes = useMemo(() => {
    return computeAthleteStandings(events as any, houses, registeredAthletes)
  }, [events, houses, registeredAthletes])

  // Extract Top 4 Contenders
  const { topOlahragawanT6, topOlahragawatiT6, topHarapanBoyT5, topHarapanGirlT5 } = useMemo(() => {
    return getTopAwardContenders(allAthletes)
  }, [allAthletes])

  const filteredList = useMemo(() => {
    return allAthletes
      .filter((a) => {
        if (activeFilterTab === 'khas') return a.year === '6'
        if (activeFilterTab === 'harapan') return a.year === '5'
        if (activeFilterTab === 'Lelaki') return a.gender === 'Lelaki'
        if (activeFilterTab === 'Perempuan') return a.gender === 'Perempuan'
        return true
      })
      .filter(
        (a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.houseName.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [allAthletes, activeFilterTab, searchQuery])

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
          Anugerah Khas Kejohanan (Tahun 6) & Anugerah Harapan (Tahun 5) • Termasuk Acara Berganti-ganti (4x50, 4x100, 4x200)
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
                            {topOlahragawanT6.className && <span>• {topOlahragawanT6.className}</span>}
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
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>
                        Emas ({topOlahragawanT6.individualGold}👤 {topOlahragawanT6.groupGold}👥)
                      </div>
                    </div>
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥈</span> {topOlahragawanT6.silver}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>
                        Perak ({topOlahragawanT6.individualSilver}👤 {topOlahragawanT6.groupSilver}👥)
                      </div>
                    </div>
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥉</span> {topOlahragawanT6.bronze}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>
                        Gangsa ({topOlahragawanT6.individualBronze}👤 {topOlahragawanT6.groupBronze}👥)
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                        <Star size={15} className="text-amber-500 fill-amber-500" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                        <span>{topOlahragawanT6.totalPoints}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Mata</div>
                    </div>
                  </div>

                  {/* Pencapaian Acara with Individu / Kumpulan tags */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>Pencapaian Acara:</span>
                    {topOlahragawanT6.eventsJoined.map((ev, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#ffffff',
                          border: `1px solid ${ev.isGroup ? '#818cf8' : '#bfdbfe'}`,
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
                        <span>{ev.eventName} ({ev.category})</span>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: ev.isGroup ? '#e0e7ff' : '#eff6ff',
                            color: ev.isGroup ? '#4338ca' : '#1d4ed8',
                          }}
                        >
                          {ev.isGroup ? '👥 Kumpulan' : '👤 Individu'}
                        </span>
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
                  Belum ada keputusan acara Tahun 6 Lelaki direkodkan.
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
                            {topOlahragawatiT6.className && <span>• {topOlahragawatiT6.className}</span>}
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
                      border: '1px solid #fecdd3',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥇</span> {topOlahragawatiT6.gold}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>
                        Emas ({topOlahragawatiT6.individualGold}👤 {topOlahragawatiT6.groupGold}👥)
                      </div>
                    </div>
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥈</span> {topOlahragawatiT6.silver}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>
                        Perak ({topOlahragawatiT6.individualSilver}👤 {topOlahragawatiT6.groupSilver}👥)
                      </div>
                    </div>
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥉</span> {topOlahragawatiT6.bronze}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>
                        Gangsa ({topOlahragawatiT6.individualBronze}👤 {topOlahragawatiT6.groupBronze}👥)
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                        <Star size={15} className="text-amber-500 fill-amber-500" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                        <span>{topOlahragawatiT6.totalPoints}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>Mata</div>
                    </div>
                  </div>

                  {/* Pencapaian Acara with Individu / Kumpulan tags */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>Pencapaian Acara:</span>
                    {topOlahragawatiT6.eventsJoined.map((ev, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#ffffff',
                          border: `1px solid ${ev.isGroup ? '#f472b6' : '#fecdd3'}`,
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
                        <span>{ev.eventName} ({ev.category})</span>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: ev.isGroup ? '#fdf2f8' : '#fff1f2',
                            color: ev.isGroup ? '#be185d' : '#e11d48',
                          }}
                        >
                          {ev.isGroup ? '👥 Kumpulan' : '👤 Individu'}
                        </span>
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
                  Belum ada keputusan acara Tahun 6 Perempuan direkodkan.
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
                            {topHarapanBoyT5.className && <span>• {topHarapanBoyT5.className}</span>}
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
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>
                        Emas ({topHarapanBoyT5.individualGold}👤 {topHarapanBoyT5.groupGold}👥)
                      </div>
                    </div>
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥈</span> {topHarapanBoyT5.silver}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>
                        Perak ({topHarapanBoyT5.individualSilver}👤 {topHarapanBoyT5.groupSilver}👥)
                      </div>
                    </div>
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥉</span> {topHarapanBoyT5.bronze}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>
                        Gangsa ({topHarapanBoyT5.individualBronze}👤 {topHarapanBoyT5.groupBronze}👥)
                      </div>
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
                          border: `1px solid ${ev.isGroup ? '#34d399' : '#a7f3d0'}`,
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
                        <span>{ev.eventName} ({ev.category})</span>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: ev.isGroup ? '#d1fae5' : '#ecfdf5',
                            color: ev.isGroup ? '#047857' : '#065f46',
                          }}
                        >
                          {ev.isGroup ? '👥 Kumpulan' : '👤 Individu'}
                        </span>
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
                  Belum ada keputusan acara Tahun 5 Lelaki direkodkan.
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
                            {topHarapanGirlT5.className && <span>• {topHarapanGirlT5.className}</span>}
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
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>
                        Emas ({topHarapanGirlT5.individualGold}👤 {topHarapanGirlT5.groupGold}👥)
                      </div>
                    </div>
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥈</span> {topHarapanGirlT5.silver}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>
                        Perak ({topHarapanGirlT5.individualSilver}👤 {topHarapanGirlT5.groupSilver}👥)
                      </div>
                    </div>
                    <div style={{ borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        <span style={{ fontSize: '15px', marginRight: '3px' }}>🥉</span> {topHarapanGirlT5.bronze}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>
                        Gangsa ({topHarapanGirlT5.individualBronze}👤 {topHarapanGirlT5.groupBronze}👥)
                      </div>
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
                          border: `1px solid ${ev.isGroup ? '#fb923c' : '#fed7aa'}`,
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
                        <span>{ev.eventName} ({ev.category})</span>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: ev.isGroup ? '#ffedd5' : '#fff7ed',
                            color: ev.isGroup ? '#c2410c' : '#9a3412',
                          }}
                        >
                          {ev.isGroup ? '👥 Kumpulan' : '👤 Individu'}
                        </span>
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
                  Belum ada keputusan acara Tahun 5 Perempuan direkodkan.
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
              Senarai Pungutan Pingat Atlet Individu & Kumpulan
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                padding: '3px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <User size={12} /> Individu (Podium 7/5/3)
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                background: '#eef2ff',
                color: '#4338ca',
                border: '1px solid #c7d2fe',
                padding: '3px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Users size={12} /> Kumpulan (4x50, 4x100, 4x200)
            </span>

            <div style={{ position: 'relative', width: '240px' }}>
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
                gridTemplateColumns: '45px 2.2fr 95px 65px 65px 65px 70px 100px 2fr',
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
              <div style={{ textAlign: 'center' }}>Jumlah Pingat</div>
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
                      onClick={() => setSelectedAthlete(ath)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '45px 2.2fr 95px 65px 65px 65px 70px 100px 2fr',
                        padding: '12px 16px',
                        background: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        alignItems: 'center',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                        fontSize: '13px',
                        cursor: 'pointer',
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
                          Rumah {ath.houseName} {ath.className ? `• ${ath.className}` : ''} • {ath.gender}
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
                      <div style={{ textAlign: 'center', fontWeight: 700, color: '#b45309', fontSize: '13px' }}>
                        <div>{ath.gold}</div>
                        {(ath.individualGold > 0 || ath.groupGold > 0) && (
                          <div style={{ fontSize: '9px', color: '#94a3b8' }}>
                            {ath.individualGold}👤 {ath.groupGold}👥
                          </div>
                        )}
                      </div>

                      {/* Perak */}
                      <div style={{ textAlign: 'center', fontWeight: 700, color: '#475569', fontSize: '13px' }}>
                        <div>{ath.silver}</div>
                        {(ath.individualSilver > 0 || ath.groupSilver > 0) && (
                          <div style={{ fontSize: '9px', color: '#94a3b8' }}>
                            {ath.individualSilver}👤 {ath.groupSilver}👥
                          </div>
                        )}
                      </div>

                      {/* Gangsa */}
                      <div style={{ textAlign: 'center', fontWeight: 700, color: '#b45309', fontSize: '13px' }}>
                        <div>{ath.bronze}</div>
                        {(ath.individualBronze > 0 || ath.groupBronze > 0) && (
                          <div style={{ fontSize: '9px', color: '#94a3b8' }}>
                            {ath.individualBronze}👤 {ath.groupBronze}👥
                          </div>
                        )}
                      </div>

                      {/* Rekod Baharu */}
                      <div style={{ textAlign: 'center', fontWeight: 700, color: '#dc2626', fontSize: '13px' }}>
                        {ath.brokenRecordsCount > 0 ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}>
                            <Flame size={14} /> {ath.brokenRecordsCount}
                          </span>
                        ) : (
                          '-'
                        )}
                      </div>

                      {/* Jumlah Pingat */}
                      <div style={{ textAlign: 'center', fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                        {ath.gold + ath.silver + ath.bronze} Pingat
                      </div>

                      {/* Acara Ditandingi with Individu / Kumpulan Indicators */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {ath.eventsJoined.map((ev, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background:
                                ev.place === 1 ? '#fef3c7' : ev.place === 2 ? '#f1f5f9' : '#ffedd5',
                              border: `1px solid ${
                                ev.isGroup
                                  ? '#c7d2fe'
                                  : ev.place === 1
                                    ? '#fde68a'
                                    : ev.place === 2
                                      ? '#cbd5e1'
                                      : '#fed7aa'
                              }`,
                              fontSize: '11px',
                              fontWeight: 700,
                              color:
                                ev.place === 1 ? '#92400e' : ev.place === 2 ? '#334155' : '#9a3412',
                            }}
                          >
                            <span>{ev.place === 1 ? '🥇' : ev.place === 2 ? '🥈' : '🥉'}</span>
                            <span>{ev.eventName}</span>
                            <span
                              style={{
                                fontSize: '9px',
                                padding: '0 4px',
                                borderRadius: '3px',
                                background: ev.isGroup ? '#e0e7ff' : '#f8fafc',
                                color: ev.isGroup ? '#4338ca' : '#64748b',
                                fontWeight: 800,
                              }}
                            >
                              {ev.isGroup ? '👥 Kump' : '👤 Ind'}
                            </span>
                            {ev.recordValue && <span style={{ color: '#0284c7' }}>• {ev.recordValue}</span>}
                            {ev.isRecordBroken && <span style={{ color: '#dc2626' }}>🔥 Rekod</span>}
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

      {/* Selected Athlete Detail Modal */}
      {selectedAthlete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setSelectedAthlete(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedAthlete(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <X size={16} />
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background:
                    selectedAthlete.gender === 'Lelaki'
                      ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
                      : 'linear-gradient(135deg, #831843 0%, #ec4899 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                  {selectedAthlete.name}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  Rumah {selectedAthlete.houseName} {selectedAthlete.className ? `• ${selectedAthlete.className}` : ''} •{' '}
                  {selectedAthlete.gender}
                </div>
              </div>
            </div>

            {/* Medals Summary Grid in Modal */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                background: '#f8fafc',
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 800 }}>EMAS</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
                  🥇 {selectedAthlete.gold}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#475569', fontWeight: 800 }}>PERAK</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
                  🥈 {selectedAthlete.silver}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 800 }}>GANGSA</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
                  🥉 {selectedAthlete.bronze}
                </div>
              </div>
            </div>

            {/* Events List */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>
                Pecahan Acara & Pencapaian ({selectedAthlete.eventsJoined.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedAthlete.eventsJoined.map((ev, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>
                        {ev.place === 1 ? '🥇' : ev.place === 2 ? '🥈' : '🥉'}
                      </span>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{ev.eventName}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{ev.category}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: ev.isGroup ? '#eef2ff' : '#eff6ff',
                          color: ev.isGroup ? '#4338ca' : '#1d4ed8',
                          border: `1px solid ${ev.isGroup ? '#c7d2fe' : '#bfdbfe'}`,
                        }}
                      >
                        {ev.isGroup ? '👥 Acara Kumpulan' : '👤 Acara Individu'}
                      </span>
                      <span style={{ fontWeight: 900, color: '#16a34a', fontSize: '13px' }}>
                        +{ev.points} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedAthlete(null)}
              style={{
                width: '100%',
                padding: '10px',
                background: '#235937',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
