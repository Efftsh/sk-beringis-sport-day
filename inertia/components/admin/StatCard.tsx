import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  trend?: {
    text: string
    isPositive?: boolean
  }
  badge?: string
  accentColor?: string
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  badge,
  accentColor = '#2563eb',
}: StatCardProps) {
  return (
    <div className="stat-card" style={{ borderTop: `3px solid ${accentColor}` }}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-icon" style={{ color: accentColor, backgroundColor: `${accentColor}14` }}>
          {icon}
        </div>
      </div>
      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        {badge && <span className="stat-card-badge">{badge}</span>}
      </div>
      {(subtitle || trend) && (
        <div className="stat-card-footer">
          {trend && (
            <span className={`stat-trend ${trend.isPositive ? 'trend-positive' : 'trend-neutral'}`}>
              {trend.text}
            </span>
          )}
          {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
