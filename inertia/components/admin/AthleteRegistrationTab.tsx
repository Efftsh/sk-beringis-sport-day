import { useState, type FormEvent, type ChangeEvent } from 'react'
import { router } from '@inertiajs/react'
import {
  UserPlus,
  CheckCircle2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Upload,
  Search,
  Users,
  User,
} from 'lucide-react'
import { HouseItem } from './EventResultsTab'

export interface AthleteRegistrationItem {
  id: string
  name: string
  class: string
  gender: 'Lelaki' | 'Perempuan'
  houseId: string
  bib: string
  events: string[]
}

interface AthleteRegistrationTabProps {
  athletes: AthleteRegistrationItem[]
  houses: HouseItem[]
  onAddAthlete: (athlete: Omit<AthleteRegistrationItem, 'id'>) => void
  onDeleteAthlete: (athleteId: string) => void
}

export default function AthleteRegistrationTab({
  athletes,
  houses,
  onAddAthlete,
  onDeleteAthlete,
}: AthleteRegistrationTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedHouseFilter, setSelectedHouseFilter] = useState('all')
  const [selectedGenderFilter, setSelectedGenderFilter] = useState('all')
  const [selectedEventTypeFilter, setSelectedEventTypeFilter] = useState<'all' | 'individual' | 'group'>('all')
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Form modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false)
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [newClass, setNewClass] = useState('Tahun 6 Inovatif')
  const [newGender, setNewGender] = useState<'Lelaki' | 'Perempuan'>('Lelaki')
  const [newHouseId, setNewHouseId] = useState('merah')
  const [newBib, setNewBib] = useState('')
  const [selectedEventsList, setSelectedEventsList] = useState<string[]>([])

  const availableEventCategories = [
    '80 meter (Lelaki 6 Tahun) [Individu - Utama]',
    '80 meter (Perempuan 6 Tahun) [Individu - Utama]',
    '80 meter (5 Tahun Campuran) [Individu - Utama]',
    '4x50 meter (Prasekolah 6 Tahun) [Kumpulan - Utama]',
    '80 M (Tahun 1 & 2) [Individu - Utama]',
    '100 M (Tahun 3 - 6) [Individu - Utama]',
    '200 M (Tahun 4 - 6) [Individu - Utama]',
    'Lompat Jauh [Individu - Utama]',
    'Lompat Tinggi [Individu - Utama]',
    'Lontar Peluru [Individu - Utama]',
    '4 x 50 M [Kumpulan - Utama]',
    '4 x 50 M [Kumpulan - Simpanan]',
    '4 x 100 M [Kumpulan - Utama]',
    '4 x 100 M [Kumpulan - Simpanan]',
    '4 x 200 M [Kumpulan - Utama]',
    '4 x 200 M [Kumpulan - Simpanan]',
  ]

  const handleToggleEvent = (evName: string) => {
    if (selectedEventsList.includes(evName)) {
      setSelectedEventsList(selectedEventsList.filter((e) => e !== evName))
    } else {
      setSelectedEventsList([...selectedEventsList, evName])
    }
  }

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    const generatedBib =
      newBib.trim() ||
      `${newHouseId.charAt(0).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`

    onAddAthlete({
      name: newName.trim(),
      class: newClass,
      gender: newGender,
      houseId: newHouseId,
      bib: generatedBib,
      events: selectedEventsList.length > 0 ? selectedEventsList : ['100 M [Individu - Utama]'],
    })

    // Reset
    setNewName('')
    setNewBib('')
    setSelectedEventsList([])
    setIsAddModalOpen(false)
  }

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportStatusMessage(`⏳ Sedang membaca & memproses "${file.name}"...`)
      const formData = new FormData()
      formData.append('excel_file', file)

      router.post('/admin/athletes/upload-excel', formData as any, {
        preserveScroll: true,
        onSuccess: () => {
          setImportStatusMessage(`✅ Fail "${file.name}" berjaya dimuat naik & disimpan dalam pangkalan data!`)
          setTimeout(() => {
            setIsImportModalOpen(false)
            setImportStatusMessage(null)
          }, 2000)
        },
        onError: (err) => {
          setImportStatusMessage(`❌ Ralat: ${Object.values(err).join(', ') || 'Gagal memproses fail'}`)
        },
      })
    }
  }

  const handleClearAllAthletes = () => {
    router.post(
      '/admin/athletes/clear-all',
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsClearAllModalOpen(false)
        },
      }
    )
  }

  const getHouseName = (houseId: string) => {
    const h = houses.find((x) => x.id === houseId)
    return h ? h.name : houseId
  }

  // Get Initials for Avatar Icon
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  // Filtering
  const filteredAthletes = athletes.filter((ath) => {
    const matchesSearch =
      !searchQuery.trim() ||
      ath.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ath.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ath.bib.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesHouse = selectedHouseFilter === 'all' || ath.houseId === selectedHouseFilter
    const matchesGender = selectedGenderFilter === 'all' || ath.gender === selectedGenderFilter

    const matchesGrade =
      selectedGradeFilter === 'all' ||
      (selectedGradeFilter === 'pra' && ath.class.toLowerCase().includes('pra')) ||
      ath.class.startsWith(selectedGradeFilter)

    const matchesEventType =
      selectedEventTypeFilter === 'all' ||
      (selectedEventTypeFilter === 'individual' &&
        ath.events.some((ev) => ev.toLowerCase().includes('individu'))) ||
      (selectedEventTypeFilter === 'group' &&
        ath.events.some((ev) => ev.toLowerCase().includes('kumpulan') || ev.includes('4x') || ev.includes('4 x')))

    return matchesSearch && matchesHouse && matchesGender && matchesGrade && matchesEventType
  })

  // Pagination logic
  const totalEntries = filteredAthletes.length
  const totalPages = Math.max(Math.ceil(totalEntries / itemsPerPage), 1)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalEntries)
  const paginatedAthletes = filteredAthletes.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="athlete-registration-tab-container" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
      {/* Registration Summary Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.75px', marginBottom: '4px' }}>
            Pendaftaran & Roster Atlet Rasmi
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
            {athletes.length} atlet berdaftar dari 4 Rumah Sukan (Data Rasmi Excel SK Beringis).
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsClearAllModalOpen(true)}
            style={{
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fca5a5',
              borderRadius: '10px',
              padding: '10px 16px',
              fontWeight: 800,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.08)',
            }}
          >
            <Trash2 size={16} />
            <span>Padam Semua Atlet</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            style={{
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '10px 18px',
              fontWeight: 800,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            <FileSpreadsheet size={16} style={{ color: '#16a34a' }} />
            <span>📥 Muat Naik Fail Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              background: 'var(--forest-green)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontWeight: 800,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(45, 122, 95, 0.2)',
            }}
          >
            <UserPlus size={16} />
            <span>+ Daftar Atlet Baharu</span>
          </button>
        </div>
      </div>

      {/* 4 Columns House Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {houses.map((h) => {
          const houseAthletes = athletes.filter((a) => a.houseId === h.id)
          const count = houseAthletes.length
          const lelakiCount = houseAthletes.filter((a) => a.gender === 'Lelaki').length
          const perempuanCount = houseAthletes.filter((a) => a.gender === 'Perempuan').length

          const lightBgColor =
            h.id === 'merah'
              ? '#fef2f2'
              : h.id === 'biru'
                ? '#eff6ff'
                : h.id === 'kuning'
                  ? '#fffbeb'
                  : '#f0fdf4'

          const borderClr =
            h.id === 'merah'
              ? '#fca5a5'
              : h.id === 'biru'
                ? '#bfdbfe'
                : h.id === 'kuning'
                  ? '#fde68a'
                  : '#bbf7d0'

          return (
            <div
              key={h.id}
              onClick={() => {
                setSelectedHouseFilter(selectedHouseFilter === h.id ? 'all' : h.id)
                setCurrentPage(1)
              }}
              style={{
                background: lightBgColor,
                border: `2px solid ${selectedHouseFilter === h.id ? h.color : borderClr}`,
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedHouseFilter === h.id ? `0 4px 14px ${h.color}30` : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: h.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  RUMAH {h.name}
                </span>
                {selectedHouseFilter === h.id && (
                  <span style={{ fontSize: '11px', fontWeight: 800, color: h.color, background: '#ffffff', padding: '2px 8px', borderRadius: '10px' }}>
                    Dipilih
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                  {count}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                  Atlet
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', gap: '8px' }}>
                <span>👦 {lelakiCount} Lelaki</span>
                <span>•</span>
                <span>👧 {perempuanCount} Perempuan</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pill Filters & Search Toolbar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '16px',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Search Field */}
        <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px' }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Cari atlet, kelas (cth: 4 Inovatif), no. bib..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{
              width: '100%',
              height: '40px',
              paddingLeft: '40px',
              paddingRight: '14px',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Event Type Filter */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Jenis Acara</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className={`status-pill-btn ${selectedEventTypeFilter === 'all' ? 'active' : ''}`}
                onClick={() => { setSelectedEventTypeFilter('all'); setCurrentPage(1); }}
                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}
              >
                Semua
              </button>
              <button
                type="button"
                className={`status-pill-btn ${selectedEventTypeFilter === 'individual' ? 'active' : ''}`}
                onClick={() => { setSelectedEventTypeFilter('individual'); setCurrentPage(1); }}
                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}
              >
                <User size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Individu
              </button>
              <button
                type="button"
                className={`status-pill-btn ${selectedEventTypeFilter === 'group' ? 'active' : ''}`}
                onClick={() => { setSelectedEventTypeFilter('group'); setCurrentPage(1); }}
                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}
              >
                <Users size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Kumpulan (Relay)
              </button>
            </div>
          </div>

          {/* Gender Filter */}
          <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Jantina</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className={`status-pill-btn ${selectedGenderFilter === 'all' ? 'active' : ''}`}
                onClick={() => { setSelectedGenderFilter('all'); setCurrentPage(1); }}
                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}
              >
                Semua
              </button>
              <button
                type="button"
                className={`status-pill-btn ${selectedGenderFilter === 'Lelaki' ? 'active' : ''}`}
                onClick={() => { setSelectedGenderFilter('Lelaki'); setCurrentPage(1); }}
                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}
              >
                Lelaki
              </button>
              <button
                type="button"
                className={`status-pill-btn ${selectedGenderFilter === 'Perempuan' ? 'active' : ''}`}
                onClick={() => { setSelectedGenderFilter('Perempuan'); setCurrentPage(1); }}
                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}
              >
                Perempuan
              </button>
            </div>
          </div>

          {/* Year/Grade Filter */}
          <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Tahun</div>
            <select
              value={selectedGradeFilter}
              onChange={(e) => { setSelectedGradeFilter(e.target.value); setCurrentPage(1); }}
              className="tab-select"
              style={{ height: '36px', fontSize: '12px', paddingLeft: '10px', paddingRight: '28px' }}
            >
              <option value="all">Semua Tahun (1-6)</option>
              <option value="1">Tahun 1</option>
              <option value="2">Tahun 2</option>
              <option value="3">Tahun 3</option>
              <option value="4">Tahun 4</option>
              <option value="5">Tahun 5</option>
              <option value="6">Tahun 6</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 800, color: '#475569', letterSpacing: '0.5px' }}>
                  ATLET
                </th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 800, color: '#475569', letterSpacing: '0.5px' }}>
                  KELAS
                </th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 800, color: '#475569', letterSpacing: '0.5px' }}>
                  RUMAH SUKAN
                </th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 800, color: '#475569', letterSpacing: '0.5px' }}>
                  PENYERTAAN ACARA (INDIVIDU & KUMPULAN)
                </th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 800, color: '#475569', letterSpacing: '0.5px', textAlign: 'right' }}>
                  TINDAKAN
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedAthletes.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                    Tiada atlet sepadan dengan tapisan carian ini.
                  </td>
                </tr>
              ) : (
                paginatedAthletes.map((ath) => {
                  const houseObj = houses.find((x) => x.id === ath.houseId)
                  const badgeBorderColor = houseObj ? `${houseObj.color}40` : '#e2e8f0'
                  const badgeBgColor = houseObj ? `${houseObj.color}0a` : '#f8fafc'

                  return (
                    <tr key={ath.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      {/* Athlete Initials Avatar & Bib Info */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: houseObj ? `${houseObj.color}15` : '#f1f5f9',
                              color: houseObj ? houseObj.color : '#475569',
                              fontWeight: 900,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              border: `1px solid ${houseObj ? houseObj.color : '#cbd5e1'}30`,
                            }}
                          >
                            {getInitials(ath.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{ath.name}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                              <strong style={{ color: '#0f172a' }}>{ath.bib}</strong> • {ath.gender}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 700, color: '#334155' }}>
                        {ath.class}
                      </td>

                      {/* House custom tag */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            border: `1px solid ${badgeBorderColor}`,
                            background: badgeBgColor,
                            color: houseObj ? houseObj.color : '#64748b',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 700,
                            display: 'inline-block',
                          }}
                        >
                          Rumah {getHouseName(ath.houseId)}
                        </span>
                      </td>

                      {/* Events Joined pills */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '420px' }}>
                          {ath.events.map((ev, idx) => {
                            const isGroup = ev.toLowerCase().includes('kumpulan') || ev.includes('4x') || ev.includes('4 x')
                            const isReserve = ev.toLowerCase().includes('simpanan')

                            let pillBg = '#f8fafc'
                            let pillBorder = '#cbd5e1'
                            let pillColor = '#475569'

                            if (isGroup && isReserve) {
                              pillBg = '#fffbeb'
                              pillBorder = '#fde68a'
                              pillColor = '#b45309'
                            } else if (isGroup) {
                              pillBg = '#f0fdf4'
                              pillBorder = '#bbf7d0'
                              pillColor = '#15803d'
                            } else {
                              pillBg = '#eff6ff'
                              pillBorder = '#bfdbfe'
                              pillColor = '#1d4ed8'
                            }

                            return (
                              <span
                                key={idx}
                                style={{
                                  background: pillBg,
                                  border: `1px solid ${pillBorder}`,
                                  color: pillColor,
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                }}
                              >
                                {ev}
                              </span>
                            )
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-action-icon delete"
                          onClick={() => onDeleteAthlete(ath.id)}
                          style={{
                            border: '1px solid #fca5a5',
                            background: '#fef2f2',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            padding: '6px',
                          }}
                          title="Padam Atlet"
                        >
                          <Trash2 size={15} style={{ color: '#ef4444' }} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Custom Pagination Footer */}
        {totalEntries > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
              Menunjukkan <strong style={{ color: '#0f172a' }}>{startIndex + 1}</strong> hingga{' '}
              <strong style={{ color: '#0f172a' }}>{endIndex}</strong> daripada{' '}
              <strong style={{ color: '#0f172a' }}>{totalEntries}</strong> atlet berdaftar
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentPage === 1 ? '#cbd5e1' : '#475569',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => {
                const pg = i + 1
                return (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => handlePageChange(pg)}
                    style={{
                      background: currentPage === pg ? 'var(--forest-green)' : '#ffffff',
                      border: '1px solid',
                      borderColor: currentPage === pg ? 'var(--forest-green)' : '#cbd5e1',
                      color: currentPage === pg ? '#ffffff' : '#475569',
                      borderRadius: '6px',
                      width: '32px',
                      height: '32px',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {pg}
                  </button>
                )
              })}

              {totalPages > 8 && (
                <span style={{ padding: '0 4px', color: '#64748b', fontSize: '12px', fontWeight: 700 }}>... {totalPages}</span>
              )}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentPage === totalPages ? '#cbd5e1' : '#475569',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import Excel Modal */}
      {isImportModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setIsImportModalOpen(false)}>
          <div className="modal-content-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileSpreadsheet size={22} style={{ color: '#16a34a' }} />
                <span className="modal-title-bold">Muat Naik Borang Excel Peserta</span>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsImportModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
                Sistem menyokong fail Excel rasmi kejohanan (cth: <code>RUMAH MERAH.xlsx</code>, <code>RUMAH BIRU.xlsx</code>). Sistem akan membaca nama, kelas, jantina, serta klasifikasi <strong>Acara Individu</strong> & <strong>Acara Kumpulan</strong> secara automatik.
              </p>

              {/* Upload Box */}
              <label
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '14px',
                  padding: '30px 20px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'border-color 0.2s',
                }}
              >
                <Upload size={32} style={{ color: 'var(--forest-green)' }} />
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  Klik untuk pilih fail Excel (.xlsx)
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Atau seret dan lepas fail borang pendaftaran rumah sukan di sini
                </span>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              {importStatusMessage && (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 16px', color: '#15803d', fontSize: '13px', fontWeight: 700 }}>
                  {importStatusMessage}
                </div>
              )}

              {/* Info Footer */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Format yang disokong: <strong>.xlsx / .xls</strong> (Helaian LELAKI & PEREMPUAN)
                </span>
                <span style={{ fontSize: '11px', color: 'var(--forest-green)', fontWeight: 700, background: '#f0fdf4', padding: '4px 10px', borderRadius: '6px' }}>
                  ⚡ Auto-Padan Acara & Jantina
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Athlete Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <span className="modal-title-bold">Pendaftaran Atlet Baharu</span>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="scoring-form">
              <div>
                <label className="form-label">Nama Penuh Atlet</label>
                <input
                  type="text"
                  placeholder="Cth: Muhammad Danish Raykal"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ height: '40px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', width: '100%', outline: 'none' }}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div>
                  <label className="form-label">Kelas</label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="entry-select"
                    style={{ width: '100%' }}
                  >
                    <option value="1 Inovatif">1 Inovatif</option>
                    <option value="1 Kreatif">1 Kreatif</option>
                    <option value="1 Interaktif">1 Interaktif</option>
                    <option value="1 Proaktif">1 Proaktif</option>
                    <option value="2 Inovatif">2 Inovatif</option>
                    <option value="2 Kreatif">2 Kreatif</option>
                    <option value="2 Interaktif">2 Interaktif</option>
                    <option value="2 Proaktif">2 Proaktif</option>
                    <option value="3 Inovatif">3 Inovatif</option>
                    <option value="3 Kreatif">3 Kreatif</option>
                    <option value="3 Interaktif">3 Interaktif</option>
                    <option value="3 Proaktif">3 Proaktif</option>
                    <option value="4 Inovatif">4 Inovatif</option>
                    <option value="4 Cemerlang">4 Cemerlang</option>
                    <option value="4 Dinamik">4 Dinamik</option>
                    <option value="4 Amanah">4 Amanah</option>
                    <option value="5 Inovatif">5 Inovatif</option>
                    <option value="5 Bestari">5 Bestari</option>
                    <option value="5 Dinamik">5 Dinamik</option>
                    <option value="6 Inovatif">6 Inovatif</option>
                    <option value="6 Kreatif">6 Kreatif</option>
                    <option value="6 Cerdik">6 Cerdik</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Jantina</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="entry-select"
                    style={{ width: '100%' }}
                  >
                    <option value="Lelaki">Lelaki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div>
                  <label className="form-label">Rumah Sukan</label>
                  <select
                    value={newHouseId}
                    onChange={(e) => setNewHouseId(e.target.value)}
                    className="entry-select"
                    style={{ width: '100%' }}
                  >
                    {houses.map((h) => (
                      <option key={h.id} value={h.id}>
                        Rumah {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">No. BIB (Pilihan)</label>
                  <input
                    type="text"
                    placeholder="Cth: M-45 (Automatik)"
                    value={newBib}
                    onChange={(e) => setNewBib(e.target.value)}
                    style={{ height: '40px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                  Pilih Acara Disertai ({selectedEventsList.length} dipilih)
                </label>
                <div className="events-checklist-box">
                  {availableEventCategories.map((evCat) => {
                    const isChecked = selectedEventsList.includes(evCat)
                    return (
                      <div
                        key={evCat}
                        className={`event-check-item ${isChecked ? 'checked' : ''}`}
                        onClick={() => handleToggleEvent(evCat)}
                      >
                        <span>{evCat}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'var(--forest-green)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Daftar Atlet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Clear All Confirmation Modal */}
      {isClearAllModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setIsClearAllModalOpen(false)}>
          <div className="modal-content-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trash2 size={22} style={{ color: '#dc2626' }} />
                <span className="modal-title-bold" style={{ color: '#dc2626' }}>Padam Semua Atlet?</span>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsClearAllModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
                Adakah anda pasti mahu memadamkan <strong>semua rekod atlet</strong> daripada pangkalan data?
                <br /><br />
                Tindakan ini akan mengosongkan senarai peserta bagi membolehkan anda menguji pendaftaran baharu atau memuat naik fail Excel lain dari mula.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsClearAllModalOpen(false)}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleClearAllAthletes}
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Trash2 size={15} />
                  <span>Ya, Kosongkan Semua</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
