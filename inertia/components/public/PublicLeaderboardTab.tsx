import { useState } from 'react'
import { Trophy, Crown, Sparkles, X, ChevronRight } from 'lucide-react'

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
    fourth: number
  }
  athletesCount: number
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
  results: Array<{
    place: number
    medal?: 'gold' | 'silver' | 'bronze' | 'fourth' | null
    points: number
    houseId: string
    athleteName: string
    bib?: string
    lane?: number
    recordValue?: string
    isRecordBroken?: boolean
  }>
}

interface PublicLeaderboardTabProps {
  houses: HouseItem[]
  events: EventRecord[]
  totalAthletes: number
}

export default function PublicLeaderboardTab({
  houses,
  events,
  totalAthletes,
}: PublicLeaderboardTabProps) {
  const [selectedHouse, setSelectedHouse] = useState<HouseItem | null>(null)

  // Sort houses purely by official tournament medal ranking: Gold > Silver > Bronze > Fourth
  const sortedHouses = [...houses].sort(
    (a, b) =>
      (b.medals?.gold || 0) - (a.medals?.gold || 0) ||
      (b.medals?.silver || 0) - (a.medals?.silver || 0) ||
      (b.medals?.bronze || 0) - (a.medals?.bronze || 0) ||
      (b.medals?.fourth || 0) - (a.medals?.fourth || 0)
  )

  const firstPlace = sortedHouses[0]
  const secondPlace = sortedHouses[1]
  const thirdPlace = sortedHouses[2]


  // Get medal-winning achievements for the selected house
  const selectedHouseAchievements = selectedHouse
    ? events.flatMap((ev) =>
        (ev.results || [])
          .filter((r) => r.houseId === selectedHouse.id && r.place <= 4)
          .map((r) => ({
            eventCode: ev.code,
            eventName: ev.eventName,
            category: ev.category,
            stage: ev.stage,
            place: r.place,
            medal: r.medal,
            points: r.points,
            athleteName: r.athleteName,
            recordValue: r.recordValue,
            isRecordBroken: r.isRecordBroken,
          }))
      )
    : []

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto 30px', padding: '0 16px' }}>
      {/* Visual Podium for Top 3 */}
      <div
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '20px',
          padding: 'clamp(20px, 3.5vw, 32px) clamp(12px, 3vw, 20px)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: '18px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--forest-green)',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px',
            }}
          >
            <Trophy size={14} />
            <span>PENTAS PODIUM KESELURUHAN</span>
          </div>
          <h2 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, color: '#0f172a' }}>
            Kedudukan 3 Teratas Kejohanan
          </h2>
        </div>

        {/* 3-Column Podium */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 'clamp(6px, 2vw, 12px)',
            maxWidth: '680px',
            margin: '0 auto',
            minHeight: '220px',
          }}
        >
          {/* 2nd Place (Silver) */}
          {secondPlace && (
            <div
              onClick={() => setSelectedHouse(secondPlace)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                minWidth: '85px',
              }}
            >
              <div
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '6px 8px',
                  marginBottom: '6px',
                  textAlign: 'center',
                  width: '100%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: '16px' }}>🥈</div>
                <div style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 900, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {secondPlace.name}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: secondPlace.color, marginTop: '2px' }}>
                  🥇 {secondPlace.medals?.gold || 0} 🥈 {secondPlace.medals?.silver || 0} 🥉 {secondPlace.medals?.bronze || 0}
                </div>
              </div>
              <div
                style={{
                  width: '100%',
                  height: 'clamp(90px, 18vw, 130px)',
                  background: `linear-gradient(180deg, ${secondPlace.color} 0%, ${secondPlace.color}cc 100%)`,
                  borderRadius: '14px 14px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: 'clamp(20px, 4.5vw, 28px)',
                  boxShadow: `0 4px 14px ${secondPlace.color}40`,
                }}
              >
                2
              </div>
            </div>
          )}

          {/* 1st Place (Gold / Champion) */}
          {firstPlace && (
            <div
              onClick={() => setSelectedHouse(firstPlace)}
              style={{
                flex: 1.2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                minWidth: '95px',
              }}
            >
              <div style={{ animation: 'bounce 2s infinite', marginBottom: '2px' }}>
                <Crown size={24} style={{ color: '#f59e0b', fill: '#fbbf24' }} />
              </div>
              <div
                style={{
                  background: '#fef3c7',
                  border: '2px solid #fbbf24',
                  borderRadius: '14px',
                  padding: '8px 10px',
                  marginBottom: '6px',
                  textAlign: 'center',
                  width: '100%',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.2)',
                }}
              >
                <div style={{ fontSize: '16px' }}>🥇</div>
                <div style={{ fontSize: 'clamp(13px, 3.2vw, 16px)', fontWeight: 900, color: '#92400e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {firstPlace.name}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: firstPlace.color, marginTop: '2px' }}>
                  🥇 {firstPlace.medals?.gold || 0} 🥈 {firstPlace.medals?.silver || 0} 🥉 {firstPlace.medals?.bronze || 0}
                </div>
              </div>
              <div
                style={{
                  width: '100%',
                  height: 'clamp(130px, 25vw, 180px)',
                  background: `linear-gradient(180deg, ${firstPlace.color} 0%, ${firstPlace.color}ee 100%)`,
                  borderRadius: '16px 16px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: 'clamp(26px, 5.5vw, 38px)',
                  boxShadow: `0 8px 24px ${firstPlace.color}50`,
                }}
              >
                1
              </div>
            </div>
          )}

          {/* 3rd Place (Bronze) */}
          {thirdPlace && (
            <div
              onClick={() => setSelectedHouse(thirdPlace)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                minWidth: '85px',
              }}
            >
              <div
                style={{
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '12px',
                  padding: '6px 8px',
                  marginBottom: '6px',
                  textAlign: 'center',
                  width: '100%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: '16px' }}>🥉</div>
                <div style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 900, color: '#9a3412', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {thirdPlace.name}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: thirdPlace.color, marginTop: '2px' }}>
                  🥇 {thirdPlace.medals?.gold || 0} 🥈 {thirdPlace.medals?.silver || 0} 🥉 {thirdPlace.medals?.bronze || 0}
                </div>
              </div>
              <div
                style={{
                  width: '100%',
                  height: 'clamp(70px, 14vw, 95px)',
                  background: `linear-gradient(180deg, ${thirdPlace.color} 0%, ${thirdPlace.color}cc 100%)`,
                  borderRadius: '14px 14px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: 'clamp(18px, 4vw, 24px)',
                  boxShadow: `0 4px 14px ${thirdPlace.color}40`,
                }}
              >
                3
              </div>
            </div>
          )}
        </div>

        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '14px' }}>
          💡 <em>Klik pada mana-mana rumah sukan untuk melihat pecahan pingat dan atlet penyumbang mata.</em>
        </p>
      </div>

      {/* Official Medal Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: 'clamp(18px, 3.5vw, 28px)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px',
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
              JADUAL RASMI
            </div>
            <h2 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: '#0f172a' }}>
              Pungutan Pingat & Mata Rumah
            </h2>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#047857',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            <Sparkles size={13} />
            <span>{totalAthletes} Atlet Berdaftar</span>
          </div>
        </div>

        <div className="responsive-table-wrap">
          <table style={{ width: '100%', minWidth: '580px', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                <th
                  style={{
                    padding: '12px 14px',
                    fontSize: '12px',
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
                    padding: '12px 14px',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#475569',
                    textAlign: 'left',
                  }}
                >
                  RUMAH SUKAN
                </th>
                <th style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 800, color: '#b45309' }}>
                  🥇 EMAS
                </th>
                <th style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 800, color: '#475569' }}>
                  🥈 PERAK
                </th>
                <th style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 800, color: '#b45309' }}>
                  🥉 GANGSA
                </th>
                <th style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 800, color: '#64748b' }}>
                  🏅 KE-4
                </th>
                <th
                  style={{
                    padding: '12px 14px',
                    fontSize: '13px',
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
              {sortedHouses.map((h, idx) => {
                const rankEmoji = idx === 0 ? '👑 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : '🏅 #4'
                const rankBg = idx === 0 ? '#fef3c7' : idx === 1 ? '#f1f5f9' : idx === 2 ? '#fff7ed' : '#f8fafc'
                const rankColor = idx === 0 ? '#92400e' : idx === 1 ? '#475569' : idx === 2 ? '#9a3412' : '#64748b'

                return (
                  <tr
                    key={h.id}
                    onClick={() => setSelectedHouse(h)}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '14px', textAlign: 'left' }}>
                      <span
                        style={{
                          background: rankBg,
                          color: rankColor,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 900,
                          display: 'inline-block',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {rankEmoji}
                      </span>
                    </td>

                    <td style={{ padding: '14px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: h.color,
                            display: 'inline-block',
                            flexShrink: 0,
                            boxShadow: `0 0 8px ${h.color}60`,
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '14px' }}>
                            Rumah {h.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                            {h.motto}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span
                        style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #fde68a',
                          padding: '3px 10px',
                          borderRadius: '8px',
                          fontWeight: 900,
                          fontSize: '14px',
                          display: 'inline-block',
                        }}
                      >
                        {h.medals?.gold || 0}
                      </span>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          padding: '3px 10px',
                          borderRadius: '8px',
                          fontWeight: 900,
                          fontSize: '14px',
                          display: 'inline-block',
                        }}
                      >
                        {h.medals?.silver || 0}
                      </span>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span
                        style={{
                          background: '#ffedd5',
                          color: '#9a3412',
                          border: '1px solid #fed7aa',
                          padding: '3px 10px',
                          borderRadius: '8px',
                          fontWeight: 900,
                          fontSize: '14px',
                          display: 'inline-block',
                        }}
                      >
                        {h.medals?.bronze || 0}
                      </span>
                    </td>

                    <td style={{ padding: '14px', color: '#64748b', fontWeight: 800, fontSize: '13px' }}>
                      {h.medals?.fourth || 0}
                    </td>

                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <span style={{ fontSize: '18px', fontWeight: 900, color: h.color }}>
                        {(h.medals?.gold || 0) + (h.medals?.silver || 0) + (h.medals?.bronze || 0)}{' '}
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>pingat</span>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* 4 Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px',
          }}
        >
          {sortedHouses.map((h) => (
            <div
              key={h.id}
              onClick={() => setSelectedHouse(h)}
              style={{
                background: h.lightBg,
                border: `1px solid ${h.color}35`,
                borderRadius: '16px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: h.color }}>
                  Rumah {h.name}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>
                  {(h.medals?.gold || 0) + (h.medals?.silver || 0) + (h.medals?.bronze || 0)} Pingat
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  fontWeight: 800,
                  background: '#ffffff',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  color: '#334155',
                }}
              >
                <span>🥇 {h.medals?.gold || 0}</span>
                <span>🥈 {h.medals?.silver || 0}</span>
                <span>🥉 {h.medals?.bronze || 0}</span>
                <span style={{ color: '#64748b' }}>🏅 {h.medals?.fourth || 0}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#64748b',
                  fontWeight: 700,
                }}
              >
                <span>{h.athletesCount} Atlet</span>
                <span style={{ color: h.color, display: 'inline-flex', alignItems: 'center', fontWeight: 800 }}>
                  Lihat Pingat <ChevronRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* House Achievements Breakdown Modal (Bottom Sheet on Mobile) */}
      {selectedHouse && (
        <div
          className="mobile-sheet-overlay"
          onClick={() => setSelectedHouse(null)}
        >
          <div
            className="mobile-sheet-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: selectedHouse.lightBg,
                borderBottom: `2px solid ${selectedHouse.color}30`,
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: selectedHouse.color,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
                    Rumah {selectedHouse.name}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                    {selectedHouse.motto} • {(selectedHouse.medals?.gold || 0) + (selectedHouse.medals?.silver || 0) + (selectedHouse.medals?.bronze || 0)} Jumlah Pingat
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedHouse(null)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Medal Summary Chips */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '4px',
                padding: '12px 16px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                flexShrink: 0,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#b45309', fontWeight: 800 }}>EMAS</div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>
                  🥇 {selectedHouse.medals?.gold || 0}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#475569', fontWeight: 800 }}>PERAK</div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>
                  🥈 {selectedHouse.medals?.silver || 0}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#b45309', fontWeight: 800 }}>GANGSA</div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>
                  🥉 {selectedHouse.medals?.bronze || 0}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800 }}>KE-4</div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>
                  🏅 {selectedHouse.medals?.fourth || 0}
                </div>
              </div>
            </div>

            {/* Modal Body - List of Achievements */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', flexGrow: 1, WebkitOverflowScrolling: 'touch' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '10px' }}>
                Pecahan Acara & Atlet Pemenang ({selectedHouseAchievements.length})
              </div>

              {selectedHouseAchievements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 0', color: '#94a3b8', fontSize: '13px' }}>
                  Belum ada rekod kemenangan pingat yang direkodkan untuk rumah ini.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedHouseAchievements.map((item, i) => {
                    const medalEmoji =
                      item.place === 1 ? '🥇 Emas' : item.place === 2 ? '🥈 Perak' : item.place === 3 ? '🥉 Gangsa' : '🏅 Ke-4'
                    const medalBg =
                      item.place === 1 ? '#fef3c7' : item.place === 2 ? '#f1f5f9' : item.place === 3 ? '#ffedd5' : '#f8fafc'
                    const medalColor =
                      item.place === 1 ? '#92400e' : item.place === 2 ? '#334155' : item.place === 3 ? '#9a3412' : '#64748b'

                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          gap: '10px',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                background: medalBg,
                                color: medalColor,
                                fontSize: '10px',
                                fontWeight: 900,
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              {medalEmoji}
                            </span>
                            <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                              {item.athleteName}
                            </strong>
                            {item.isRecordBroken && (
                              <span
                                style={{
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  fontSize: '9px',
                                  fontWeight: 800,
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                }}
                              >
                                🌟 REKOD
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                            {item.eventCode} • {item.eventName} ({item.category})
                            {item.recordValue && ` • Catatan: ${item.recordValue}`}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '12px 20px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setSelectedHouse(null)}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: '36px',
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
