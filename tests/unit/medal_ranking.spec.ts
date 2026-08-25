import { test } from '@japa/runner'

export interface HouseStanding {
  id: string
  name: string
  gold: number
  silver: number
  bronze: number
  points: number
}

export function sortHouseStandings(houses: HouseStanding[]): HouseStanding[] {
  return [...houses].sort((a, b) => {
    return (
      b.gold - a.gold ||
      b.silver - a.silver ||
      b.bronze - a.bronze ||
      b.points - a.points
    )
  })
}

test.group('Olympic Medal Tally Ranking System', () => {
  test('ranks house with higher gold medals first even with fewer points', ({ assert }) => {
    const houses: HouseStanding[] = [
      { id: 'biru', name: 'Biru', gold: 3, silver: 1, bronze: 1, points: 20 },
      { id: 'merah', name: 'Merah', gold: 5, silver: 0, bronze: 0, points: 25 },
      { id: 'hijau', name: 'Hijau', gold: 2, silver: 8, bronze: 8, points: 42 }, // higher points, but fewer golds
      { id: 'kuning', name: 'Kuning', gold: 1, silver: 2, bronze: 2, points: 13 },
    ]

    const sorted = sortHouseStandings(houses)

    assert.equal(sorted[0].id, 'merah') // 5 Gold
    assert.equal(sorted[1].id, 'biru')  // 3 Gold
    assert.equal(sorted[2].id, 'hijau') // 2 Gold (even though 42 pts)
    assert.equal(sorted[3].id, 'kuning') // 1 Gold
  })

  test('breaks gold draw using silver medals count', ({ assert }) => {
    const houses: HouseStanding[] = [
      { id: 'biru', name: 'Biru', gold: 4, silver: 5, bronze: 1, points: 36 },
      { id: 'merah', name: 'Merah', gold: 4, silver: 2, bronze: 6, points: 32 },
      { id: 'hijau', name: 'Hijau', gold: 1, silver: 1, bronze: 1, points: 9 },
      { id: 'kuning', name: 'Kuning', gold: 4, silver: 6, bronze: 0, points: 38 },
    ]

    const sorted = sortHouseStandings(houses)

    assert.equal(sorted[0].id, 'kuning') // 4 Gold, 6 Silver
    assert.equal(sorted[1].id, 'biru')   // 4 Gold, 5 Silver
    assert.equal(sorted[2].id, 'merah')  // 4 Gold, 2 Silver
    assert.equal(sorted[3].id, 'hijau')  // 1 Gold
  })

  test('breaks silver draw using bronze medals count', ({ assert }) => {
    const houses: HouseStanding[] = [
      { id: 'merah', name: 'Merah', gold: 3, silver: 2, bronze: 5, points: 26 },
      { id: 'biru', name: 'Biru', gold: 3, silver: 2, bronze: 2, points: 23 },
      { id: 'kuning', name: 'Kuning', gold: 3, silver: 2, bronze: 7, points: 28 },
      { id: 'hijau', name: 'Hijau', gold: 3, silver: 2, bronze: 0, points: 21 },
    ]

    const sorted = sortHouseStandings(houses)

    assert.equal(sorted[0].id, 'kuning') // 3 Gold, 2 Silver, 7 Bronze
    assert.equal(sorted[1].id, 'merah')  // 3 Gold, 2 Silver, 5 Bronze
    assert.equal(sorted[2].id, 'biru')   // 3 Gold, 2 Silver, 2 Bronze
    assert.equal(sorted[3].id, 'hijau')  // 3 Gold, 2 Silver, 0 Bronze
  })

  test('breaks complete medal tie using total points', ({ assert }) => {
    const houses: HouseStanding[] = [
      { id: 'merah', name: 'Merah', gold: 2, silver: 2, bronze: 2, points: 18 },
      { id: 'biru', name: 'Biru', gold: 2, silver: 2, bronze: 2, points: 20 },
    ]

    const sorted = sortHouseStandings(houses)

    assert.equal(sorted[0].id, 'biru')   // 20 points
    assert.equal(sorted[1].id, 'merah')  // 18 points
  })
})
