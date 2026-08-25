import type { FC } from 'react'
import type { EventRecord, HouseItem } from './EventResultsTab'
import type { AthleteRegistrationItem } from './AthleteRegistrationTab'

export interface DashboardOverviewTabProps {
  events: EventRecord[]
  houses: HouseItem[]
  athletes: AthleteRegistrationItem[]
  computedHouses: Array<HouseItem & { points: number; medals: { gold: number; silver: number; bronze: number } }>
  sortedHouses: Array<HouseItem & { points: number; medals: { gold: number; silver: number; bronze: number } }>
  totalPoints: number
  completedCount: number
  topOlahragawan: {
    name: string
    houseName: string
    houseColor: string
    gold: number
  } | null
  topOlahragawati: {
    name: string
    houseName: string
    houseColor: string
    gold: number
  } | null
  topHarapanLelaki?: {
    name: string
    houseName: string
    houseColor: string
    gold: number
  } | null
  topHarapanPerempuan?: {
    name: string
    houseName: string
    houseColor: string
    gold: number
  } | null
}

const DashboardOverviewTab: FC<DashboardOverviewTabProps> = ({
  events,
  athletes,
  computedHouses,
  sortedHouses,
  totalPoints,
  completedCount,
  topOlahragawan,
  topOlahragawati,
  topHarapanLelaki,
  topHarapanPerempuan,
}) => {
  return (
    <div className="dashboard-overview-workspace">
      {/* Left Area: Analytics charts and Circular progress */}
      <div className="overview-left-section">
        {/* Standings Chart Card */}
        <div className="overview-card analytics-chart-card">
          <div className="card-top-row">
            <div>
              <span className="card-label-small">Kedudukan Rumah Sukan</span>
              <h3 className="card-title-main">Pungutan Mata Masa Nyata</h3>
            </div>
            <div className="chart-time-badge">
              <span>{events.length} Acara</span>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="standings-bar-chart-container">
            <div className="chart-y-axis">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>

            <div className="chart-bars-row">
              {/* Trend line overlay */}
              <div className="chart-trend-line-overlay" />

              {sortedHouses.map((h) => {
                const maxPoints = Math.max(...computedHouses.map((x) => x.points), 10)
                const pctHeight = Math.round((h.points / maxPoints) * 75) // cap at 75% for aesthetics

                return (
                  <div key={h.id} className="chart-bar-col">
                    <div className="bar-wrapper">
                      <div
                        className="bar-fill-indicator"
                        style={{
                          height: `${pctHeight}%`,
                          backgroundColor: h.color,
                          boxShadow: `0 4px 10px ${h.color}35`,
                        }}
                      >
                        <span className="bar-tooltip-val">{h.points} pt</span>
                      </div>
                    </div>
                    <span className="bar-label-text">{h.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Medal Tally Leaderboard Table & Cards */}
        <div
          className="overview-card medal-tally-main-card"
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
          }}
        >
          <div className="card-top-row" style={{ marginBottom: '18px' }}>
            <div>
              <span className="card-label-small">Jadual Rasmi Kejohanan</span>
              <h3 className="card-title-main" style={{ fontSize: '20px', fontWeight: 900 }}>
                Pungutan Pingat & Kedudukan Rumah Sukan
              </h3>
            </div>
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🔴 🔵 🟡 🟢 4 Rumah Sukan</span>
            </div>
          </div>

          {/* Medal Table */}
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                  <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 800, color: '#475569', textAlign: 'left', borderRadius: '8px 0 0 8px' }}>
                    KEDUDUKAN
                  </th>
                  <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 800, color: '#475569', textAlign: 'left' }}>
                    RUMAH SUKAN
                  </th>
                  <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 800, color: '#b45309' }}>
                    🥇 EMAS
                  </th>
                  <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>
                    🥈 PERAK
                  </th>
                  <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 800, color: '#b45309' }}>
                    🥉 GANGSA
                  </th>
                  <th style={{ padding: '12px 12px', fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                    JUMLAH PINGAT
                  </th>
                  <th style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 900, color: 'var(--forest-green)', textAlign: 'right', borderRadius: '0 8px 8px 0' }}>
                    JUMLAH MATA
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedHouses.map((h, idx) => {
                  const totalMedals =
                    (h.medals?.gold || 0) +
                    (h.medals?.silver || 0) +
                    (h.medals?.bronze || 0)

                  const rankEmoji = idx === 0 ? '👑 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : '🏅 #4'
                  const rankBg = idx === 0 ? '#fef3c7' : idx === 1 ? '#f1f5f9' : idx === 2 ? '#fff7ed' : '#f8fafc'
                  const rankColor = idx === 0 ? '#92400e' : idx === 1 ? '#475569' : idx === 2 ? '#9a3412' : '#64748b'

                  return (
                    <tr
                      key={h.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Rank */}
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
                          }}
                        >
                          {rankEmoji}
                        </span>
                      </td>

                      {/* House Name & Bar */}
                      <td style={{ padding: '14px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                            <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '15px' }}>
                              Rumah {h.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                              {athletes.filter((a) => a.houseId === h.id).length} Atlet Berdaftar
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Emas */}
                      <td style={{ padding: '14px' }}>
                        <span
                          style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            border: '1px solid #fde68a',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            fontWeight: 900,
                            fontSize: '14px',
                            display: 'inline-block',
                            minWidth: '36px',
                          }}
                        >
                          {h.medals?.gold || 0}
                        </span>
                      </td>

                      {/* Perak */}
                      <td style={{ padding: '14px' }}>
                        <span
                          style={{
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            fontWeight: 900,
                            fontSize: '14px',
                            display: 'inline-block',
                            minWidth: '36px',
                          }}
                        >
                          {h.medals?.silver || 0}
                        </span>
                      </td>

                      {/* Gangsa */}
                      <td style={{ padding: '14px' }}>
                        <span
                          style={{
                            background: '#ffedd5',
                            color: '#9a3412',
                            border: '1px solid #fed7aa',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            fontWeight: 900,
                            fontSize: '14px',
                            display: 'inline-block',
                            minWidth: '36px',
                          }}
                        >
                          {h.medals?.bronze || 0}
                        </span>
                      </td>

                      {/* Total Medals */}
                      <td style={{ padding: '14px' }}>
                        <span
                          style={{
                            fontWeight: 900,
                            color: '#0f172a',
                            fontSize: '15px',
                          }}
                        >
                          {totalMedals}
                        </span>
                      </td>

                      {/* Total Points */}
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <span
                          style={{
                            fontSize: '18px',
                            fontWeight: 900,
                            color: h.color,
                          }}
                        >
                          {h.points}{' '}
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>pts</span>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Quick House Medal Cards Grid (4 columns) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '16px',
            }}
          >
            {sortedHouses.map((h) => {
              const lightBg =
                h.id === 'merah'
                  ? '#fef2f2'
                  : h.id === 'biru'
                    ? '#eff6ff'
                    : h.id === 'kuning'
                      ? '#fffbeb'
                      : '#f0fdf4'
              const borderClr =
                h.id === 'merah'
                  ? '#fca5a5'
                  : h.id === 'biru'
                    ? '#bfdbfe'
                    : h.id === 'kuning'
                      ? '#fde68a'
                      : '#bbf7d0'

              return (
                <div
                  key={h.id}
                  style={{
                    background: lightBg,
                    border: `1px solid ${borderClr}`,
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 900, color: h.color }}>
                      Rumah {h.name}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>
                      {h.points} pts
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '11px', fontWeight: 800, color: '#334155', background: '#ffffff', padding: '6px 8px', borderRadius: '8px' }}>
                    <span>🥇 {h.medals?.gold || 0}</span>
                    <span>🥈 {h.medals?.silver || 0}</span>
                    <span>🥉 {h.medals?.bronze || 0}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Metrics Summary Card */}
        <div className="overview-card metrics-summary-card">
          <div className="metric-box-row">
            <div className="metric-item-block">
              <span className="metric-label">Jumlah Acara Sukan</span>
              <div className="metric-val">{events.length}</div>
              <span className="metric-trend-val text-green">100% Rasmi</span>
            </div>
            <div className="metric-item-block">
              <span className="metric-label">Acara Selesai</span>
              <div className="metric-val">{completedCount}</div>
              <span className="metric-trend-val text-green">
                {events.length > 0 ? Math.round((completedCount / events.length) * 100) : 0}% Kemajuan
              </span>
            </div>
            <div className="metric-item-block">
              <span className="metric-label">Jumlah Mata Diperuntuk</span>
              <div className="metric-val">{totalPoints} pts</div>
              <span className="metric-trend-val text-green">Semua Rumah</span>
            </div>
            <div className="metric-item-block">
              <span className="metric-label">Atlet Berdaftar</span>
              <div className="metric-val">{athletes.length}</div>
              <span className="metric-trend-val text-purple">Roster Terbuka</span>
            </div>
          </div>
        </div>

        {/* Circular progress indicators on bottom row (Tahap 1, 2, Pra) */}
        <div className="circular-progress-row">
          {/* Dial 1: Tahap 1 */}
          <div className="circle-progress-card">
            <div className="circle-wrap">
              <svg className="circle-svg" viewBox="0 0 36 36">
                <path className="circle-bg-track" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="circle-fill-progress" strokeDasharray="75, 100" stroke="#f59e0b" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="circle-percentage-text" style={{ color: '#d97706' }}>75%</div>
            </div>
            <div className="circle-label-info">
              <strong>Tahap 1 (T1-T3)</strong>
              <span>Sukaneka & Balapan</span>
            </div>
          </div>

          {/* Dial 2: Tahap 2 */}
          <div className="circle-progress-card">
            <div className="circle-wrap">
              <svg className="circle-svg" viewBox="0 0 36 36">
                <path className="circle-bg-track" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="circle-fill-progress" strokeDasharray="50, 100" stroke="#8b5cf6" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="circle-percentage-text" style={{ color: '#7c3aed' }}>50%</div>
            </div>
            <div className="circle-label-info">
              <strong>Tahap 2 (T4-T6)</strong>
              <span>Balapan & Padang</span>
            </div>
          </div>

          {/* Dial 3: Prasekolah */}
          <div className="circle-progress-card">
            <div className="circle-wrap">
              <svg className="circle-svg" viewBox="0 0 36 36">
                <path className="circle-bg-track" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="circle-fill-progress" strokeDasharray="100, 100" stroke="#10b981" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="circle-percentage-text" style={{ color: '#059669' }}>100%</div>
            </div>
            <div className="circle-label-info">
              <strong>Prasekolah</strong>
              <span>Acara Sukaneka Cilik</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Area: Spotlight and Activity feed */}
      <div className="overview-right-section">
        {/* Spotlight cards */}
        <div className="overview-card right-mini-spotlight-card">
          <span className="card-label-small">Spotlight Peneraju</span>
          <h4 className="spotlight-title">Anugerah Khas & Harapan</h4>

          <div className="spotlight-winners-row">
            {topOlahragawan && (
              <div className="spotlight-winner-box boy">
                <div className="winner-label">👑 Olahragawan (Tahun 6)</div>
                <div className="winner-name-bold">{topOlahragawan.name}</div>
                <div className="winner-house-chip" style={{ color: topOlahragawan.houseColor }}>
                  Rumah {topOlahragawan.houseName} • {topOlahragawan.gold} Emas
                </div>
              </div>
            )}

            {topOlahragawati && (
              <div className="spotlight-winner-box girl" style={{ marginTop: '10px' }}>
                <div className="winner-label text-pink">👑 Olahragawati (Tahun 6)</div>
                <div className="winner-name-bold">{topOlahragawati.name}</div>
                <div className="winner-house-chip" style={{ color: topOlahragawati.houseColor }}>
                  Rumah {topOlahragawati.houseName} • {topOlahragawati.gold} Emas
                </div>
              </div>
            )}

            {topHarapanLelaki && (
              <div className="spotlight-winner-box boy" style={{ marginTop: '10px', background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                <div className="winner-label" style={{ color: '#047857' }}>⭐ Harapan Lelaki (Tahun 5)</div>
                <div className="winner-name-bold" style={{ color: '#065f46' }}>{topHarapanLelaki.name}</div>
                <div className="winner-house-chip" style={{ color: topHarapanLelaki.houseColor }}>
                  Rumah {topHarapanLelaki.houseName} • {topHarapanLelaki.gold} Emas
                </div>
              </div>
            )}

            {topHarapanPerempuan && (
              <div className="spotlight-winner-box girl" style={{ marginTop: '10px', background: '#fff7ed', borderColor: '#fed7aa' }}>
                <div className="winner-label" style={{ color: '#c2410c' }}>⭐ Harapan Perempuan (Tahun 5)</div>
                <div className="winner-name-bold" style={{ color: '#9a3412' }}>{topHarapanPerempuan.name}</div>
                <div className="winner-house-chip" style={{ color: topHarapanPerempuan.houseColor }}>
                  Rumah {topHarapanPerempuan.houseName} • {topHarapanPerempuan.gold} Emas
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity list */}
        <div className="overview-card right-activity-list-card">
          <span className="card-label-small">Aktiviti Terkini</span>
          <h4 className="spotlight-title">Keputusan Disahkan</h4>

          <div className="mini-activity-list">
            {events
              .filter((e) => e.status === 'completed')
              .slice(0, 4)
              .map((ev) => (
                <div key={ev.id} className="mini-activity-item">
                  <div className="activity-item-top">
                    <span className="activity-code">{ev.code}</span>
                    <span className="activity-time">{ev.scheduledTime}</span>
                  </div>
                  <div className="activity-title-text">{ev.eventName} ({ev.category})</div>
                  {ev.results && ev.results[0] && (
                    <div className="activity-winner-line">
                      🥇 Pemenang: <strong>{ev.results[0].athleteName}</strong> ({ev.results[0].recordValue})
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverviewTab
