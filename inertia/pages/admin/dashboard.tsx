import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import {
  Trophy,
  ExternalLink,
  Award,
  ClipboardList,
  UserCheck,
  CheckCircle2,
  LayoutDashboard,
  Search,
  LogOut,
} from 'lucide-react'

import EventResultsTab, {
  EventRecord,
  EventResultEntry,
  HouseItem,
  isGroupEvent,
} from '../../components/admin/EventResultsTab'
import SpecialAwardsTab, { extractCohortYear } from '../../components/admin/SpecialAwardsTab'
import AthleteRegistrationTab, {
  AthleteRegistrationItem,
} from '../../components/admin/AthleteRegistrationTab'
import DashboardOverviewTab from '../../components/admin/DashboardOverviewTab'

export type DashboardProps = Record<string, any> & {
  championshipInfo: {
    title: string
    schoolName: string
    edition: string
    dates: string
    venue: string
    status: string
  }
  houses: HouseItem[]
  eventsList: EventRecord[]
  registeredAthletes: AthleteRegistrationItem[]
}

const AdminDashboard: FC<DashboardProps> & { layout?: (page: any) => any } = ({
  championshipInfo = {
    title: 'Kejohanan Olahraga & Sukaneka Tahunan',
    schoolName: 'SK Beringis, Papar',
    edition: 'Kali Ke-27 (2026)',
    dates: '26 - 28 Ogos 2026',
    venue: 'Padang SK Beringis',
    status: 'Sedang Berlangsung',
  },
  houses: initialHouses = [],
  eventsList: initialEvents = [],
  registeredAthletes: initialAthletes = [],
}) => {
  // Tabs matching the sidebar navigation: 'dashboard' | 'results' | 'awards' | 'registration'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'results' | 'awards' | 'registration'>('dashboard')

  const [events, setEvents] = useState<EventRecord[]>(initialEvents || [])
  const [athletes, setAthletes] = useState<AthleteRegistrationItem[]>(initialAthletes || [])
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setEvents(initialEvents || [])
  }, [initialEvents])

  useEffect(() => {
    setAthletes(initialAthletes || [])
  }, [initialAthletes])

  // Compute live house standings from all completed events (Top 3: Emas, Perak, Gangsa)
  const computedHouses = (initialHouses || []).map((h) => {
    let pts = 0
    let gold = 0
    let silver = 0
    let bronze = 0

    events.forEach((ev) => {
      if (ev.status === 'completed' && ev.stage !== 'Saringan' && ev.results) {
        ev.results.forEach((res) => {
          if (res.houseId === h.id) {
            pts += res.points || 0
            if (res.place === 1) gold += 1
            else if (res.place === 2) silver += 1
            else if (res.place === 3) bronze += 1
          }
        })
      }
    })

    return {
      ...h,
      points: pts,
      medals: { gold, silver, bronze },
    }
  })

  const sortedHouses = [...computedHouses].sort(
    (a, b) =>
      (b.medals?.gold || 0) - (a.medals?.gold || 0) ||
      (b.medals?.silver || 0) - (a.medals?.silver || 0) ||
      (b.medals?.bronze || 0) - (a.medals?.bronze || 0) ||
      b.points - a.points
  )
  const totalPoints = sortedHouses.reduce((acc, h) => acc + h.points, 0)
  const completedCount = events.filter((e) => e.status === 'completed').length

  const handleSaveResult = (eventId: string, updatedResults: EventResultEntry[]) => {
    // Optimistic UI update
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          return {
            ...ev,
            status: 'completed',
            results: updatedResults,
          }
        }
        return ev
      })
    )

    // Persistent backend mutation in Database
    router.post(
      `/admin/events/${eventId}/results`,
      { results: updatedResults } as any,
      {
        preserveScroll: true,
        onSuccess: () => {
          const targetEvent = events.find((e) => e.id === eventId)
          const eventLabel = targetEvent ? `${targetEvent.eventName} (${targetEvent.category})` : 'Acara'
          setToastMessage(`✅ Keputusan "${eventLabel}" berjaya disimpan dalam pangkalan data & mata dikemas kini!`)
          setTimeout(() => setToastMessage(null), 4000)
        },
      }
    )
  }

  const handleAddAthlete = (newAthlete: Omit<AthleteRegistrationItem, 'id'>) => {
    router.post(
      '/admin/athletes',
      newAthlete,
      {
        preserveScroll: true,
        onSuccess: () => {
          setToastMessage(`🎉 Atlet "${newAthlete.name}" berjaya didaftarkan ke Rumah ${newAthlete.houseId.toUpperCase()}!`)
          setTimeout(() => setToastMessage(null), 4000)
        },
      }
    )
  }

  const handleDeleteAthlete = (athleteId: string) => {
    router.delete(
      `/admin/athletes/${athleteId}`,
      {
        preserveScroll: true,
        onSuccess: () => {
          setToastMessage(`🗑️ Rekod atlet telah dipadamkan daripada pangkalan data.`)
          setTimeout(() => setToastMessage(null), 3000)
        },
      }
    )
  }

  // Best athlete contenders for Dashboard overview spotlight
  const allAthletesForSpotlight = Array.from(
    events
      .filter((ev) => !isGroupEvent(ev.eventName) && ev.status === 'completed' && ev.stage !== 'Saringan')
      .reduce((map, ev) => {
        const detectedYear = extractCohortYear(ev.category, ev.eventName)

        ev.results?.forEach((res) => {
          if (!res.athleteName || res.athleteName.trim() === '') return
          const name = res.athleteName.trim()
          if (name.toLowerCase().startsWith('rumah ') || name.toLowerCase().startsWith('kuadren ')) return
          if (!map.has(name)) {
            const h = computedHouses.find((x) => x.id === res.houseId)
            map.set(name, {
              name,
              houseName: h ? h.name : res.houseId,
              houseColor: h ? h.color : '#2563eb',
              gender: ev.category.toLowerCase().includes('perempuan') ? 'Perempuan' : 'Lelaki',
              year: detectedYear,
              gold: 0,
              silver: 0,
              bronze: 0,
              points: 0,
            })
          }
          const ath = map.get(name)!
          if (ath.year === 'other' && detectedYear !== 'other') {
            ath.year = detectedYear
          }
          if (res.place === 1) ath.gold += 1
          else if (res.place === 2) ath.silver += 1
          else if (res.place === 3) ath.bronze += 1
          ath.points += res.points || 0
        })
        return map
      }, new Map<string, any>())
      .values()
  )

  const sortSpotlight = (a: any, b: any) =>
    b.gold - a.gold ||
    b.silver - a.silver ||
    b.bronze - a.bronze ||
    b.points - a.points

  // 1. Anugerah Khas (Tahun 6)
  const topOlahragawan =
    allAthletesForSpotlight
      .filter((a) => a.gender === 'Lelaki' && a.year === '6')
      .sort(sortSpotlight)[0] || null

  const topOlahragawati =
    allAthletesForSpotlight
      .filter((a) => a.gender === 'Perempuan' && a.year === '6')
      .sort(sortSpotlight)[0] || null

  // 2. Anugerah Harapan (Tahun 5)
  const topHarapanLelaki =
    allAthletesForSpotlight
      .filter((a) => a.gender === 'Lelaki' && a.year === '5')
      .sort(sortSpotlight)[0] || null

  const topHarapanPerempuan =
    allAthletesForSpotlight
      .filter((a) => a.gender === 'Perempuan' && a.year === '5')
      .sort(sortSpotlight)[0] || null

  return (
    <div className="redesigned-dashboard-frame">
      <Head title="Papan Pemuka Pentadbir - SK Beringis" />

      {/* Main Container mirroring the highly rounded card layout */}
      <div className="dashboard-container-card">
        {/* Left Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-logo-section">
            <Trophy className="sidebar-logo-icon" size={24} />
            <span className="sidebar-logo-text">SK Beringis</span>
          </div>

          <nav className="sidebar-nav">
            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={20} />
              <span>Utama (Dashboard)</span>
              {activeTab === 'dashboard' && <span className="selection-dot" />}
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              <ClipboardList size={20} />
              <span>Keputusan Acara</span>
              {activeTab === 'results' && <span className="selection-dot" />}
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'awards' ? 'active' : ''}`}
              onClick={() => setActiveTab('awards')}
            >
              <Award size={20} />
              <span>Anugerah Khas</span>
              {activeTab === 'awards' && <span className="selection-dot" />}
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'registration' ? 'active' : ''}`}
              onClick={() => setActiveTab('registration')}
            >
              <UserCheck size={20} />
              <span>Pendaftaran Atlet</span>
              {activeTab === 'registration' && <span className="selection-dot" />}
            </button>
          </nav>

          {/* Bottom Logout Button */}
          <div className="sidebar-footer">
            <button
              type="button"
              onClick={() => router.post('/logout')}
              className="sidebar-logout-btn"
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <LogOut size={16} />
              <span>Log Keluar</span>
            </button>
          </div>
        </aside>

        {/* Right Content panel */}
        <div className="dashboard-content-panel">
          {/* Top Search & Profile Panel */}
          <div className="content-top-header">
            <div className="top-search-bar">
              <div style={{ position: 'relative' }}>
                <Search size={18} className="search-bar-icon" />
                <input
                  type="text"
                  placeholder="Cari acara, keputusan, atau maklumat atlet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-field"
                />
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '16px', marginTop: '6px', display: 'block' }}>
                {championshipInfo.title} ({championshipInfo.edition}) • {championshipInfo.venue}
              </span>
            </div>

            <div className="top-profile-actions">
              <Link href="/" className="public-portal-badge" target="_blank">
                <ExternalLink size={14} />
                <span>Portal Awam</span>
              </Link>
              <button
                type="button"
                onClick={() => router.post('/logout')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#dc2626',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Log Keluar Pentadbir"
              >
                <LogOut size={14} />
                <span>Log Keluar</span>
              </button>
              <div className="user-avatar-initials" title="Pentadbir Kejohanan">
                AD
              </div>
            </div>
          </div>


          {/* Toast Message Alert */}
          {toastMessage && (
            <div className="toast-success-banner" style={{ margin: '0 24px 20px 24px' }}>
              <CheckCircle2 size={18} className="mr-2 text-emerald-600 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Tab Workspace */}
          <div className="workspace-tab-wrapper">
            {activeTab === 'dashboard' && (
              <DashboardOverviewTab
                events={events}
                houses={initialHouses}
                athletes={athletes}
                computedHouses={computedHouses}
                sortedHouses={sortedHouses}
                totalPoints={totalPoints}
                completedCount={completedCount}
                topOlahragawan={topOlahragawan}
                topOlahragawati={topOlahragawati}
                topHarapanLelaki={topHarapanLelaki}
                topHarapanPerempuan={topHarapanPerempuan}
              />
            )}

            {activeTab === 'results' && (
              <EventResultsTab
                events={events}
                houses={initialHouses}
                athletes={athletes}
                onSaveResult={handleSaveResult}
              />
            )}

            {activeTab === 'awards' && (
              <SpecialAwardsTab events={events} houses={initialHouses} />
            )}

            {activeTab === 'registration' && (
              <AthleteRegistrationTab
                athletes={athletes}
                houses={initialHouses}
                onAddAthlete={handleAddAthlete}
                onDeleteAthlete={handleDeleteAthlete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

AdminDashboard.layout = (page: any) => <>{page}</>

export default AdminDashboard
