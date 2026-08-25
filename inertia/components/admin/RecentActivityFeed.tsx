import { Activity, UserCheck } from 'lucide-react'

export interface RecentActivityItem {
  id: string
  time: string
  eventCode: string
  eventName: string
  category: string
  winnerHouse: string
  winnerHouseColor: string
  firstPlace: string
  secondPlace: string
  thirdPlace: string
  pointsAwarded: string
  recorder: string
}

interface RecentActivityFeedProps {
  activities: RecentActivityItem[]
}

export default function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div>
          <div className="card-label">Aktiviti Terkini</div>
          <h2 className="card-title">Keputusan Disahkan</h2>
        </div>
        <div className="feed-badge">
          <Activity size={14} className="mr-1" /> Siaran Langsung
        </div>
      </div>

      <div className="activity-feed-list">
        {activities.map((act) => (
          <div key={act.id} className="activity-item">
            <div className="activity-timeline-indicator">
              <span
                className="activity-bullet"
                style={{ backgroundColor: act.winnerHouseColor }}
              />
              <span className="activity-line" />
            </div>

            <div className="activity-content">
              <div className="activity-header">
                <span className="activity-time">{act.time}</span>
                <span
                  className="activity-house-pill"
                  style={{
                    backgroundColor: `${act.winnerHouseColor}18`,
                    color: act.winnerHouseColor,
                    borderColor: `${act.winnerHouseColor}35`,
                  }}
                >
                  Rumah {act.winnerHouse} ({act.pointsAwarded})
                </span>
              </div>

              <div className="activity-event-name">
                <span className="activity-code">{act.eventCode}:</span> {act.eventName}
              </div>

              <div className="activity-results-summary">
                <span className="podium-line">🥇 {act.firstPlace}</span>
                <span className="podium-sub">🥈 {act.secondPlace} • 🥉 {act.thirdPlace}</span>
              </div>

              <div className="activity-recorder">
                <UserCheck size={12} className="recorder-icon" />
                <span>Disahkan oleh: {act.recorder}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
