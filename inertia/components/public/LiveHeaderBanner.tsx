import React from 'react'
import { Trophy, BookOpen, RefreshCw, Radio, Sparkles, MapPin, Calendar } from 'lucide-react'
import { router } from '@inertiajs/react'

interface LiveHeaderBannerProps {
  championshipInfo: {
    title: string
    schoolName: string
    edition: string
    dates: string
    venue: string
    status: string
    eBookletUrl?: string
  }
  totalAthletes: number
  totalEvents: number
  completedEvents: number
  recentHighlights: Array<{
    text: string
    houseColor?: string
    isRecord?: boolean
  }>
  onOpenBooklet?: () => void
}

export default function LiveHeaderBanner({
  championshipInfo,
  totalAthletes,
  totalEvents,
  completedEvents,
  recentHighlights,
  onOpenBooklet,
}: LiveHeaderBannerProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState('')

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('ms-MY', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.reload({
      onFinish: () => {
        setTimeout(() => setIsRefreshing(false), 500)
      },
    })
  }

  const completionPct = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto 16px', padding: '0 12px', width: '100%', boxSizing: 'border-box' }}>
      {/* Top Pulse Badge Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '10px',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.3px',
            }}
          >
            <Radio size={11} className="animate-pulse" style={{ color: '#ef4444' }} />
            <span>KEMAS KINI MASA NYATA</span>
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#047857',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '10px',
              fontWeight: 700,
            }}
          >
            <Sparkles size={11} />
            <span>{totalAthletes} Atlet • 4 Rumah</span>
          </span>
        </div>

        {/* Live Refresh and Time Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
            <strong style={{ color: '#0f172a' }}>{currentTime || 'Live'}</strong>
          </span>
          <button
            onClick={handleRefresh}
            title="Muat semula keputusan terkini"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease',
              minHeight: '28px',
            }}
          >
            <RefreshCw
              size={11}
              style={{
                transform: isRefreshing ? 'rotate(360deg)' : 'none',
                transition: 'transform 0.5s ease',
                color: 'var(--forest-green)',
              }}
            />
            <span>{isRefreshing ? 'Memuat...' : 'Segar Semula'}</span>
          </button>
        </div>
      </div>

      {/* Hero Banner Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '18px',
          padding: 'clamp(16px, 3.5vw, 24px)',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Background decorative sport watermark */}
        <div
          style={{
            position: 'absolute',
            right: '-20px',
            bottom: '-25px',
            opacity: 0.05,
            pointerEvents: 'none',
            color: '#ffffff',
          }}
        >
          <Trophy size={220} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(255, 255, 255, 0.12)', padding: '2px 8px 2px 4px', borderRadius: '6px' }}>
              <img
                src="/images/logo_sk_beringis.png"
                alt="SK Beringis"
                style={{ width: '16px', height: '16px', objectFit: 'contain' }}
              />
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#ffffff' }}>SK BERINGIS</span>
            </div>
            <span
              style={{
                backgroundColor: 'rgba(251, 191, 36, 0.2)',
                color: '#fbbf24',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {championshipInfo.edition}
            </span>
            <span
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 800,
              }}
            >
              {championshipInfo.status}
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(17px, 4.2vw, 26px)',
              fontWeight: 900,
              lineHeight: 1.3,
              marginBottom: '10px',
              color: '#ffffff',
              letterSpacing: '-0.3px',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {championshipInfo.title}
          </h1>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px 14px',
              alignItems: 'center',
              fontSize: '11px',
              color: '#94a3b8',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} style={{ color: '#38bdf8' }} />
              <span>{championshipInfo.dates}</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} style={{ color: '#f87171' }} />
              <span>{championshipInfo.venue}</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Trophy size={12} style={{ color: '#fbbf24' }} />
              <span>
                {completedEvents} / {totalEvents} Acara ({completionPct}%)
              </span>
            </div>
          </div>

          {/* Quick Action Button for Flipbook / E-Buku Program */}
          {championshipInfo.eBookletUrl && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px', width: '100%' }}>
              <button
                type="button"
                onClick={onOpenBooklet}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: '#f59e0b',
                  color: '#0f172a',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
                  transition: 'transform 0.15s ease',
                  minHeight: '38px',
                  width: '100%',
                  maxWidth: '320px',
                  boxSizing: 'border-box',
                }}
              >
                <BookOpen size={15} />
                <span>Buka E-Buku Program (Flipbook)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Breaking Highlights Ticker (Fixed Flex Overflow) */}
      {recentHighlights && recentHighlights.length > 0 && (
        <div
          style={{
            marginTop: '10px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            overflow: 'hidden',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* TERKINI Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: 900,
              flexShrink: 0,
              zIndex: 2,
            }}
          >
            <Sparkles size={11} style={{ color: '#f59e0b' }} />
            <span>TERKINI</span>
          </div>

          {/* Marquee Scrolling Text Area */}
          <div
            className="ticker-track"
            style={{
              flex: '1 1 0%',
              minWidth: 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0%); }
                100% { transform: translateX(-50%); }
              }
              .marquee-content {
                display: inline-flex;
                align-items: center;
                animation: marquee 35s linear infinite;
                will-change: transform;
              }
              .marquee-content:hover {
                animation-play-state: paused;
              }
            `}</style>

            <div className="marquee-content">
              {/* First Sequence */}
              {recentHighlights.map((h, i) => (
                <span
                  key={`seq1-${i}`}
                  style={{
                    fontSize: '12px',
                    color: '#1e293b',
                    fontWeight: 700,
                    marginRight: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: '12px' }}>{h.isRecord ? '🌟' : '🏁'}</span>
                  <span>{h.text}</span>
                  <span style={{ color: '#cbd5e1', marginLeft: '10px' }}>•</span>
                </span>
              ))}

              {/* Duplicate Sequence for seamless continuous loop */}
              {recentHighlights.map((h, i) => (
                <span
                  key={`seq2-${i}`}
                  style={{
                    fontSize: '12px',
                    color: '#1e293b',
                    fontWeight: 700,
                    marginRight: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: '12px' }}>{h.isRecord ? '🌟' : '🏁'}</span>
                  <span>{h.text}</span>
                  <span style={{ color: '#cbd5e1', marginLeft: '10px' }}>•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

