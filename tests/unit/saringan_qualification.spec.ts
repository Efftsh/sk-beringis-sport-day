import { test } from '@japa/runner'

export interface RunnerResult {
  athleteName: string
  houseId: string
  recordValue: string
  lane?: number
  place?: number
}

export function parseTimeToSeconds(val?: string): number {
  if (!val || val.trim() === '') return 999999
  const clean = val.toLowerCase().replace(/s$/, '').trim()
  if (clean.includes(':')) {
    const parts = clean.split(':')
    const mins = parseFloat(parts[0]) || 0
    const secs = parseFloat(parts[1]) || 0
    return mins * 60 + secs
  }
  const secs = parseFloat(clean)
  return isNaN(secs) || secs <= 0 ? 999999 : secs
}

export function rankSaringanRunners(runners: RunnerResult[]): RunnerResult[] {
  const sorted = [...runners].sort((a, b) => {
    return parseTimeToSeconds(a.recordValue) - parseTimeToSeconds(b.recordValue)
  })

  return sorted.map((r, i) => ({
    ...r,
    place: i + 1,
  }))
}

export function linkFinalistsToPodium(finalists: RunnerResult[]) {
  return [
    { place: 1, medal: 'gold', points: 7, athleteName: finalists[0]?.athleteName || '', houseId: finalists[0]?.houseId || '' },
    { place: 2, medal: 'silver', points: 5, athleteName: finalists[1]?.athleteName || '', houseId: finalists[1]?.houseId || '' },
    { place: 3, medal: 'bronze', points: 3, athleteName: finalists[2]?.athleteName || '', houseId: finalists[2]?.houseId || '' },
  ]
}

test.group('200m Saringan (6 Runners to 6 Lanes Final)', () => {
  test('ranks 6 saringan competitors (Lorong 1-6) by fastest time and links to 200m Final', ({ assert }) => {
    const saringanRunners: RunnerResult[] = [
      { athleteName: 'Ahmad (Lorong 1)', houseId: 'merah', recordValue: '28.50s', lane: 1 },
      { athleteName: 'Badrul (Lorong 2)', houseId: 'biru', recordValue: '27.90s', lane: 2 },
      { athleteName: 'Chong (Lorong 3)', houseId: 'kuning', recordValue: '29.10s', lane: 3 },
      { athleteName: 'Danial (Lorong 4)', houseId: 'hijau', recordValue: '30.20s', lane: 4 },
      { athleteName: 'Emir (Lorong 5)', houseId: 'merah', recordValue: '26.80s', lane: 5 },
      { athleteName: 'Farhan (Lorong 6)', houseId: 'biru', recordValue: '28.10s', lane: 6 },
    ]

    const ranked = rankSaringanRunners(saringanRunners)

    assert.equal(ranked.length, 6)

    // 1st: Emir (26.80s)
    assert.equal(ranked[0].athleteName, 'Emir (Lorong 5)')
    assert.equal(ranked[0].place, 1)

    // 2nd: Gopal/Badrul (27.90s)
    assert.equal(ranked[1].athleteName, 'Badrul (Lorong 2)')
    assert.equal(ranked[1].place, 2)

    // 3rd: Farhan (28.10s)
    assert.equal(ranked[2].athleteName, 'Farhan (Lorong 6)')
    assert.equal(ranked[2].place, 3)

    // 6th: Danial (30.20s)
    assert.equal(ranked[5].athleteName, 'Danial (Lorong 4)')
    assert.equal(ranked[5].place, 6)

    // Check automatic pre-filling into 200m Final podium
    const finalPodium = linkFinalistsToPodium(ranked)
    assert.equal(finalPodium[0].athleteName, 'Emir (Lorong 5)')
    assert.equal(finalPodium[0].points, 7)
    assert.equal(finalPodium[1].athleteName, 'Badrul (Lorong 2)')
    assert.equal(finalPodium[1].points, 5)
    assert.equal(finalPodium[2].athleteName, 'Farhan (Lorong 6)')
    assert.equal(finalPodium[2].points, 3)
  })
})
