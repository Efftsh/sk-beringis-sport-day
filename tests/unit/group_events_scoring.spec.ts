import { test } from '@japa/runner'
import { isGroupEvent, calculateAthleteStandings } from '#services/event_matcher_service'

test.group('Group Relay Events & House Scoring Logic (4x50m, 4x100m, 4x200m)', () => {
  test('accurately identifies 4x50m, 4x100m, 4x200m, and sukaneka as group events', ({ assert }) => {
    assert.isTrue(isGroupEvent('4x50 meter'))
    assert.isTrue(isGroupEvent('4 x 50 meter'))
    assert.isTrue(isGroupEvent('4x100 meter'))
    assert.isTrue(isGroupEvent('4 x 100 M'))
    assert.isTrue(isGroupEvent('4x200 meter'))
    assert.isTrue(isGroupEvent('4 x 200 M'))
    assert.isTrue(isGroupEvent('Sukaneka Kumpulan'))
    assert.isTrue(isGroupEvent('Acara Relay'))

    // Individual events must not be identified as group events
    assert.isFalse(isGroupEvent('100 meter'))
    assert.isFalse(isGroupEvent('200 meter'))
    assert.isFalse(isGroupEvent('80 meter'))
    assert.isFalse(isGroupEvent('50 meter'))
    assert.isFalse(isGroupEvent('Lompat Jauh'))
    assert.isFalse(isGroupEvent('Lompat Tinggi'))
    assert.isFalse(isGroupEvent('Lontar Peluru'))
  })

  test('allocates MSSM standard 10, 7, 5 points to winning houses in group events', ({ assert }) => {
    const groupResult = [
      { place: 1, houseId: 'merah', points: 10, medal: 'gold' as const },
      { place: 2, houseId: 'biru', points: 7, medal: 'silver' as const },
      { place: 3, houseId: 'kuning', points: 5, medal: 'bronze' as const },
    ]

    const houseScores: Record<string, { points: number; gold: number; silver: number; bronze: number }> = {
      merah: { points: 0, gold: 0, silver: 0, bronze: 0 },
      biru: { points: 0, gold: 0, silver: 0, bronze: 0 },
      kuning: { points: 0, gold: 0, silver: 0, bronze: 0 },
      hijau: { points: 0, gold: 0, silver: 0, bronze: 0 },
    }

    groupResult.forEach((res) => {
      houseScores[res.houseId].points += res.points
      if (res.medal === 'gold') houseScores[res.houseId].gold += 1
      if (res.medal === 'silver') houseScores[res.houseId].silver += 1
      if (res.medal === 'bronze') houseScores[res.houseId].bronze += 1
    })

    assert.equal(houseScores['merah'].points, 10)
    assert.equal(houseScores['merah'].gold, 1, 'Rumah Merah receives 1 Gold medal directly')
    assert.equal(houseScores['biru'].points, 7)
    assert.equal(houseScores['biru'].silver, 1, 'Rumah Biru receives 1 Silver medal directly')
    assert.equal(houseScores['kuning'].points, 5)
    assert.equal(houseScores['kuning'].bronze, 1, 'Rumah Kuning receives 1 Bronze medal directly')
    assert.equal(houseScores['hijau'].points, 0)
  })

  test('accurately distributes relay medals (4x50, 4x100, 4x200) to assigned house athletes for Anugerah Khas & Harapan', ({ assert }) => {
    const completedEvents = [
      {
        code: 'A30',
        eventName: '4x100 meter',
        category: 'Tahun 6 Lelaki',
        stage: 'Akhir',
        results: [
          { place: 1, houseId: 'merah', points: 10 },
          { place: 2, houseId: 'biru', points: 7 },
        ],
      },
      {
        code: 'B22',
        eventName: '100 meter',
        category: 'Tahun 6 Lelaki',
        stage: 'Akhir',
        results: [
          { place: 1, houseId: 'merah', athleteName: 'Muhammad Danish', points: 7 },
          { place: 2, houseId: 'biru', athleteName: 'Rayyan Mikhail', points: 5 },
        ],
      },
    ]

    const registeredAthletes = [
      {
        id: 'ath-1',
        name: 'Muhammad Danish',
        class: '6 INOVATIF',
        gender: 'Lelaki',
        houseId: 'merah',
        events: ['100 M [Individu - Utama]', '4 x 100 M [Kumpulan - Utama]'],
      },
      {
        id: 'ath-2',
        name: 'Ahmad Faiz',
        class: '6 KREATIF',
        gender: 'Lelaki',
        houseId: 'merah',
        events: ['4 x 100 M [Kumpulan - Utama]'],
      },
      {
        id: 'ath-3',
        name: 'Rayyan Mikhail',
        class: '6 INTERAKTIF',
        gender: 'Lelaki',
        houseId: 'biru',
        events: ['100 M [Individu - Utama]', '4 x 100 M [Kumpulan - Utama]'],
      },
    ]

    const standings = calculateAthleteStandings(completedEvents, registeredAthletes)

    // Muhammad Danish won 100m (Gold, 7 pts) + 4x100m relay (Gold, 10 pts) = 2 Gold, 17 pts
    const danish = standings.find((a) => a.name === 'Muhammad Danish')
    assert.isDefined(danish)
    assert.equal(danish!.gold, 2, 'Danish gets 2 Gold medals (1 Individu + 1 Kumpulan)')
    assert.equal(danish!.individualGold, 1)
    assert.equal(danish!.groupGold, 1)
    assert.equal(danish!.totalPoints, 17)
    assert.equal(danish!.eventsJoined.length, 2)
    assert.isFalse(danish!.eventsJoined[1].isGroup, '100m is individual')
    assert.equal(danish!.eventsJoined[1].eventType, 'Individu')
    assert.isTrue(danish!.eventsJoined[0].isGroup, '4x100m is group/relay')
    assert.equal(danish!.eventsJoined[0].eventType, 'Kumpulan')

    // Ahmad Faiz only ran 4x100m relay (Gold, 10 pts)
    const faiz = standings.find((a) => a.name === 'Ahmad Faiz')
    assert.isDefined(faiz)
    assert.equal(faiz!.gold, 1)
    assert.equal(faiz!.groupGold, 1)
    assert.equal(faiz!.individualGold, 0)
    assert.equal(faiz!.totalPoints, 10)

    // Rayyan Mikhail got 2nd in 100m (Silver, 5 pts) + 2nd in 4x100m (Silver, 7 pts) = 2 Silver, 12 pts
    const rayyan = standings.find((a) => a.name === 'Rayyan Mikhail')
    assert.isDefined(rayyan)
    assert.equal(rayyan!.silver, 2)
    assert.equal(rayyan!.individualSilver, 1)
    assert.equal(rayyan!.groupSilver, 1)
    assert.equal(rayyan!.totalPoints, 12)
  })

  test('confirms 4x100m relay events are scheduled on Hari 1 (Day 1) and 4x50m on Hari 2', ({ assert }) => {
    const scheduledEvents = [
      { code: 'A23', eventName: '4x100 meter', category: 'Tahun 3 Perempuan', scheduledTime: '09:00 AM (Hari 1)' },
      { code: 'A24', eventName: '4x100 meter', category: 'Tahun 3 Lelaki', scheduledTime: '09:00 AM (Hari 1)' },
      { code: 'A25', eventName: '4x100 meter', category: 'Tahun 4 Perempuan', scheduledTime: '09:00 AM (Hari 1)' },
      { code: 'A26', eventName: '4x100 meter', category: 'Tahun 4 Lelaki', scheduledTime: '09:00 AM (Hari 1)' },
      { code: 'A27', eventName: '4x100 meter', category: 'Tahun 5 Perempuan', scheduledTime: '09:00 AM (Hari 1)' },
      { code: 'A28', eventName: '4x100 meter', category: 'Tahun 5 Lelaki', scheduledTime: '09:00 AM (Hari 1)' },
      { code: 'A29', eventName: '4x100 meter', category: 'Tahun 6 Perempuan', scheduledTime: '09:00 AM (Hari 1)' },
      { code: 'A30', eventName: '4x100 meter', category: 'Tahun 6 Lelaki', scheduledTime: '09:00 AM (Hari 1)' },
      { code: 'B23', eventName: '4x50 meter', category: 'Tahun 1 Perempuan', scheduledTime: '08:30 AM (Hari 2)' },
      { code: 'C01', eventName: '4x200 meter', category: 'Tahun 4 Perempuan', scheduledTime: '07:30 AM (Hari 3)' },
    ]

    const relay100Events = scheduledEvents.filter((e) => e.eventName.includes('4x100'))
    assert.equal(relay100Events.length, 8)
    relay100Events.forEach((e) => {
      assert.include(e.scheduledTime, 'Hari 1', `${e.code} (${e.category}) must only be scheduled on Hari 1`)
    })
  })
})
