import * as XLSX from 'xlsx'
import athletesData from './athletes_data.json' with { type: 'json' }

export interface ParsedEventItem {
  id: string
  name: string
  isReserve: boolean
}

export interface AthleteDataRecord {
  id: string
  name: string
  class: string
  gender: 'Lelaki' | 'Perempuan'
  houseId: 'merah' | 'biru' | 'kuning' | 'hijau'
  bib: string
  events: string[]
  individualEvents?: ParsedEventItem[]
  groupEvents?: ParsedEventItem[]
}

export class ExcelImporterService {
  /**
   * Returns all 293 parsed athletes from SK Beringis Excel sheets
   */
  public static getAllAthletes(): AthleteDataRecord[] {
    return athletesData as AthleteDataRecord[]
  }

  /**
   * Get athletes filtered by house
   */
  public static getAthletesByHouse(houseId: string): AthleteDataRecord[] {
    return (athletesData as AthleteDataRecord[]).filter((a) => a.houseId === houseId)
  }

  /**
   * Cleanly normalize event names from Malaysian school athletics abbreviations
   */
  private static normalizeEventName(rawHeader: string): { eventName: string; isRelay: boolean } | null {
    const text = rawHeader.toUpperCase().replace(/\s+/g, ' ').trim()

    // Ignore non-event columns
    if (
      !text ||
      text === 'BIL' ||
      text === 'NO' ||
      text.includes('NAMA') ||
      text.includes('KELAS') ||
      text.includes('TINGKATAN') ||
      text.includes('JUMLAH') ||
      text.includes('CATATAN') ||
      text.includes('T/TANGAN') ||
      text === 'ACARA'
    ) {
      return null
    }

    if (text.includes('4X50') || text.includes('4 X 50')) return { eventName: '4 x 50 M', isRelay: true }
    if (text.includes('4X100') || text.includes('4 X 100')) return { eventName: '4 x 100 M', isRelay: true }
    if (text.includes('4X200') || text.includes('4 X 200')) return { eventName: '4 x 200 M', isRelay: true }
    if (text.includes('SUKANEKA')) return { eventName: 'Sukaneka', isRelay: true }

    if (text.includes('80M') || text.includes('80 M') || text === '80') return { eventName: '80 M', isRelay: false }
    if (text.includes('100M') || text.includes('100 M') || text === '100') return { eventName: '100 M', isRelay: false }
    if (text.includes('200M') || text.includes('200 M') || text === '200') return { eventName: '200 M', isRelay: false }
    if (text.includes('TINGGI') || text.includes('L.TINGGI')) return { eventName: 'Lompat Tinggi', isRelay: false }
    if (text.includes('JAUH') || text.includes('L.JAUH')) return { eventName: 'Lompat Jauh', isRelay: false }
    if (text.includes('PELURU') || text.includes('L.PELURU')) return { eventName: 'Lontar Peluru', isRelay: false }

    return null
  }

  /**
   * Dynamically parse any uploaded Excel file (.xlsx) buffer
   */
  public static parseExcelBuffer(
    buffer: Buffer,
    filename: string = '',
    forcedHouseId?: 'merah' | 'biru' | 'kuning' | 'hijau'
  ): AthleteDataRecord[] {
    // Detect house from filename if not specified
    let houseId: 'merah' | 'biru' | 'kuning' | 'hijau' = forcedHouseId || 'merah'
    const lowerFilename = filename.toLowerCase()
    if (lowerFilename.includes('biru')) houseId = 'biru'
    else if (lowerFilename.includes('kuning')) houseId = 'kuning'
    else if (lowerFilename.includes('hijau')) houseId = 'hijau'
    else if (lowerFilename.includes('merah')) houseId = 'merah'

    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const results: AthleteDataRecord[] = []
    const housePrefix = houseId.charAt(0).toUpperCase()

    let bibCounter = 1

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName]
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
      if (!rows || rows.length < 3) continue

      const isFemale = sheetName.toUpperCase().includes('PEREMPUAN') || sheetName.toUpperCase().includes('P')
      const gender: 'Lelaki' | 'Perempuan' = isFemale ? 'Perempuan' : 'Lelaki'

      // Find the row containing NAMA
      let nameRowIdx = -1
      let nameColIdx = -1
      let classColIdx = -1

      for (let r = 0; r < Math.min(rows.length, 10); r++) {
        const row = rows[r]
        for (let c = 0; c < row.length; c++) {
          const val = String(row[c] || '').toUpperCase()
          if (val.includes('NAMA') || val.includes('ATLET')) {
            nameRowIdx = r
            nameColIdx = c
          }
          if (val.includes('KELAS') || val.includes('TINGKATAN')) {
            classColIdx = c
          }
        }
        if (nameRowIdx !== -1) break
      }

      if (nameRowIdx === -1) {
        nameRowIdx = 0
        nameColIdx = 1
        classColIdx = 2
      }

      if (nameColIdx === -1) nameColIdx = 1
      if (classColIdx === -1) classColIdx = nameColIdx + 1

      // Resolve event names for each column by inspecting rows 0 to nameRowIdx + 2
      const columnEventMap = new Map<number, { eventName: string; isRelay: boolean }>()
      const maxCols = Math.max(...rows.slice(0, 10).map((r) => r.length), 15)

      for (let c = 0; c < maxCols; c++) {
        if (c === nameColIdx || c === classColIdx) continue

        for (let r = 0; r <= Math.min(nameRowIdx + 2, rows.length - 1); r++) {
          const cellStr = String(rows[r]?.[c] || '')
          const norm = ExcelImporterService.normalizeEventName(cellStr)
          if (norm) {
            columnEventMap.set(c, norm)
            break
          }
        }
      }

      // Read student rows starting after the header rows
      const startRow = Math.max(nameRowIdx + 1, 4)

      for (let r = startRow; r < rows.length; r++) {
        const row = rows[r]
        const studentName = String(row[nameColIdx] || '').trim()

        // Skip blank rows or footer summary rows
        if (
          !studentName ||
          studentName.length < 2 ||
          studentName.toUpperCase().includes('JUMLAH') ||
          studentName.toUpperCase().includes('RUMAH') ||
          studentName.toUpperCase().includes('TANDATANGAN')
        ) {
          continue
        }

        const studentClass = String(row[classColIdx] || '').trim() || 'Tahun 4 Cerdas'
        const athleteEvents: string[] = []

        // Check each resolved event column
        columnEventMap.forEach((eventInfo, colIdx) => {
          const cellVal = String(row[colIdx] || '').trim().toUpperCase()
          if (!cellVal) return

          const isReserve = cellVal === 'S' || cellVal.includes('SIMPAN')
          const isParticipant =
            cellVal === '/' || cellVal === '1' || cellVal === 'X' || cellVal === 'Y' || isReserve

          if (isParticipant) {
            const roleBadge = eventInfo.isRelay
              ? isReserve
                ? '[Kumpulan - Simpanan]'
                : '[Kumpulan - Utama]'
              : '[Individu - Utama]'

            athleteEvents.push(`${eventInfo.eventName} ${roleBadge}`)
          }
        })

        const bibStr = `${housePrefix}-${String(bibCounter).padStart(2, '0')}`
        const athleteId = `ath-${houseId}-${gender.charAt(0).toLowerCase()}-${bibCounter}`
        bibCounter++

        results.push({
          id: athleteId,
          name: studentName,
          class: studentClass,
          gender,
          houseId,
          bib: bibStr,
          events: athleteEvents.length > 0 ? athleteEvents : ['100 M [Individu - Utama]'],
        })
      }
    }

    return results
  }
}

export default ExcelImporterService
