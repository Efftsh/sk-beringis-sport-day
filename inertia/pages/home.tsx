import type { FC } from 'react'
import { useState, useMemo } from 'react'
import { Head } from '@inertiajs/react'
import { Trophy, Crown, BookOpen, Award, Menu, X, ChevronDown, Check, Compass, Camera } from 'lucide-react'
import LiveHeaderBanner from '../components/public/LiveHeaderBanner'
import PublicLeaderboardTab, {
  HouseItem,
  EventRecord,
} from '../components/public/PublicLeaderboardTab'
import PublicEventsResultsTab from '../components/public/PublicEventsResultsTab'
import PublicSpecialAwardsTab from '../components/public/PublicSpecialAwardsTab'
import PublicProgramBookTab from '../components/public/PublicProgramBookTab'
import PublicGalleryTab from '../components/public/PublicGalleryTab'
import ThemeToggle from '../components/theme_toggle'

export type HomeProps = Record<string, any> & {
  championshipInfo?: {
    title: string
    schoolName: string
    edition: string
    dates: string
    venue: string
    status: string
    eBookletUrl?: string
    photosUrl?: string
  }
  houses?: HouseItem[]
  eventsList?: EventRecord[]
  registeredAthletes?: Array<{
    id: string
    name: string
    class: string
    gender: string
    houseId: string
    bib: string
    events: string[]
  }>
  totalAthletes?: number
}

const defaultChampionship = {
  title: 'Kejohanan Sukan Tahunan Kali Sk Beringis Papar Ke-14',
  schoolName: 'SK Beringis, Papar',
  edition: '2026',
  dates: '26 - 28 Ogos 2026',
  venue: 'Padang SK Beringis',
  status: 'Sedang Berlangsung (Hari 1)',
  eBookletUrl: 'https://heyzine.com/flip-book/cbfede6cee.html',
  photosUrl: 'https://photos.app.goo.gl/ukTxVDzu1WZ4fiPcA',
}

export const Home: FC<HomeProps> = ({
  championshipInfo = defaultChampionship,
  houses = [],
  eventsList = [],
  registeredAthletes = [],
  totalAthletes = 0,
}) => {
  const [activeTab, setActiveTab] = useState<
    'leaderboard' | 'events' | 'awards' | 'booklet' | 'gallery'
  >('leaderboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Derived counts
  const completedEvents = useMemo(() => {
    return eventsList.filter((e) => e.status === 'completed')
  }, [eventsList])

  // Live updates ticker items from latest completed events
  const recentHighlights = useMemo(() => {
    return [...completedEvents]
      .reverse()
      .slice(0, 10)
      .map((ev) => {
        const winner = ev.results && ev.results[0] ? ev.results[0] : null
        const house = winner ? houses.find((h) => h.id === winner.houseId) : null
        const hasRecord = (ev.results || []).some((r) => r.isRecordBroken)

        return {
          text: winner
            ? `${ev.code} ${ev.eventName}: ${winner.athleteName} (Rumah ${house?.name || winner.houseId}) meraih Emas!`
            : `${ev.code} ${ev.eventName} telah selesai.`,
          houseColor: house?.color,
          isRecord: hasRecord,
        }
      })
  }, [completedEvents, houses])

  // Tab definitions
  const tabsList = [
    {
      id: 'leaderboard' as const,
      label: 'Kedudukan Rumah',
      shortLabel: 'Kedudukan',
      desc: 'Pungutan pingat & mata terkini rumah sukan',
      icon: Trophy,
      color: 'var(--forest-green)',
    },
    {
      id: 'events' as const,
      label: `Jadual & Keputusan (${eventsList.length})`,
      shortLabel: 'Keputusan',
      desc: 'Jadual harian, saringan, dan pemenang podium',
      icon: Award,
      color: '#0284c7',
    },
    {
      id: 'awards' as const,
      label: 'Anugerah Khas & Harapan',
      shortLabel: 'Anugerah Khas',
      desc: 'Anugerah Khas (Tahun 6) & Anugerah Harapan (Tahun 5)',
      icon: Crown,
      color: '#d97706',
    },
    {
      id: 'booklet' as const,
      label: 'E-Buku Program',
      shortLabel: 'E-Buku',
      desc: 'Buku aturcara dan cenderamata digital rasmi',
      icon: BookOpen,
      color: '#7c3aed',
    },
    {
      id: 'gallery' as const,
      label: 'Galeri Foto Kejohanan',
      shortLabel: 'Galeri Foto',
      desc: 'Album gambar & detik kejohanan di Google Photos',
      icon: Camera,
      color: '#ef4444',
    },
  ]

  const currentTab = tabsList.find((t) => t.id === activeTab) || tabsList[0]
  const CurrentIcon = currentTab.icon

  return (
    <>
      <Head title={`${championshipInfo.title} - ${championshipInfo.schoolName}`} />

      {/* Main Top Header Banner */}
      <LiveHeaderBanner
        championshipInfo={championshipInfo}
        totalAthletes={totalAthletes || registeredAthletes.length}
        totalEvents={eventsList.length}
        completedEvents={completedEvents.length}
        recentHighlights={recentHighlights}
        onOpenBooklet={() => setActiveTab('booklet')}
        onOpenGallery={() => setActiveTab('gallery')}
      />

      {/* Navigation Tab Bar (Desktop Tabs + Mobile Burger Drawer) */}
      <div className="public-tab-bar-container">
        {/* 1. Desktop & Tablet Horizontal Tab Bar */}
        <div className="public-desktop-tab-bar">
          {tabsList.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                className={`public-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* 2. Mobile Burger Switcher Trigger Card */}
        <div className="public-mobile-tab-trigger" onClick={() => setIsMobileMenuOpen(true)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: `${currentTab.color}18`,
                color: currentTab.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CurrentIcon size={18} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                MENU PAPARAN AKTIF:
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 900,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentTab.label}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 800,
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)',
            }}
          >
            <Menu size={14} />
            <span>Tukar</span>
            <ChevronDown size={12} />
          </div>
        </div>
      </div>

      {/* 3. Mobile Slide-Up Burger Menu Sheet */}
      {isMobileMenuOpen && (
        <div className="mobile-sheet-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="mobile-sheet-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '20px' }}
          >
            {/* Sheet Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '14px',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={18} style={{ color: 'var(--forest-green)' }} />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>
                    Pilih Menu Paparan
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Tekan mana-mana menu untuk bertukar paparan
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Menu Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tabsList.map((tab) => {
                const Icon = tab.icon
                const isSelected = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id)
                      setIsMobileMenuOpen(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '14px',
                      border: isSelected ? '2px solid var(--forest-green)' : '1px solid #e2e8f0',
                      background: isSelected ? 'rgba(45, 122, 95, 0.06)' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          backgroundColor: isSelected ? 'var(--forest-green)' : '#f8fafc',
                          color: isSelected ? '#ffffff' : tab.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: isSelected ? '0 4px 10px rgba(45, 122, 95, 0.25)' : 'none',
                        }}
                      >
                        <Icon size={20} />
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 900,
                            color: isSelected ? 'var(--forest-green)' : '#0f172a',
                          }}
                        >
                          {tab.label}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {tab.desc}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--forest-green)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Mobile Sheet Theme Toggle Section */}
            <div
              style={{
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  Tema Paparan
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Tukar mod cerah atau gelap</div>
              </div>
              <ThemeToggle variant="pill" />
            </div>
          </div>
        </div>
      )}

      {/* Tab Contents */}
      <div style={{ width: '100%' }}>
        {activeTab === 'leaderboard' && (
          <PublicLeaderboardTab houses={houses} events={eventsList} totalAthletes={totalAthletes} />
        )}

        {activeTab === 'events' && <PublicEventsResultsTab events={eventsList} houses={houses} />}

        {activeTab === 'awards' && (
          <PublicSpecialAwardsTab
            events={eventsList}
            houses={houses}
            registeredAthletes={registeredAthletes}
          />
        )}

        {activeTab === 'booklet' && <PublicProgramBookTab url={championshipInfo.eBookletUrl} />}

        {activeTab === 'gallery' && <PublicGalleryTab url={championshipInfo.photosUrl} />}
      </div>

      {/* Footer & Quick Links */}
      <footer
        style={{
          borderTop: '1px solid #cbd5e1',
          background: '#ffffff',
          padding: '24px 16px',
          marginTop: '40px',
        }}
      >
        <div
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/images/logo_sk_beringis.png"
              alt="Logo SK Beringis Papar"
              style={{ width: '32px', height: '32px', objectFit: 'contain', flexShrink: 0 }}
            />
            <span style={{ fontWeight: 900, fontSize: '15px', color: '#0f172a' }}>
              {championshipInfo.schoolName}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab('booklet')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#475569',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0,
              }}
            >
              📖 E-Buku Program
            </button>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <a
              href={championshipInfo.photosUrl || 'https://photos.app.goo.gl/ukTxVDzu1WZ4fiPcA'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#dc2626',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              📸 Album Foto Google Photos ↗
            </a>
          </div>

          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
            {championshipInfo.title} • {championshipInfo.edition} • {championshipInfo.dates}
          </p>
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
            Hak Cipta Terpelihara © 2026 Unit Kokurikulum & Sukan SK Beringis, Papar
          </p>
        </div>
      </footer>
    </>
  )
}

export default Home
