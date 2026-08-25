import { Trophy, Medal, TrendingUp } from 'lucide-react'

export interface HouseData {
  id: string
  name: string
  code: string
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
  trend: string
}

interface HouseLeaderboardCardProps {
  houses: HouseData[]
  totalPoints: number
}

export default function HouseLeaderboardCard({ houses, totalPoints }: HouseLeaderboardCardProps) {
  // Sort houses by rank
  const sortedHouses = [...houses].sort((a, b) => a.rank - b.rank)
  const maxPoints = Math.max(...houses.map((h) => h.points), 1)

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="rank-badge rank-1">
            <Trophy size={14} className="mr-1" /> #1 Juara Semasa
          </span>
        )
      case 2:
        return (
          <span className="rank-badge rank-2">
            <Medal size={14} className="mr-1" /> #2
          </span>
        )
      case 3:
        return (
          <span className="rank-badge rank-3">
            <Medal size={14} className="mr-1" /> #3
          </span>
        )
      default:
        return <span className="rank-badge rank-4">#{rank}</span>
    }
  }

  return (
    <div className="dashboard-card leaderboard-card">
      <div className="card-header">
        <div>
          <div className="card-label">Kedudukan Rasmi</div>
          <h2 className="card-title">Pungutan Mata & Pingat Rumah Sukan</h2>
        </div>
        <div className="live-pill">
          <span className="live-dot pulse"></span>
          <span>Kemas Kini Langsung</span>
        </div>
      </div>

      <div className="house-standings-list">
        {sortedHouses.map((house) => {
          const progressPercent = Math.round((house.points / maxPoints) * 100)

          return (
            <div
              key={house.id}
              className={`house-standings-row rank-${house.rank}`}
              style={{ borderLeft: `5px solid ${house.color}` }}
            >
              <div className="house-info-col">
                <div className="house-header-line">
                  <div className="house-name-wrap">
                    <span className="house-color-indicator" style={{ backgroundColor: house.color }} />
                    <span className="house-name">{house.name}</span>
                    <span className="house-code">({house.code})</span>
                  </div>
                  {getRankBadge(house.rank)}
                </div>
                <div className="house-motto">{house.motto}</div>

                {/* Progress bar */}
                <div className="house-progress-track">
                  <div
                    className="house-progress-bar"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: house.color,
                    }}
                  />
                </div>
                <div className="house-footer-meta">
                  <span className="house-athletes-count">{house.athletesCount} Atlet Berdaftar</span>
                  <span className="house-trend">
                    <TrendingUp size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {house.trend}
                  </span>
                </div>
              </div>

              {/* Medals and Points */}
              <div className="house-stats-col">
                <div className="medal-chips-group">
                  <div className="medal-chip gold" title="Pingat Emas">
                    <span className="medal-icon">🥇</span>
                    <span className="medal-count">{house.medals.gold}</span>
                    <span className="medal-text">Emas</span>
                  </div>
                  <div className="medal-chip silver" title="Pingat Perak">
                    <span className="medal-icon">🥈</span>
                    <span className="medal-count">{house.medals.silver}</span>
                    <span className="medal-text">Perak</span>
                  </div>
                  <div className="medal-chip bronze" title="Pingat Gangsa">
                    <span className="medal-icon">🥉</span>
                    <span className="medal-count">{house.medals.bronze}</span>
                    <span className="medal-text">Gangsa</span>
                  </div>
                </div>

                <div className="house-total-points-box" style={{ borderColor: `${house.color}40` }}>
                  <div className="points-label">Mata</div>
                  <div className="points-value" style={{ color: house.color }}>
                    {house.points}
                  </div>
                  <div className="points-share">
                    {totalPoints > 0 ? Math.round((house.points / totalPoints) * 100) : 0}% jumlah
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
