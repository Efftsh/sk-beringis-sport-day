import { useState } from 'react'
import { Clock, MapPin, CheckCircle2, PlayCircle, Clock3, Edit3, Search } from 'lucide-react'

export interface EventItem {
  id: string
  code: string
  name: string
  category: string
  gender: string
  scheduledTime: string
  status: 'upcoming' | 'in_progress' | 'completed' | string
  venue: string
  lanes?: { lane: number; house: string; color: string }[]
  winner?: string
}

interface EventTrackerTableProps {
  events: EventItem[]
  onRecordScore?: (eventId: string) => void
}

export default function EventTrackerTable({ events, onRecordScore }: EventTrackerTableProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'upcoming' | 'completed'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredEvents = events.filter((ev) => {
    const matchesStatus = statusFilter === 'all' || ev.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || ev.category.toLowerCase().includes(categoryFilter.toLowerCase())
    const matchesSearch =
      ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesCategory && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="status-badge badge-in-progress">
            <PlayCircle size={12} className="mr-1 animate-pulse" /> Sedang Berlangsung
          </span>
        )
      case 'completed':
        return (
          <span className="status-badge badge-completed">
            <CheckCircle2 size={12} className="mr-1" /> Selesai
          </span>
        )
      case 'upcoming':
      default:
        return (
          <span className="status-badge badge-upcoming">
            <Clock3 size={12} className="mr-1" /> Akan Datang
          </span>
        )
    }
  }

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div>
          <div className="card-label">Jadual & Status Acara</div>
          <h2 className="card-title">Pemantauan Acara Padang & Balapan</h2>
        </div>
        <div className="event-count-badge">
          {filteredEvents.length} daripada {events.length} Acara
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="table-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Cari acara, kod, atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-pills-row">
          <div className="filter-group">
            <span className="filter-label">Status:</span>
            <button
              type="button"
              className={`pill-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              Semua
            </button>
            <button
              type="button"
              className={`pill-btn ${statusFilter === 'in_progress' ? 'active' : ''}`}
              onClick={() => setStatusFilter('in_progress')}
            >
              🔴 Live
            </button>
            <button
              type="button"
              className={`pill-btn ${statusFilter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setStatusFilter('upcoming')}
            >
              Belum Mula
            </button>
            <button
              type="button"
              className={`pill-btn ${statusFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('completed')}
            >
              Selesai
            </button>
          </div>

          <div className="filter-group">
            <span className="filter-label">Kategori:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="category-select"
            >
              <option value="all">Semua Kategori</option>
              <option value="Tahap 1">Tahap 1</option>
              <option value="Tahap 2">Tahap 2</option>
              <option value="Prasekolah">Prasekolah</option>
              <option value="Khas">Acara Khas / Terbuka</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table / List */}
      <div className="events-table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Kod</th>
              <th>Nama Acara & Kategori</th>
              <th>Masa & Lokasi</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-table-cell">
                  Tiada acara sepadan dengan tapisan carian.
                </td>
              </tr>
            ) : (
              filteredEvents.map((ev) => (
                <tr key={ev.id} className={`event-row row-${ev.status}`}>
                  <td>
                    <span className="event-code-pill">{ev.code}</span>
                  </td>
                  <td>
                    <div className="event-primary-name">{ev.name}</div>
                    <div className="event-sub-meta">
                      <span className="category-tag">{ev.category}</span>
                      <span className="gender-tag">{ev.gender}</span>
                      {ev.winner && (
                        <span className="winner-tag">
                          🏆 Pemenang: <strong>{ev.winner}</strong>
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="event-schedule-meta">
                      <span className="meta-item">
                        <Clock size={13} className="meta-icon" /> {ev.scheduledTime}
                      </span>
                      <span className="meta-item">
                        <MapPin size={13} className="meta-icon" /> {ev.venue}
                      </span>
                    </div>
                  </td>
                  <td>{getStatusBadge(ev.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {ev.status === 'completed' ? (
                      <button
                        type="button"
                        className="btn-table-action btn-secondary"
                        onClick={() => onRecordScore && onRecordScore(ev.id)}
                      >
                        <Edit3 size={13} style={{ marginRight: '4px' }} /> Kemas Kini
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-table-action btn-primary"
                        onClick={() => onRecordScore && onRecordScore(ev.id)}
                      >
                        <Edit3 size={13} style={{ marginRight: '4px' }} /> Catat Markah
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
