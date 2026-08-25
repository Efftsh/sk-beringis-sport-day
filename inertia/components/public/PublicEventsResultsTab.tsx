import { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  ChevronDown,
  ChevronUp,
  Calendar,
  Image as ImageIcon,
  Maximize2,
  X,
  Download,
} from 'lucide-react'
import { EventRecord, HouseItem } from './PublicLeaderboardTab'

interface PublicEventsResultsTabProps {
  events: EventRecord[]
  houses: HouseItem[]
}

// Classify events based on the official tournament schedule poster
export function getEventDay(eventName: string, stage: string, category: string): 1 | 2 | 3 {
  const name = eventName.toLowerCase()
  const cat = category.toLowerCase()
  const stg = stage.toLowerCase()

  // Hari 1: Rabu, 26 Ogos 2026
  // - 50m / 4x50m Prasekolah (6 Tahun)
  // - Acara Padang: Lompat Jauh, Lontar Peluru, Lompat Tinggi
  // - 200m (Saringan)
  // - 4x200m (Akhir)
  if (
    name.includes('lompat jauh') ||
    name.includes('lontar peluru') ||
    name.includes('lompat tinggi') ||
    (name.includes('200') && (stg.includes('saringan') || name.includes('saringan'))) ||
    name.includes('4x200') ||
    name.includes('4 x 200') ||
    (name.includes('50') && (cat.includes('6 tahun') || cat.includes('pra') || cat.includes('prasekolah')))
  ) {
    return 1
  }

  // Hari 2: Khamis, 27 Ogos 2026
  // - 200m (Akhir)
  // - 4x50m (Akhir) Tahun 1 & 2
  // - 4x100m (Akhir) Tahun 3, 4, 5, 6
  if (
    (name.includes('200') && !stg.includes('saringan') && !name.includes('saringan') && !name.includes('4x200') && !name.includes('4 x 200')) ||
    (name.includes('4x50') && !cat.includes('6 tahun') && !cat.includes('pra')) ||
    name.includes('4x100') ||
    name.includes('4 x 100')
  ) {
    return 2
  }

  // Hari 3: Jumaat, 28 Ogos 2026
  // - 50m (Akhir) Tahun 1 & 2
  // - 100m (Akhir) Tahun 3, 4, 5, 6
  // - Relay Terbuka Ibubapa/Guru
  // - Perbarisan & Majlis Penutupan
  if (
    (name.includes('50') && !name.includes('4x50') && !cat.includes('6 tahun') && !cat.includes('pra')) ||
    name.includes('100') ||
    name.includes('relay') ||
    name.includes('ibubapa') ||
    name.includes('guru') ||
    name.includes('terbuka')
  ) {
    return 3
  }

  return 1
}

export default function PublicEventsResultsTab({
  events,
  houses,
}: PublicEventsResultsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [dayFilter, setDayFilter] = useState<'all' | 1 | 2 | 3>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'track' | 'field' | 'sukaneka'>('all')
  const [houseFilter, setHouseFilter] = useState('all')
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    events.forEach((e) => {
      if (e.status === 'completed') initial.add(e.id)
    })
    return initial
  })
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false)
  const [showPosterPreview, setShowPosterPreview] = useState(false)

  const toggleExpand = (id: string) => {
    setExpandedEventIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedEventIds(new Set(events.map((e) => e.id)))
  }

  const collapseAll = () => {
    setExpandedEventIds(new Set())
  }


  // Map house helper
  const getHouse = (houseId: string) => houses.find((h) => h.id === houseId)

  // Unique categories list
  const categories = useMemo(() => {
    const set = new Set<string>()
    events.forEach((e) => {
      if (e.category) set.add(e.category)
    })
    return Array.from(set).sort()
  }, [events])

  // Filtered Events with Day, Status, Category, Type, House, and Search
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const eventDay = getEventDay(ev.eventName, ev.stage, ev.category)

      // Day filter
      if (dayFilter !== 'all' && eventDay !== dayFilter) return false

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchCode = ev.code.toLowerCase().includes(q)
        const matchName = ev.eventName.toLowerCase().includes(q)
        const matchCat = ev.category.toLowerCase().includes(q)
        const matchAthlete = (ev.results || []).some(
          (r) =>
            r.athleteName.toLowerCase().includes(q) ||
            (r.bib && r.bib.toLowerCase().includes(q))
        )
        if (!matchCode && !matchName && !matchCat && !matchAthlete) return false
      }

      // Status filter
      if (statusFilter !== 'all' && ev.status !== statusFilter) return false

      // Category filter
      if (categoryFilter !== 'all' && ev.category !== categoryFilter) return false

      // Type filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'sukaneka') {
          if (!ev.eventName.toLowerCase().includes('sukaneka')) return false
        } else {
          if (ev.type !== typeFilter) return false
        }
      }

      // House filter
      if (houseFilter !== 'all') {
        const hasHouseResult = (ev.results || []).some((r) => r.houseId === houseFilter)
        if (!hasHouseResult) return false
      }

      return true
    })
  }, [events, dayFilter, searchQuery, statusFilter, categoryFilter, typeFilter, houseFilter])

  const completedCount = events.filter((e) => e.status === 'completed').length
  const pendingCount = events.length - completedCount

  const day1Count = useMemo(() => events.filter((e) => getEventDay(e.eventName, e.stage, e.category) === 1).length, [events])
  const day2Count = useMemo(() => events.filter((e) => getEventDay(e.eventName, e.stage, e.category) === 2).length, [events])
  const day3Count = useMemo(() => events.filter((e) => getEventDay(e.eventName, e.stage, e.category) === 3).length, [events])

  return (

    <div style={{ maxWidth: '1160px', margin: '0 auto 30px', padding: '0 16px' }}>
      {/* Header & Quick Summary */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: 'clamp(18px, 3.5vw, 24px)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
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
              JADUAL & KEPUTUSAN
            </div>
            <h2 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, color: '#0f172a' }}>
              Keputusan Acara Rasmi
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Semak jadual mengikut hari (Hari 1, 2, 3), pemenang podium, dan rekod baharu kejohanan.
            </p>
          </div>

          {/* Quick Actions (Poster Lightbox & Badges) */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setIsPosterModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                transition: 'transform 0.15s ease',
                minHeight: '36px',
              }}
            >
              <ImageIcon size={14} />
              <span>Poster Aturcara</span>
            </button>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                padding: '5px 10px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 800,
              }}
            >
              <CheckCircle2 size={13} />
              <span>{completedCount} Selesai</span>
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#475569',
                padding: '5px 10px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 800,
              }}
            >
              <Clock size={13} />
              <span>{pendingCount} Menunggu</span>
            </span>
          </div>
        </div>

        {/* 🌟 1. Primary Filter: Filter by Day (Hari 1, Hari 2, Hari 3) */}
        <div
          style={{
            marginBottom: '14px',
            background: '#f8fafc',
            padding: '10px 12px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={13} style={{ color: 'var(--forest-green)' }} />
            <span>PILIH HARI KEJOHANAN:</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setDayFilter('all')}
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                border: dayFilter === 'all' ? '2px solid var(--forest-green)' : '1px solid #cbd5e1',
                background: dayFilter === 'all' ? 'var(--forest-green)' : '#ffffff',
                color: dayFilter === 'all' ? '#ffffff' : '#334155',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '2px',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 800 }}>Semua Hari</span>
              <span style={{ fontSize: '10px', opacity: 0.85 }}>{events.length} Acara (26-28 Ogos)</span>
            </button>

            <button
              type="button"
              onClick={() => setDayFilter(1)}
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                border: dayFilter === 1 ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: dayFilter === 1 ? '#2563eb' : '#ffffff',
                color: dayFilter === 1 ? '#ffffff' : '#334155',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '2px',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 800 }}>📅 Hari 1 (Rabu)</span>
              <span style={{ fontSize: '10px', opacity: 0.85 }}>Padang, 4x200 ({day1Count})</span>
            </button>

            <button
              type="button"
              onClick={() => setDayFilter(2)}
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                border: dayFilter === 2 ? '2px solid #d97706' : '1px solid #cbd5e1',
                background: dayFilter === 2 ? '#d97706' : '#ffffff',
                color: dayFilter === 2 ? '#ffffff' : '#334155',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '2px',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 800 }}>📅 Hari 2 (Khamis)</span>
              <span style={{ fontSize: '10px', opacity: 0.85 }}>200M, 4x100 ({day2Count})</span>
            </button>

            <button
              type="button"
              onClick={() => setDayFilter(3)}
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                border: dayFilter === 3 ? '2px solid #dc2626' : '1px solid #cbd5e1',
                background: dayFilter === 3 ? '#dc2626' : '#ffffff',
                color: dayFilter === 3 ? '#ffffff' : '#334155',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '2px',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 800 }}>📅 Hari 3 (Jumaat)</span>
              <span style={{ fontSize: '10px', opacity: 0.85 }}>100M, Penutup ({day3Count})</span>
            </button>
          </div>
        </div>

        {/* Collapsible Poster Preview Bar */}
        <div
          style={{
            marginBottom: '14px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            padding: '8px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#1e40af', fontWeight: 700 }}>
            <ImageIcon size={14} />
            <span>Poster Aturcara Kejohanan</span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setShowPosterPreview(!showPosterPreview)}
              style={{
                background: '#ffffff',
                border: '1px solid #93c5fd',
                color: '#1d4ed8',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {showPosterPreview ? 'Sembunyi' : 'Paparkan'}
            </button>

            <button
              type="button"
              onClick={() => setIsPosterModalOpen(true)}
              style={{
                background: '#1d4ed8',
                border: 'none',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Maximize2 size={11} />
              <span>Penuh</span>
            </button>
          </div>
        </div>

        {/* In-page Poster Preview (Toggleable) */}
        {showPosterPreview && (
          <div
            style={{
              marginBottom: '16px',
              textAlign: 'center',
              background: '#0f172a',
              padding: '12px',
              borderRadius: '14px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}
          >
            <img
              src="/images/poster_aturcara_kejohanan.jpg"
              alt="Poster Aturcara Kejohanan Olahraga SK Beringis 2026"
              style={{
                maxWidth: '100%',
                maxHeight: '550px',
                borderRadius: '10px',
                objectFit: 'contain',
                margin: '0 auto',
                display: 'block',
                cursor: 'pointer',
              }}
              onClick={() => setIsPosterModalOpen(true)}
            />
            <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '6px' }}>
              🔍 <em>Klik pada gambar untuk skrin penuh.</em>
            </p>
          </div>
        )}

        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari acara (cth: 100M, Lontar Peluru, 101) atau atlet..."
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 600,
              color: '#0f172a',
              outline: 'none',
              background: '#f8fafc',
              minHeight: '40px',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#e2e8f0',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 800,
                color: '#475569',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Secondary Filter Toolbar (Status, Category, Type, House) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center',
            paddingTop: '10px',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 800, color: '#475569' }}>
            <Filter size={12} />
            <span>Tapis:</span>
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '2px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'all' ? '#ffffff' : 'transparent',
                color: statusFilter === 'all' ? '#0f172a' : '#64748b',
                boxShadow: statusFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'completed' ? 'var(--forest-green)' : 'transparent',
                color: statusFilter === 'completed' ? '#ffffff' : '#64748b',
                boxShadow: statusFilter === 'completed' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Selesai
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'pending' ? '#ffffff' : 'transparent',
                color: statusFilter === 'pending' ? '#0f172a' : '#64748b',
                boxShadow: statusFilter === 'pending' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Menunggu
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
              minHeight: '32px',
              flexGrow: 1,
            }}
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Event Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
              minHeight: '32px',
              flexGrow: 1,
            }}
          >
            <option value="all">Semua Jenis</option>
            <option value="track">Balapan</option>
            <option value="field">Padang</option>
            <option value="sukaneka">Sukaneka</option>
          </select>

          {/* House Filter */}
          <select
            value={houseFilter}
            onChange={(e) => setHouseFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
              minHeight: '32px',
              flexGrow: 1,
            }}
          >
            <option value="all">Semua Rumah</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                Rumah {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Header & Expand/Collapse All Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>
          Memaparkan <strong>{filteredEvents.length}</strong> Acara
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={expandAll}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Kembangkan Semua
          </button>
          <button
            type="button"
            onClick={collapseAll}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Tutup Semua
          </button>
        </div>
      </div>

      {/* Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredEvents.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '40px 16px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              color: '#64748b',
            }}
          >
            <Trophy size={36} style={{ margin: '0 auto 10px', color: '#cbd5e1' }} />
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              Tiada Acara Dijumpai
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Cuba ubah carian kata kunci atau tetapan tapisan hari/kategori anda.
            </div>
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const isCompleted = ev.status === 'completed'
            const isExpanded = expandedEventIds.has(ev.id)
            const winner = isCompleted && ev.results && ev.results[0] ? ev.results[0] : null
            const winnerHouse = winner ? getHouse(winner.houseId) : null
            const hasBrokenRecord = (ev.results || []).some((r) => r.isRecordBroken)
            const eventDay = getEventDay(ev.eventName, ev.stage, ev.category)

            const dayLabel =
              eventDay === 1 ? '📅 Hari 1 (Rabu)' : eventDay === 2 ? '📅 Hari 2 (Khamis)' : '📅 Hari 3 (Jumaat)'
            const dayBadgeBg =
              eventDay === 1 ? '#dbeafe' : eventDay === 2 ? '#fef3c7' : '#fee2e2'
            const dayBadgeColor =
              eventDay === 1 ? '#1e40af' : eventDay === 2 ? '#92400e' : '#b91c1c'

            return (
              <div
                key={ev.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: isCompleted ? '1px solid #cbd5e1' : '1px dashed #cbd5e1',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Event Card Header */}
                <div
                  onClick={() => toggleExpand(ev.id)}
                  style={{
                    padding: 'clamp(12px, 2.5vw, 18px) clamp(14px, 3vw, 20px)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    cursor: 'pointer',
                    background: isCompleted ? '#ffffff' : '#f8fafc',
                    borderBottom: isExpanded ? '1px solid #f1f5f9' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: '1 1 260px', minWidth: '220px' }}>
                    {/* Event Code Badge */}
                    <span
                      style={{
                        background: '#0f172a',
                        color: '#ffffff',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 900,
                        letterSpacing: '0.5px',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      {ev.code}
                    </span>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 'clamp(14px, 3.2vw, 16px)', fontWeight: 900, color: '#0f172a', lineHeight: 1.3 }}>
                          {ev.eventName}
                        </h3>
                        {hasBrokenRecord && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#fee2e2',
                              border: '1px solid #fca5a5',
                              color: '#dc2626',
                              fontSize: '10px',
                              fontWeight: 900,
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            <Sparkles size={10} />
                            <span>REKOD</span>
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            background: dayBadgeBg,
                            color: dayBadgeColor,
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {dayLabel}
                        </span>

                        <span
                          style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {ev.category}
                        </span>

                        <span
                          style={{
                            background: ev.type === 'track' ? '#eff6ff' : '#fdf2f8',
                            color: ev.type === 'track' ? '#2563eb' : '#db2777',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {ev.type === 'track' ? 'Balapan' : 'Padang'}
                        </span>

                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                          ⏱️ {ev.scheduledTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Header Status & Winner pill */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {isCompleted && winner && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: winnerHouse ? winnerHouse.lightBg : '#fef3c7',
                          border: `1px solid ${winnerHouse ? winnerHouse.color : '#fde68a'}60`,
                          padding: '4px 10px',
                          borderRadius: '10px',
                        }}
                      >
                        <span style={{ fontSize: '13px' }}>🥇</span>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '12px', fontWeight: 900, color: '#0f172a', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {winner.athleteName}
                          </div>
                          <div style={{ fontSize: '10px', color: winnerHouse?.color || '#b45309', fontWeight: 800 }}>
                            {winnerHouse?.name || winner.houseId}
                            {winner.recordValue ? ` • ${winner.recordValue}` : ''}
                          </div>
                        </div>
                      </div>
                    )}

                    {!isCompleted && (
                      <span
                        style={{
                          background: '#f1f5f9',
                          color: '#64748b',
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: '8px',
                        }}
                      >
                        ⏳ Belum Mula
                      </span>
                    )}

                    <div style={{ color: '#94a3b8' }}>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Event Card Body (Podium & Standings) */}
                {isExpanded && (
                  <div style={{ padding: 'clamp(12px, 2.5vw, 18px)', background: '#fafbfc' }}>
                    {isCompleted && ev.results && ev.results.length > 0 ? (
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>
                          KEPUTUSAN RASMI:
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '8px',
                          }}
                        >
                          {ev.results.map((res) => {
                            const resHouse = getHouse(res.houseId)
                            const placeEmoji =
                              res.place === 1 ? '🥇 Emas' : res.place === 2 ? '🥈 Perak' : res.place === 3 ? '🥉 Gangsa' : '🏅 Ke-4'
                            const placeBg =
                              res.place === 1 ? '#fef3c7' : res.place === 2 ? '#f1f5f9' : res.place === 3 ? '#ffedd5' : '#f8fafc'
                            const placeBorder =
                              res.place === 1 ? '#fde68a' : res.place === 2 ? '#cbd5e1' : res.place === 3 ? '#fed7aa' : '#e2e8f0'
                            const placeColor =
                              res.place === 1 ? '#92400e' : res.place === 2 ? '#334155' : res.place === 3 ? '#9a3412' : '#64748b'

                            return (
                              <div
                                key={res.place}
                                style={{
                                  background: '#ffffff',
                                  border: `1px solid ${placeBorder}`,
                                  borderRadius: '12px',
                                  padding: '10px 12px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                                  gap: '8px',
                                }}
                              >
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                                    <span
                                      style={{
                                        background: placeBg,
                                        color: placeColor,
                                        fontSize: '10px',
                                        fontWeight: 900,
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                      }}
                                    >
                                      {placeEmoji}
                                    </span>
                                    {res.isRecordBroken && (
                                      <span
                                        style={{
                                          background: '#dc2626',
                                          color: '#ffffff',
                                          fontSize: '9px',
                                          fontWeight: 900,
                                          padding: '1px 5px',
                                          borderRadius: '4px',
                                        }}
                                      >
                                        🌟 REKOD
                                      </span>
                                    )}
                                  </div>

                                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a' }}>
                                    {res.athleteName}
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                                    <span
                                      style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: resHouse?.color || '#64748b',
                                      }}
                                    />
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: resHouse?.color || '#475569' }}>
                                      {resHouse?.name || res.houseId}
                                    </span>
                                    {res.bib && (
                                      <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>
                                        (BIB: {res.bib})
                                      </span>
                                    )}
                                  </div>

                                  {res.recordValue && (
                                    <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 800, marginTop: '2px' }}>
                                      Catatan: {res.recordValue}
                                    </div>
                                  )}
                                </div>

                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                  <span
                                    style={{
                                      fontSize: '13px',
                                      fontWeight: 900,
                                      color: resHouse?.color || '#0f172a',
                                    }}
                                  >
                                    +{res.points} pts
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '14px',
                          color: '#64748b',
                          fontSize: '12px',
                        }}
                      >
                        Acara ini dijadualkan pada <strong>{dayLabel} • {ev.scheduledTime}</strong>. Keputusan rasmi akan dipaparkan sebaik sahaja disahkan oleh hakim bertugas.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Official Poster Lightbox / Zoom Modal */}
      {isPosterModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
          }}
          onClick={() => setIsPosterModalOpen(false)}
        >
          {/* Modal Header Bar */}
          <div
            style={{
              maxWidth: '900px',
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              background: '#1e293b',
              borderRadius: '14px 14px 0 0',
              color: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '13px' }}>
              <ImageIcon size={16} style={{ color: '#38bdf8' }} />
              <span>Poster Aturcara 2026</span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <a
                href="/images/poster_aturcara_kejohanan.jpg"
                download="Poster_Aturcara_SK_Beringis_2026.jpg"
                style={{
                  background: '#334155',
                  color: '#ffffff',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                }}
              >
                <Download size={12} />
                <span>Simpan</span>
              </a>

              <button
                onClick={() => setIsPosterModalOpen(false)}
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <X size={14} />
                <span>Tutup</span>
              </button>
            </div>
          </div>

          {/* Modal Image Display */}
          <div
            style={{
              maxWidth: '900px',
              width: '100%',
              maxHeight: '82vh',
              overflow: 'auto',
              background: '#0f172a',
              borderRadius: '0 0 14px 14px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/images/poster_aturcara_kejohanan.jpg"
              alt="Poster Aturcara Kejohanan Olahraga SK Beringis 2026"
              style={{
                maxWidth: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: '6px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
