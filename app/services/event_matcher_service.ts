/**
 * SK Beringis Sports Championship - Event and Year Linking Service
 * Handles extracting cohort year, gender, and matching registered events with athletes.
 */

// Helper to extract Year/Grade number ('1'|'2'|'3'|'4'|'5'|'6') from event category or name
export function getEventYear(category: string, eventName?: string): string | null {
  const text = `${category || ''} ${eventName || ''}`.toLowerCase()
  const match = text.match(/tahun\s*([1-6])/) || text.match(/thn\s*([1-6])/) || text.match(/\bt([1-6])\b/)
  if (match) return match[1]
  const matchYear = text.match(/([1-6])\s*tahun/)
  if (matchYear) return matchYear[1]
  return null
}

// Helper to extract Year/Grade number from athlete's class
export function getAthleteYear(className: string): string | null {
  if (!className) return null
  const clean = className.trim().toUpperCase()
  const match = clean.match(/^([1-6])\b/) || clean.match(/^([1-6])\s/) || clean.match(/TAHUN\s*([1-6])/) || clean.match(/\b([1-6])\b/)
  return match ? match[1] : null
}

// Smart event name matching
export function isAthleteRegisteredForEvent(athEventStr: string, currentEventName: string): boolean {
  const cleanAth = athEventStr.toLowerCase().replace(/\s+/g, '')
  const cleanCur = currentEventName.toLowerCase().replace(/\s+/g, '').replace('meter', 'm')

  // Relays first to prevent partial '100m' or '50m' collision with '4x100m' / '4x50m'
  if (cleanCur.includes('4x50')) return cleanAth.includes('4x50')
  if (cleanCur.includes('4x100')) return cleanAth.includes('4x100')
  if (cleanCur.includes('4x200')) return cleanAth.includes('4x200')
  if (cleanCur.includes('sukaneka')) return cleanAth.includes('sukaneka')

  // Sprints (50m, 80m, 100m, 200m)
  if (cleanCur.includes('50m') && !cleanCur.includes('4x')) {
    return (cleanAth.includes('50m') || cleanAth.includes('80m') || cleanAth.includes('100m')) && !cleanAth.includes('4x')
  }
  if (cleanCur.includes('80m') && !cleanCur.includes('4x')) {
    return (cleanAth.includes('80m') || cleanAth.includes('50m')) && !cleanAth.includes('4x')
  }
  if (cleanCur.includes('100m') && !cleanCur.includes('4x')) {
    return cleanAth.includes('100m') && !cleanAth.includes('4x')
  }
  if (cleanCur.includes('200m') && !cleanCur.includes('4x')) {
    return cleanAth.includes('200m') && !cleanAth.includes('4x')
  }

  // Field events
  if (cleanCur.includes('tinggi')) return cleanAth.includes('tinggi')
  if (cleanCur.includes('jauh')) return cleanAth.includes('jauh')
  if (cleanCur.includes('peluru')) return cleanAth.includes('peluru')

  return cleanAth.includes(cleanCur)
}

// Helper to determine if an event is a relay or group event evaluated by house
export function isGroupEvent(eventName: string): boolean {
  const clean = (eventName || '').toLowerCase()
  return (
    clean.includes('4x') ||
    clean.includes('4 x') ||
    clean.includes('sukaneka') ||
    clean.includes('kumpulan') ||
    clean.includes('relay')
  )
}
