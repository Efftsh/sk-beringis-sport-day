import { test } from '@japa/runner'
import {
  getEventYear,
  getAthleteYear,
  isAthleteRegisteredForEvent,
} from '#services/event_matcher_service'

test.group('Event and Year Linking Logic', () => {
  test('extracts correct year from event category and name', ({ assert }) => {
    assert.equal(getEventYear('Tahun 6 Lelaki', '50 meter'), '6')
    assert.equal(getEventYear('Tahun 1 Perempuan', '50 meter'), '1')
    assert.equal(getEventYear('Tahun 4 Lelaki', 'Lompat Jauh'), '4')
    assert.equal(getEventYear('Tahun 5 Perempuan', 'Lontar Peluru'), '5')
    assert.equal(getEventYear('Tahun 2 Lelaki', '4x50 meter'), '2')
    assert.equal(getEventYear('Tahun 3 Perempuan', '100 meter'), '3')
  })

  test('extracts correct year from athlete class formats', ({ assert }) => {
    assert.equal(getAthleteYear('6 PROAKTIF'), '6')
    assert.equal(getAthleteYear('6 INTERAKTIF'), '6')
    assert.equal(getAthleteYear('1 INTERAKTIF'), '1')
    assert.equal(getAthleteYear('1 KREATIF'), '1')
    assert.equal(getAthleteYear('2 INOVATIF'), '2')
    assert.equal(getAthleteYear('3 PROAKTIF'), '3')
    assert.equal(getAthleteYear('4 INO'), '4')
    assert.equal(getAthleteYear('5 KRE'), '5')
    assert.equal(getAthleteYear('Tahun 4 Cerdas'), '4')
  })

  test('matches athlete registered events accurately', ({ assert }) => {
    // 50m / 100m / sprint matching
    assert.isTrue(isAthleteRegisteredForEvent('100 M [Individu - Utama]', '50 meter'))
    assert.isTrue(isAthleteRegisteredForEvent('80 M [Individu - Utama]', '50 meter'))
    assert.isTrue(isAthleteRegisteredForEvent('100 M [Individu - Utama]', '100 meter'))
    assert.isFalse(isAthleteRegisteredForEvent('4 x 100 M [Kumpulan - Utama]', '100 meter'))

    // Relays
    assert.isTrue(isAthleteRegisteredForEvent('4 x 50 M [Kumpulan - Utama]', '4x50 meter'))
    assert.isTrue(isAthleteRegisteredForEvent('4 x 100 M [Kumpulan - Utama]', '4x100 meter'))
    assert.isTrue(isAthleteRegisteredForEvent('4 x 200 M [Kumpulan - Utama]', '4x200 meter'))
    assert.isFalse(isAthleteRegisteredForEvent('100 M [Individu - Utama]', '4x100 meter'))

    // Field events
    assert.isTrue(isAthleteRegisteredForEvent('Lompat Jauh [Individu - Utama]', 'Lompat Jauh'))
    assert.isTrue(isAthleteRegisteredForEvent('Lompat Tinggi [Individu - Utama]', 'Lompat Tinggi'))
    assert.isTrue(isAthleteRegisteredForEvent('Lontar Peluru [Individu - Utama]', 'Lontar Peluru'))
    assert.isFalse(isAthleteRegisteredForEvent('Lompat Jauh [Individu - Utama]', 'Lontar Peluru'))
  })

  test('validates Anugerah Khas (Tahun 6 only) and Anugerah Harapan (Tahun 5 only) criteria', ({ assert }) => {
    // Tahun 6 events qualify for Anugerah Khas
    assert.equal(getEventYear('Tahun 6 Lelaki', '100 meter'), '6')
    assert.equal(getEventYear('Tahun 6 Perempuan', 'Lompat Tinggi'), '6')

    // Tahun 5 events qualify for Anugerah Harapan
    assert.equal(getEventYear('Tahun 5 Lelaki', '200 meter'), '5')
    assert.equal(getEventYear('Tahun 5 Perempuan', 'Lontar Peluru'), '5')

    // Other years do not qualify for T6 Anugerah Khas or T5 Anugerah Harapan
    assert.notEqual(getEventYear('Tahun 4 Lelaki', '100 meter'), '6')
    assert.notEqual(getEventYear('Tahun 4 Lelaki', '100 meter'), '5')
  })
})
