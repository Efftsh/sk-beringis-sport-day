import { useState } from 'react'
import { BookOpen, ExternalLink, Maximize2, Minimize2, Sparkles } from 'lucide-react'

interface PublicProgramBookTabProps {
  url?: string
}

export default function PublicProgramBookTab({
  url = 'https://heyzine.com/flip-book/cbfede6cee.html',
}: PublicProgramBookTabProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto 30px', padding: '0 16px' }}>
      {/* Header Info */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: 'clamp(16px, 3.5vw, 24px)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
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
            <Sparkles size={13} />
            <span>DOKUMEN RASMI KEJOHANAN</span>
          </div>
          <h2 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, color: '#0f172a' }}>
            E-Buku Program Digital
          </h2>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Buku aturcara dan cenderamata digital rasmi Kejohanan Olahraga & Sukaneka SK Beringis.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={toggleFullscreen}
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              minHeight: '38px',
            }}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span>{isFullscreen ? 'Kecilkan' : 'Skrin Penuh'}</span>
          </button>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--forest-green)',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(45, 122, 95, 0.25)',
              transition: 'transform 0.15s ease',
              minHeight: '38px',
            }}
          >
            <ExternalLink size={14} />
            <span>Buka Tab Baharu</span>
          </a>
        </div>
      </div>

      {/* Embedded Heyzine Flipbook Container */}
      <div
        style={{
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          right: isFullscreen ? 0 : 'auto',
          bottom: isFullscreen ? 0 : 'auto',
          zIndex: isFullscreen ? 99999 : 1,
          width: '100%',
          height: isFullscreen ? '100vh' : 'clamp(460px, 75vh, 720px)',
          background: '#0f172a',
          borderRadius: isFullscreen ? '0' : '16px',
          overflow: 'hidden',
          boxShadow: isFullscreen ? 'none' : '0 12px 36px rgba(0,0,0,0.12)',
          border: isFullscreen ? 'none' : '1px solid #334155',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isFullscreen && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 16px',
              background: '#1e293b',
              borderBottom: '1px solid #334155',
              color: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '13px' }}>
              <BookOpen size={16} style={{ color: '#fbbf24' }} />
              <span>E-Buku Program SK Beringis</span>
            </div>
            <button
              onClick={toggleFullscreen}
              style={{
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              Tutup Skrin Penuh
            </button>
          </div>
        )}

        <iframe
          src={url}
          title="E-Buku Program Kejohanan SK Beringis"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            flexGrow: 1,
          }}
          allow="fullscreen; clipboard-write"
        />
      </div>

      <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
        💡 <em>Petua: Leret skrin atau klik penjuru buku untuk menyelak halaman berikutnya.</em>
      </p>
    </div>
  )
}
