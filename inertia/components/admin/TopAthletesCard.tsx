import { Trophy, Star, Sparkles } from 'lucide-react'

export interface AthleteRecord {
  name: string
  class: string
  house: string
  houseColor: string
  points: number
  medals: { gold: number; silver: number; bronze: number }
  highlights: string
}

interface TopAthletesCardProps {
  topAthletes: {
    olahragawan: AthleteRecord
    olahragawati: AthleteRecord
  }
}

export default function TopAthletesCard({ topAthletes }: TopAthletesCardProps) {
  const { olahragawan, olahragawati } = topAthletes

  return (
    <div className="dashboard-card athletes-spotlight-card">
      <div className="card-header">
        <div>
          <div className="card-label">Anugerah Khas</div>
          <h2 className="card-title">Calon Olahragawan & Olahragawati</h2>
        </div>
        <span className="spotlight-badge">
          <Sparkles size={13} className="mr-1" /> Prestasi Terbaik
        </span>
      </div>

      <div className="athletes-grid">
        {/* Olahragawan */}
        <div className="athlete-card male-athlete">
          <div className="athlete-title-tag">
            <Trophy size={14} className="tag-icon" /> Calon Olahragawan
          </div>
          <div className="athlete-name">{olahragawan.name}</div>
          <div className="athlete-class-house">
            <span>{olahragawan.class}</span> •{' '}
            <span
              className="athlete-house-tag"
              style={{ color: olahragawan.houseColor, fontWeight: 600 }}
            >
              Rumah {olahragawan.house}
            </span>
          </div>

          <div className="athlete-stats-row">
            <div className="athlete-stat-box">
              <span className="stat-label">Jumlah Pingat</span>
              <span className="stat-number">{olahragawan.medals.gold + olahragawan.medals.silver + olahragawan.medals.bronze} Pingat</span>
            </div>
            <div className="athlete-medals-box">
              <span>🥇 {olahragawan.medals.gold}</span>
              <span>🥈 {olahragawan.medals.silver}</span>
              <span>🥉 {olahragawan.medals.bronze}</span>
            </div>
          </div>

          <div className="athlete-highlights">
            <Star size={12} className="star-icon" />
            <span>{olahragawan.highlights}</span>
          </div>
        </div>

        {/* Olahragawati */}
        <div className="athlete-card female-athlete">
          <div className="athlete-title-tag tag-pink">
            <Trophy size={14} className="tag-icon" /> Calon Olahragawati
          </div>
          <div className="athlete-name">{olahragawati.name}</div>
          <div className="athlete-class-house">
            <span>{olahragawati.class}</span> •{' '}
            <span
              className="athlete-house-tag"
              style={{ color: olahragawati.houseColor, fontWeight: 600 }}
            >
              Rumah {olahragawati.house}
            </span>
          </div>

          <div className="athlete-stats-row">
            <div className="athlete-stat-box">
              <span className="stat-label">Jumlah Pingat</span>
              <span className="stat-number">{olahragawati.medals.gold + olahragawati.medals.silver + olahragawati.medals.bronze} Pingat</span>
            </div>
            <div className="athlete-medals-box">
              <span>🥇 {olahragawati.medals.gold}</span>
              <span>🥈 {olahragawati.medals.silver}</span>
              <span>🥉 {olahragawati.medals.bronze}</span>
            </div>
          </div>

          <div className="athlete-highlights">
            <Star size={12} className="star-icon" />
            <span>{olahragawati.highlights}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
