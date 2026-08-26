import { useState, useMemo } from 'react'
import { Crown, Search, Star, Sparkles, User, Users } from 'lucide-react'
import { EventRecord, HouseItem } from './PublicLeaderboardTab'
import {
  computeAthleteStandings,
  getTopAwardContenders,
  AthleteRegistrationItem,
  AthleteStanding,
  AthleteStandingEvent,
} from '../../utils/athlete_standings'

interface PublicSpecialAwardsTabProps {
  events: EventRecord[]
  houses: HouseItem[]
  registeredAthletes?: AthleteRegistrationItem[]
}

export default function PublicSpecialAwardsTab({
  events,
  houses,
  registeredAthletes = [],
}: PublicSpecialAwardsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'khas' | 'harapan' | 'lelaki' | 'perempuan'>('all')
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteStanding | null>(null)

  // Calculate comprehensive athlete scores dynamically including 4x50, 4x100, 4x200 relay events
  const allAthletes = useMemo(() => {
    return computeAthleteStandings(events as any, houses, registeredAthletes)
  }, [events, houses, registeredAthletes])

  // Extract Top 4 Contenders
  const {
    topOlahragawanT6,
    topOlahragawatiT6: topGirlT6,
    topHarapanBoyT5,
    topHarapanGirlT5: topGirlT5,
  } = useMemo(() => {
    return getTopAwardContenders(allAthletes)
  }, [allAthletes])

  // Filtered by selected tab and search
  const filteredAthletes = useMemo(() => {
    return allAthletes.filter((ath) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchName = ath.name.toLowerCase().includes(q)
        const matchHouse = ath.houseName.toLowerCase().includes(q)
        const matchCat = (ath.category || '').toLowerCase().includes(q)
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
            Khusus untuk atlet Tahun 6 terbaik kejohanan (Individu & Acara Kumpulan/Relay)
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
                flexWrap: 'wrap',
                gap: '6px',
              }}
            >
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

            {topOlahragawanT6 ? (
              <div>
                <h3
                  style={{
                    fontSize: 'clamp(18px, 4vw, 22px)',
                    fontWeight: 900,
                    color: '#ffffff',
                    marginBottom: '4px',
                    lineHeight: 1.25,
                  }}
                >
                  {topOlahragawanT6.name}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: '#bfdbfe',
                    marginBottom: '14px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: topOlahragawanT6.houseColor,
                    }}
                  />
                  <span style={{ fontWeight: 700 }}>Rumah {topOlahragawanT6.houseName}</span>
                  {topOlahragawanT6.className && <span>• {topOlahragawanT6.className}</span>}
                </div>

                {/* Medals Tally Bar */}
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
                    marginBottom: '12px',
                  }}
                >
                  <span>🥇 {topOlahragawanT6.gold}</span>
                  <span>🥈 {topOlahragawanT6.silver}</span>
                  <span>🥉 {topOlahragawanT6.bronze}</span>
                  <span style={{ color: '#fbbf24' }}>{topOlahragawanT6.gold + topOlahragawanT6.silver + topOlahragawanT6.bronze} Pingat</span>
                </div>

                {/* Event Highlights with Individu / Kumpulan Indicators */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 700 }}>
                    Pencapaian Acara:
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {topOlahragawanT6.eventsJoined.map((ev, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          background:
                            ev.place === 1
                              ? 'rgba(254, 240, 138, 0.2)'
                              : ev.place === 2
                                ? 'rgba(241, 245, 249, 0.2)'
                                : 'rgba(254, 215, 170, 0.2)',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>{ev.place === 1 ? '🥇' : ev.place === 2 ? '🥈' : '🥉'}</span>
                        <span>{ev.eventName}</span>
                        <span
                          style={{
                            fontSize: '9px',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            background: ev.isGroup ? 'rgba(99, 102, 241, 0.35)' : 'rgba(16, 185, 129, 0.35)',
                            color: ev.isGroup ? '#c7d2fe' : '#a7f3d0',
                            fontWeight: 800,
                          }}
                        >
                          {ev.isGroup ? '👥 Kumpulan' : '👤 Individu'}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '12px', padding: '12px 0' }}>
                Menunggu keputusan acara Tahun 6 Lelaki direkodkan.
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
                flexWrap: 'wrap',
                gap: '6px',
              }}
            >
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
                <h3
                  style={{
                    fontSize: 'clamp(18px, 4vw, 22px)',
                    fontWeight: 900,
                    color: '#ffffff',
                    marginBottom: '4px',
                    lineHeight: 1.25,
                  }}
                >
                  {topGirlT6.name}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: '#fbcfe8',
                    marginBottom: '14px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: topGirlT6.houseColor,
                    }}
                  />
                  <span style={{ fontWeight: 700 }}>Rumah {topGirlT6.houseName}</span>
                  {topGirlT6.className && <span>• {topGirlT6.className}</span>}
                </div>

                {/* Medals Tally Bar */}
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
                    marginBottom: '12px',
                  }}
                >
                  <span>🥇 {topGirlT6.gold}</span>
                  <span>🥈 {topGirlT6.silver}</span>
                  <span>🥉 {topGirlT6.bronze}</span>
                  <span style={{ color: '#fbbf24' }}>{topGirlT6.gold + topGirlT6.silver + topGirlT6.bronze} Pingat</span>
                </div>

                {/* Event Highlights with Individu / Kumpulan Indicators */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ fontSize: '11px', color: '#fbcfe8', fontWeight: 700 }}>
                    Pencapaian Acara:
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {topGirlT6.eventsJoined.map((ev: AthleteStandingEvent, i: number) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          background:
                            ev.place === 1
                              ? 'rgba(254, 240, 138, 0.2)'
                              : ev.place === 2
                                ? 'rgba(241, 245, 249, 0.2)'
                                : 'rgba(254, 215, 170, 0.2)',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>{ev.place === 1 ? '🥇' : ev.place === 2 ? '🥈' : '🥉'}</span>
                        <span>{ev.eventName}</span>
                        <span
                          style={{
                            fontSize: '9px',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            background: ev.isGroup ? 'rgba(99, 102, 241, 0.35)' : 'rgba(16, 185, 129, 0.35)',
                            color: ev.isGroup ? '#c7d2fe' : '#a7f3d0',
                            fontWeight: 800,
                          }}
                        >
                          {ev.isGroup ? '👥 Kumpulan' : '👤 Individu'}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '12px', padding: '12px 0' }}>
                Menunggu keputusan acara Tahun 6 Perempuan direkodkan.
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
            Khusus untuk bakat muda Tahun 5 terbaik kejohanan (Individu & Acara Kumpulan/Relay)
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
                flexWrap: 'wrap',
                gap: '6px',
              }}
            >
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

            {topHarapanBoyT5 ? (
              <div>
                <h3
                  style={{
                    fontSize: 'clamp(18px, 4vw, 22px)',
                    fontWeight: 900,
                    color: '#ffffff',
                    marginBottom: '4px',
                    lineHeight: 1.25,
                  }}
                >
                  {topHarapanBoyT5.name}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: '#ccfbf1',
                    marginBottom: '14px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: topHarapanBoyT5.houseColor,
                    }}
                  />
                  <span style={{ fontWeight: 700 }}>Rumah {topHarapanBoyT5.houseName}</span>
                  {topHarapanBoyT5.className && <span>• {topHarapanBoyT5.className}</span>}
                </div>

                {/* Medals Tally Bar */}
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
                    marginBottom: '12px',
                  }}
                >
                  <span>🥇 {topHarapanBoyT5.gold}</span>
                  <span>🥈 {topHarapanBoyT5.silver}</span>
                  <span>🥉 {topHarapanBoyT5.bronze}</span>
                  <span style={{ color: '#6ee7b7' }}>{topHarapanBoyT5.gold + topHarapanBoyT5.silver + topHarapanBoyT5.bronze} Pingat</span>
                </div>

                {/* Event Highlights with Individu / Kumpulan Indicators */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ fontSize: '11px', color: '#a7f3d0', fontWeight: 700 }}>
                    Pencapaian Acara:
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {topHarapanBoyT5.eventsJoined.map((ev, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          background:
                            ev.place === 1
                              ? 'rgba(254, 240, 138, 0.2)'
                              : ev.place === 2
                                ? 'rgba(241, 245, 249, 0.2)'
                                : 'rgba(254, 215, 170, 0.2)',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>{ev.place === 1 ? '🥇' : ev.place === 2 ? '🥈' : '🥉'}</span>
                        <span>{ev.eventName}</span>
                        <span
                          style={{
                            fontSize: '9px',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            background: ev.isGroup ? 'rgba(99, 102, 241, 0.35)' : 'rgba(16, 185, 129, 0.35)',
                            color: ev.isGroup ? '#c7d2fe' : '#a7f3d0',
                            fontWeight: 800,
                          }}
                        >
                          {ev.isGroup ? '👥 Kumpulan' : '👤 Individu'}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: '#99f6e4', fontSize: '12px', padding: '12px 0' }}>
                Menunggu keputusan acara Tahun 5 Lelaki direkodkan.
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
                flexWrap: 'wrap',
                gap: '6px',
              }}
            >
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
                <h3
                  style={{
                    fontSize: 'clamp(18px, 4vw, 22px)',
                    fontWeight: 900,
                    color: '#ffffff',
                    marginBottom: '4px',
                    lineHeight: 1.25,
                  }}
                >
                  {topGirlT5.name}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: '#ffedd5',
                    marginBottom: '14px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: topGirlT5.houseColor,
                    }}
                  />
                  <span style={{ fontWeight: 700 }}>Rumah {topGirlT5.houseName}</span>
                  {topGirlT5.className && <span>• {topGirlT5.className}</span>}
                </div>

                {/* Medals Tally Bar */}
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
                    marginBottom: '12px',
                  }}
                >
                  <span>🥇 {topGirlT5.gold}</span>
                  <span>🥈 {topGirlT5.silver}</span>
                  <span>🥉 {topGirlT5.bronze}</span>
                  <span style={{ color: '#fdba74' }}>{topGirlT5.gold + topGirlT5.silver + topGirlT5.bronze} Pingat</span>
                </div>

                {/* Event Highlights with Individu / Kumpulan Indicators */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ fontSize: '11px', color: '#fed7aa', fontWeight: 700 }}>
                    Pencapaian Acara:
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {topGirlT5.eventsJoined.map((ev: AthleteStandingEvent, i: number) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          background:
                            ev.place === 1
                              ? 'rgba(254, 240, 138, 0.2)'
                              : ev.place === 2
                                ? 'rgba(241, 245, 249, 0.2)'
                                : 'rgba(254, 215, 170, 0.2)',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>{ev.place === 1 ? '🥇' : ev.place === 2 ? '🥈' : '🥉'}</span>
                        <span>{ev.eventName}</span>
                        <span
                          style={{
                            fontSize: '9px',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            background: ev.isGroup ? 'rgba(99, 102, 241, 0.35)' : 'rgba(16, 185, 129, 0.35)',
                            color: ev.isGroup ? '#c7d2fe' : '#a7f3d0',
                            fontWeight: 800,
                          }}
                        >
                          {ev.isGroup ? '👥 Kumpulan' : '👤 Individu'}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: '#fed7aa', fontSize: '12px', padding: '12px 0' }}>
                Menunggu keputusan acara Tahun 5 Perempuan direkodkan.
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
                marginBottom: '2px',
              }}
            >
              KEDUDUKAN RASMI ATLET
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Pungutan Pingat & Mata Atlet Kejohanan
            </h2>
          </div>

          {/* Indicator Legend */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
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
              <User size={12} /> Acara Individu (Podium 7/5/3)
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
              <Users size={12} /> Acara Kumpulan/Relay (4x50, 4x100, 4x200)
            </span>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: '🏆 Semua Atlet' },
            { key: 'khas', label: '👑 Anugerah Khas (Tahun 6)' },
            { key: 'harapan', label: '⭐ Anugerah Harapan (Tahun 5)' },
            { key: 'lelaki', label: '🏃 Lelaki' },
            { key: 'perempuan', label: '🏃‍♀️ Perempuan' },
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
                <th
                  style={{
                    padding: '10px 14px',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#475569',
                    textAlign: 'left',
                    borderRadius: '10px 0 0 10px',
                  }}
                >
                  KEDUDUKAN
                </th>
                <th
                  style={{
                    padding: '10px 14px',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#475569',
                    textAlign: 'left',
                  }}
                >
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
                <th
                  style={{
                    padding: '10px 14px',
                    fontSize: '12px',
                    fontWeight: 900,
                    color: 'var(--forest-green)',
                    textAlign: 'right',
                    borderRadius: '0 10px 10px 0',
                  }}
                >
                  JUMLAH PINGAT
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
                  const rankEmoji =
                    idx === 0 ? '👑 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`
                  const rankBg =
                    idx === 0 ? '#fef3c7' : idx === 1 ? '#f1f5f9' : idx === 2 ? '#fff7ed' : 'transparent'
                  const rankColor =
                    idx === 0 ? '#92400e' : idx === 1 ? '#475569' : idx === 2 ? '#9a3412' : '#64748b'

                  const isT6Khas = ath.year === '6'
                  const isT5Harapan = ath.year === '5'

                  return (
                    <tr
                      key={ath.name}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                      onClick={() => setSelectedAthlete(ath)}
                    >
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

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '11px',
                              color: '#64748b',
                              marginTop: '2px',
                              flexWrap: 'wrap',
                            }}
                          >
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
                            {ath.className && <span>• {ath.className}</span>}
                            <span>• {ath.gender}</span>
                          </div>

                          {/* Won events chips with Individu / Kumpulan Indicators */}
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                            {ath.eventsJoined.map((ev, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  background:
                                    ev.place === 1 ? '#fef3c7' : ev.place === 2 ? '#f1f5f9' : '#ffedd5',
                                  color: ev.place === 1 ? '#92400e' : ev.place === 2 ? '#334155' : '#9a3412',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  border: `1px solid ${
                                    ev.isGroup ? '#c7d2fe' : ev.place === 1 ? '#fde68a' : '#e2e8f0'
                                  }`,
                                }}
                              >
                                <span>{ev.place === 1 ? '🥇' : ev.place === 2 ? '🥈' : '🥉'}</span>
                                <span>{ev.eventName}</span>
                                <span
                                  style={{
                                    fontSize: '9px',
                                    padding: '0 3px',
                                    borderRadius: '2px',
                                    background: ev.isGroup ? '#e0e7ff' : '#f1f5f9',
                                    color: ev.isGroup ? '#4338ca' : '#475569',
                                    fontWeight: 700,
                                  }}
                                >
                                  {ev.isGroup ? '👥 Kump' : '👤 Ind'}
                                </span>
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
                          {isT6Khas
                            ? 'Tahun 6'
                            : isT5Harapan
                              ? 'Tahun 5'
                              : ath.year !== 'other' && ath.year !== 'pra'
                                ? `Tahun ${ath.year}`
                                : ath.category || 'Terbuka'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: 900, fontSize: '13px', color: '#b45309' }}>
                          {ath.gold}
                        </div>
                        {(ath.individualGold > 0 || ath.groupGold > 0) && (
                          <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700 }}>
                            {ath.individualGold}👤 {ath.groupGold}👥
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: 900, fontSize: '13px', color: '#475569' }}>
                          {ath.silver}
                        </div>
                        {(ath.individualSilver > 0 || ath.groupSilver > 0) && (
                          <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700 }}>
                            {ath.individualSilver}👤 {ath.groupSilver}👥
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: 900, fontSize: '13px', color: '#b45309' }}>
                          {ath.bronze}
                        </div>
                        {(ath.individualBronze > 0 || ath.groupBronze > 0) && (
                          <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700 }}>
                            {ath.individualBronze}👤 {ath.groupBronze}👥
                          </div>
                        )}
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
                          {ath.gold + ath.silver + ath.bronze}{' '}
                          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>pingat</span>
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

      {/* Athlete Detail Modal */}
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
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 900,
                    color: selectedAthlete.houseColor,
                    textTransform: 'uppercase',
                  }}
                >
                  Rumah {selectedAthlete.houseName} {selectedAthlete.className ? `• ${selectedAthlete.className}` : ''}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '2px 0 0' }}>
                  {selectedAthlete.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAthlete(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontWeight: 900,
                  color: '#64748b',
                }}
              >
                ✕
              </button>
            </div>

            {/* Medal Summary Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                textAlign: 'center',
                background: '#f8fafc',
                padding: '12px',
                borderRadius: '16px',
                marginBottom: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#b45309' }}>🥇 {selectedAthlete.gold}</div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>Emas ({selectedAthlete.individualGold}👤 {selectedAthlete.groupGold}👥)</div>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#475569' }}>🥈 {selectedAthlete.silver}</div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>Perak ({selectedAthlete.individualSilver}👤 {selectedAthlete.groupSilver}👥)</div>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#b45309' }}>🥉 {selectedAthlete.bronze}</div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>Gangsa ({selectedAthlete.individualBronze}👤 {selectedAthlete.groupBronze}👥)</div>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--forest-green)' }}>⭐ {selectedAthlete.totalPoints}</div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>Jumlah Mata</div>
              </div>
            </div>

            {/* Events Breakdown */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                Perincian Acara & Pencapaian:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                {selectedAthlete.eventsJoined.map((ev, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
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
                background: 'var(--forest-green)',
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
