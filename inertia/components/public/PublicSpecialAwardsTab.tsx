import { useState, useMemo } from 'react'
import { Crown, Search, Star, Sparkles } from 'lucide-react'
import { EventRecord, HouseItem } from './PublicLeaderboardTab'

interface PublicSpecialAwardsTabProps {
  events: EventRecord[]
  houses: HouseItem[]
}

export type CohortYear = '6' | '5' | '4' | '3' | '2' | '1' | 'pra' | 'other'

export interface AthleteStanding {
  name: string
  gender: 'Lelaki' | 'Perempuan'
  year: CohortYear
  category: string
  houseId: string
  houseName: string
  houseColor: string
  gold: number
  silver: number
  bronze: number
  fourth: number
  totalPoints: number
  brokenRecordsCount: number
  eventsJoined: Array<{
    place: number
    eventCode: string
    eventName: string
    category: string
    points: number
    recordValue?: string
    isRecordBroken?: boolean
  }>
}

export function isGroupEvent(eventName: string): boolean {
  const lower = eventName.toLowerCase()
  return (
    lower.includes('4x') ||
    lower.includes('4 x') ||
    lower.includes('relay') ||
    lower.includes('berganti') ||
    lower.includes('sukaneka') ||
    lower.includes('tarik tali')
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

export default function PublicSpecialAwardsTab({
  events,
  houses,
}: PublicSpecialAwardsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'khas' | 'harapan' | 'lelaki' | 'perempuan'>('all')

  // Calculate individual athlete scores dynamically
  const allAthletes = useMemo(() => {
    const athleteMap = new Map<string, AthleteStanding>()

    events.forEach((ev) => {
      // Exclude group/relay/sukaneka events for individual Olahragawan / Olahragawati
      if (isGroupEvent(ev.eventName) || ev.status !== 'completed' || !ev.results) return

      const isPerempuan =
        ev.category.toLowerCase().includes('perempuan') ||
        ev.category.toLowerCase().includes('p1') ||
        ev.category.toLowerCase().includes('p2') ||
        ev.category.toLowerCase().includes('p0')

      const detectedYear = extractCohortYear(ev.category, ev.eventName)

      ev.results.forEach((res) => {
        if (!res.athleteName || res.athleteName.trim() === '') return
        const name = res.athleteName.trim()
        if (name.toLowerCase().startsWith('rumah ') || name.toLowerCase().startsWith('kuadren ')) return

        const house = houses.find((h) => h.id === res.houseId)
        const houseName = house ? house.name : res.houseId
        const houseColor = house ? house.color : '#2563eb'

        const gender: 'Lelaki' | 'Perempuan' = isPerempuan ? 'Perempuan' : 'Lelaki'

        if (!athleteMap.has(name)) {
          athleteMap.set(name, {
            name,
            gender,
            year: detectedYear,
            category: ev.category,
            houseId: res.houseId,
            houseName,
            houseColor,
            gold: 0,
            silver: 0,
            bronze: 0,
            fourth: 0,
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
        else if (res.place === 4) ath.fourth += 1

        ath.totalPoints += res.points || 0
        if (res.isRecordBroken) {
          ath.brokenRecordsCount += 1
        }

        ath.eventsJoined.push({
          place: res.place,
          eventCode: ev.code,
          eventName: ev.eventName,
          category: ev.category,
          points: res.points,
          recordValue: res.recordValue,
          isRecordBroken: res.isRecordBroken,
        })
      })
    })

    // Sort by: Gold > Silver > Bronze > Broken Records > Total Points
    return Array.from(athleteMap.values()).sort((a, b) => {
      if (b.gold !== a.gold) return b.gold - a.gold
      if (b.silver !== a.silver) return b.silver - a.silver
      if (b.bronze !== a.bronze) return b.bronze - a.bronze
      if (b.brokenRecordsCount !== a.brokenRecordsCount) return b.brokenRecordsCount - a.brokenRecordsCount
      return b.totalPoints - a.totalPoints
    })
  }, [events, houses])

  // Filtered by selected tab and search
  const filteredAthletes = useMemo(() => {
    return allAthletes.filter((ath) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchName = ath.name.toLowerCase().includes(q)
        const matchHouse = ath.houseName.toLowerCase().includes(q)
        const matchCat = ath.category.toLowerCase().includes(q)
        if (!matchName && !matchHouse && !matchCat) return false
      }

      if (activeTab === 'khas') {
        return ath.year === '6'
      }
      if (activeTab === 'harapan') {
        return ath.year === '5'
      }
      if (activeTab === 'lelaki') {
        return ath.gender === 'Lelaki'
      }
      if (activeTab === 'perempuan') {
        return ath.gender === 'Perempuan'
      }

      return true
    })
  }, [allAthletes, activeTab, searchQuery])

  // 1. Anugerah Khas (Tahun 6 Sahaja)
  const topBoyT6 = allAthletes.find((a) => a.gender === 'Lelaki' && a.year === '6')
  const topGirlT6 = allAthletes.find((a) => a.gender === 'Perempuan' && a.year === '6')

  // 2. Anugerah Harapan (Tahun 5 Sahaja)
  const topBoyT5 = allAthletes.find((a) => a.gender === 'Lelaki' && a.year === '5')
  const topGirlT5 = allAthletes.find((a) => a.gender === 'Perempuan' && a.year === '5')

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto 30px', padding: '0 16px' }}>
      
      {/* ========================================================
          1. ANUGERAH KHAS (TAHUN 6 SAHAJA)
      ======================================================== */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div
            style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: '4px 10px',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Crown size={15} />
            <span>ANUGERAH KHAS KEJOHANAN (TAHUN 6)</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            Khusus untuk atlet Tahun 6 terbaik kejohanan
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Olahragawan Kejohanan (Tahun 6 Lelaki) */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
              borderRadius: '20px',
              padding: 'clamp(16px, 3.5vw, 24px)',
              color: '#ffffff',
              boxShadow: '0 10px 24px rgba(30, 58, 138, 0.25)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
              <div
                style={{
                  background: 'rgba(251, 191, 36, 0.2)',
                  color: '#fbbf24',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Crown size={12} />
                <span>TAHUN 6</span>
              </div>
              <span style={{ fontSize: '12px', color: '#93c5fd', fontWeight: 800 }}>
                Olahragawan Kejohanan (Lelaki)
              </span>
            </div>

            {topBoyT6 ? (
              <div>
                <h3 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: '#ffffff', marginBottom: '4px', lineHeight: 1.25 }}>
                  {topBoyT6.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#bfdbfe', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: topBoyT6.houseColor,
                    }}
                  />
                  <span style={{ fontWeight: 700 }}>Rumah {topBoyT6.houseName}</span>
                  <span>• Tahun 6 Lelaki</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>🥇 {topBoyT6.gold}</span>
                  <span>🥈 {topBoyT6.silver}</span>
                  <span>🥉 {topBoyT6.bronze}</span>
                  <span style={{ color: '#fbbf24' }}>{topBoyT6.totalPoints} pts</span>
                </div>
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '12px', padding: '12px 0' }}>
                Menunggu keputusan acara individu Tahun 6 Lelaki diselesaikan.
              </div>
            )}
          </div>

          {/* Olahragawati Kejohanan (Tahun 6 Perempuan) */}
          <div
            style={{
              background: 'linear-gradient(135deg, #831843 0%, #500724 100%)',
              borderRadius: '20px',
              padding: 'clamp(16px, 3.5vw, 24px)',
              color: '#ffffff',
              boxShadow: '0 10px 24px rgba(131, 24, 67, 0.25)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
              <div
                style={{
                  background: 'rgba(251, 191, 36, 0.2)',
                  color: '#fbbf24',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Crown size={12} />
                <span>TAHUN 6</span>
              </div>
              <span style={{ fontSize: '12px', color: '#fbcfe8', fontWeight: 800 }}>
                Olahragawati Kejohanan (Perempuan)
              </span>
            </div>

            {topGirlT6 ? (
              <div>
                <h3 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: '#ffffff', marginBottom: '4px', lineHeight: 1.25 }}>
                  {topGirlT6.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#fbcfe8', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: topGirlT6.houseColor,
                    }}
                  />
                  <span style={{ fontWeight: 700 }}>Rumah {topGirlT6.houseName}</span>
                  <span>• Tahun 6 Perempuan</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>🥇 {topGirlT6.gold}</span>
                  <span>🥈 {topGirlT6.silver}</span>
                  <span>🥉 {topGirlT6.bronze}</span>
                  <span style={{ color: '#fbbf24' }}>{topGirlT6.totalPoints} pts</span>
                </div>
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '12px', padding: '12px 0' }}>
                Menunggu keputusan acara individu Tahun 6 Perempuan diselesaikan.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          2. ANUGERAH HARAPAN (TAHUN 5 SAHAJA)
      ======================================================== */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div
            style={{
              background: '#ecfdf5',
              color: '#065f46',
              padding: '4px 10px',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid #a7f3d0',
            }}
          >
            <Sparkles size={15} />
            <span>ANUGERAH HARAPAN (TAHUN 5)</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            Khusus untuk bakat muda Tahun 5 terbaik kejohanan
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Olahragawan Harapan (Tahun 5 Lelaki) */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)',
              borderRadius: '20px',
              padding: 'clamp(16px, 3.5vw, 24px)',
              color: '#ffffff',
              boxShadow: '0 10px 24px rgba(15, 118, 110, 0.25)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
              <div
                style={{
                  background: 'rgba(52, 211, 153, 0.2)',
                  color: '#6ee7b7',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Star size={12} />
                <span>TAHUN 5</span>
              </div>
              <span style={{ fontSize: '12px', color: '#a7f3d0', fontWeight: 800 }}>
                Olahragawan Harapan (Lelaki)
              </span>
            </div>

            {topBoyT5 ? (
              <div>
                <h3 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: '#ffffff', marginBottom: '4px', lineHeight: 1.25 }}>
                  {topBoyT5.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ccfbf1', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: topBoyT5.houseColor,
                    }}
                  />
                  <span style={{ fontWeight: 700 }}>Rumah {topBoyT5.houseName}</span>
                  <span>• Tahun 5 Lelaki</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>🥇 {topBoyT5.gold}</span>
                  <span>🥈 {topBoyT5.silver}</span>
                  <span>🥉 {topBoyT5.bronze}</span>
                  <span style={{ color: '#6ee7b7' }}>{topBoyT5.totalPoints} pts</span>
                </div>
              </div>
            ) : (
              <div style={{ color: '#99f6e4', fontSize: '12px', padding: '12px 0' }}>
                Menunggu keputusan acara individu Tahun 5 Lelaki diselesaikan.
              </div>
            )}
          </div>

          {/* Olahragawati Harapan (Tahun 5 Perempuan) */}
          <div
            style={{
              background: 'linear-gradient(135deg, #7c2d12 0%, #431407 100%)',
              borderRadius: '20px',
              padding: 'clamp(16px, 3.5vw, 24px)',
              color: '#ffffff',
              boxShadow: '0 10px 24px rgba(124, 45, 18, 0.25)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
              <div
                style={{
                  background: 'rgba(251, 146, 60, 0.2)',
                  color: '#fdba74',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Star size={12} />
                <span>TAHUN 5</span>
              </div>
              <span style={{ fontSize: '12px', color: '#fed7aa', fontWeight: 800 }}>
                Olahragawati Harapan (Perempuan)
              </span>
            </div>

            {topGirlT5 ? (
              <div>
                <h3 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: '#ffffff', marginBottom: '4px', lineHeight: 1.25 }}>
                  {topGirlT5.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ffedd5', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: topGirlT5.houseColor,
                    }}
                  />
                  <span style={{ fontWeight: 700 }}>Rumah {topGirlT5.houseName}</span>
                  <span>• Tahun 5 Perempuan</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>🥇 {topGirlT5.gold}</span>
                  <span>🥈 {topGirlT5.silver}</span>
                  <span>🥉 {topGirlT5.bronze}</span>
                  <span style={{ color: '#fdba74' }}>{topGirlT5.totalPoints} pts</span>
                </div>
              </div>
            ) : (
              <div style={{ color: '#fed7aa', fontSize: '12px', padding: '12px 0' }}>
                Menunggu keputusan acara individu Tahun 5 Perempuan diselesaikan.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          3. MAIN TABLE CARD (STANDINGS)
      ======================================================== */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: 'clamp(18px, 3.5vw, 28px)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--forest-green)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              KEDUDUKAN INDIVIDU
            </div>
            <h2 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: '#0f172a' }}>
              Pungutan Pingat & Mata Atlet
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Kedudukan dikira secara automatik mengikut jumlah pingat dan rekod kejohanan.
            </p>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '5px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            <Star size={13} style={{ color: '#f59e0b' }} />
            <span>{allAthletes.length} Atlet Meraih Pingat</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            marginBottom: '12px',
          }}
        >
          {[
            { key: 'all', label: 'Semua Atlet' },
            { key: 'khas', label: '👑 Anugerah Khas (Tahun 6)' },
            { key: 'harapan', label: '⭐ Anugerah Harapan (Tahun 5)' },
            { key: 'lelaki', label: 'Lelaki' },
            { key: 'perempuan', label: 'Perempuan' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                border: activeTab === tab.key ? 'none' : '1px solid #e2e8f0',
                background: activeTab === tab.key ? 'var(--forest-green)' : '#f8fafc',
                color: activeTab === tab.key ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                minHeight: '36px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atlet atau rumah sukan..."
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 600,
              color: '#0f172a',
              outline: 'none',
              background: '#f8fafc',
              minHeight: '40px',
            }}
          />
        </div>

        {/* Table List with responsive wrapper */}
        <div className="responsive-table-wrap">
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 800, color: '#475569', textAlign: 'left', borderRadius: '10px 0 0 10px' }}>
                  KEDUDUKAN
                </th>
                <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 800, color: '#475569', textAlign: 'left' }}>
                  NAMA ATLET & RUMAH
                </th>
                <th style={{ padding: '10px 10px', fontSize: '11px', fontWeight: 800, color: '#475569' }}>
                  KELAYAKAN
                </th>
                <th style={{ padding: '10px 10px', fontSize: '11px', fontWeight: 800, color: '#b45309' }}>
                  🥇 EMAS
                </th>
                <th style={{ padding: '10px 10px', fontSize: '11px', fontWeight: 800, color: '#475569' }}>
                  🥈 PERAK
                </th>
                <th style={{ padding: '10px 10px', fontSize: '11px', fontWeight: 800, color: '#b45309' }}>
                  🥉 GANGSA
                </th>
                <th style={{ padding: '10px 10px', fontSize: '11px', fontWeight: 800, color: '#dc2626' }}>
                  🌟 REKOD
                </th>
                <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 900, color: 'var(--forest-green)', textAlign: 'right', borderRadius: '0 10px 10px 0' }}>
                  MATA
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAthletes.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    Tiada rekod atlet untuk kategori ini.
                  </td>
                </tr>
              ) : (
                filteredAthletes.map((ath, idx) => {
                  const rankEmoji = idx === 0 ? '👑 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`
                  const rankBg = idx === 0 ? '#fef3c7' : idx === 1 ? '#f1f5f9' : idx === 2 ? '#fff7ed' : 'transparent'
                  const rankColor = idx === 0 ? '#92400e' : idx === 1 ? '#475569' : idx === 2 ? '#9a3412' : '#64748b'

                  const isT6Khas = ath.year === '6'
                  const isT5Harapan = ath.year === '5'

                  return (
                    <tr key={ath.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                        <span
                          style={{
                            background: rankBg,
                            color: rankColor,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 900,
                            display: 'inline-block',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {rankEmoji}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '13px' }}>
                              {ath.name}
                            </span>
                            {isT6Khas && (
                              <span
                                style={{
                                  background: '#fef3c7',
                                  color: '#92400e',
                                  border: '1px solid #fde68a',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                }}
                              >
                                👑 Anugerah Khas
                              </span>
                            )}
                            {isT5Harapan && (
                              <span
                                style={{
                                  background: '#ecfdf5',
                                  color: '#065f46',
                                  border: '1px solid #a7f3d0',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                }}
                              >
                                ⭐ Harapan T5
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#64748b', marginTop: '2px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: ath.houseColor,
                              }}
                            />
                            <span style={{ fontWeight: 700, color: ath.houseColor }}>
                              Rumah {ath.houseName}
                            </span>
                            <span>• {ath.gender}</span>
                            <span>• {ath.category}</span>
                          </div>

                          {/* Won events chips */}
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                            {ath.eventsJoined.map((ev, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  background: ev.place === 1 ? '#fef3c7' : ev.place === 2 ? '#f1f5f9' : '#ffedd5',
                                  color: ev.place === 1 ? '#92400e' : ev.place === 2 ? '#334155' : '#9a3412',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                }}
                              >
                                {ev.place === 1 ? '🥇' : ev.place === 2 ? '🥈' : '🥉'} {ev.eventName}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: isT6Khas ? '#fef3c7' : isT5Harapan ? '#ecfdf5' : '#f1f5f9',
                            color: isT6Khas ? '#92400e' : isT5Harapan ? '#065f46' : '#475569',
                            display: 'inline-block',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isT6Khas ? 'Tahun 6' : isT5Harapan ? 'Tahun 5' : ath.year !== 'other' && ath.year !== 'pra' ? `Tahun ${ath.year}` : ath.category}
                        </span>
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ fontWeight: 900, fontSize: '13px', color: '#b45309' }}>
                          {ath.gold}
                        </span>
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ fontWeight: 900, fontSize: '13px', color: '#475569' }}>
                          {ath.silver}
                        </span>
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ fontWeight: 900, fontSize: '13px', color: '#b45309' }}>
                          {ath.bronze}
                        </span>
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        {ath.brokenRecordsCount > 0 ? (
                          <span
                            style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              fontSize: '10px',
                              fontWeight: 900,
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            🌟 {ath.brokenRecordsCount}
                          </span>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: '11px' }}>-</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <span style={{ fontSize: '15px', fontWeight: 900, color: ath.houseColor }}>
                          {ath.totalPoints}{' '}
                          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>pts</span>
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
