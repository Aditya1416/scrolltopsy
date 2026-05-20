import { IDBFactory } from 'fake-indexeddb'
import { saveSession, getProfile, getSessions, deleteAllLocalData } from './storage.js'

function resetIDB() {
  Object.defineProperty(globalThis, 'indexedDB', {
    value: new IDBFactory(),
    writable: true,
    configurable: true,
  })
}

beforeEach(() => {
  resetIDB()
})

// ─── saveSession ─────────────────────────────────────────────────────────────

describe('saveSession', () => {
  it('saves to localStorage and increments totalSessions and totalMins', async () => {
    await saveSession(10)
    const profile = await getProfile()
    expect(profile.totalSessions).toBe(1)
    expect(profile.totalMins).toBe(10)
    const raw = JSON.parse(localStorage.getItem('sct_data'))
    expect(raw.sessions).toHaveLength(1)
    expect(raw.sessions[0].durationMins).toBe(10)
  })

  it('accumulates totalMins across multiple sessions', async () => {
    await saveSession(5)
    await saveSession(15)
    const profile = await getProfile()
    expect(profile.totalSessions).toBe(2)
    expect(profile.totalMins).toBe(20)
  })

  it('tracks longestSessionMins correctly', async () => {
    await saveSession(10)
    await saveSession(30)
    await saveSession(20)
    const profile = await getProfile()
    expect(profile.longestSessionMins).toBe(30)
  })

  it('does not overwrite longestSessionMins with a shorter session', async () => {
    await saveSession(50)
    await saveSession(5)
    const profile = await getProfile()
    expect(profile.longestSessionMins).toBe(50)
  })

  it('sets meta.firstSessionMs on the first session', async () => {
    const before = Date.now()
    await saveSession(5)
    const raw = JSON.parse(localStorage.getItem('sct_data'))
    expect(raw.meta.firstSessionMs).toBeGreaterThanOrEqual(before)
  })
})

// ─── getProfile / getData ─────────────────────────────────────────────────────

describe('getProfile / getData', () => {
  it('returns default schema when storage is empty', async () => {
    const profile = await getProfile()
    expect(profile.totalSessions).toBe(0)
    expect(profile.totalMins).toBe(0)
    expect(profile.scrolltype).toBe('casual self-saboteur')
  })

  it('restores from IndexedDB when localStorage is cleared', async () => {
    await saveSession(20)
    localStorage.clear()
    const profile = await getProfile()
    expect(profile.totalSessions).toBe(1)
    expect(profile.totalMins).toBe(20)
  })

  it('worstHour reflects the most frequently used hour', async () => {
    vi.setSystemTime(new Date('2026-01-05T14:00:00'))
    await saveSession(5)
    await saveSession(5)
    vi.setSystemTime(new Date('2026-01-05T22:00:00'))
    await saveSession(5)
    vi.useRealTimers()
    const profile = await getProfile()
    expect(profile.worstHour).toBe(14)
  })

  it('worstDay reflects the most frequently used day', async () => {
    vi.setSystemTime(new Date('2026-01-05T14:00:00')) // Monday
    await saveSession(5)
    await saveSession(5)
    vi.setSystemTime(new Date('2026-01-06T14:00:00')) // Tuesday
    await saveSession(5)
    vi.useRealTimers()
    const profile = await getProfile()
    expect(profile.worstDay).toBe('monday')
  })
})

// ─── recalculateScrolltype (triggered via saveSession) ────────────────────────

describe('recalculateScrolltype', () => {
  it('classifies late-night doom merchant when worstHour >= 22', async () => {
    vi.setSystemTime(new Date('2026-01-05T23:00:00'))
    await saveSession(5)
    vi.useRealTimers()
    const profile = await getProfile()
    expect(profile.scrolltype).toBe('late-night doom merchant')
  })

  it('classifies late-night doom merchant when worstHour <= 2', async () => {
    vi.setSystemTime(new Date('2026-01-05T01:00:00'))
    await saveSession(5)
    vi.useRealTimers()
    const profile = await getProfile()
    expect(profile.scrolltype).toBe('late-night doom merchant')
  })

  it('classifies morning anxiety checker when worstHour is 6-9', async () => {
    vi.setSystemTime(new Date('2026-01-05T07:00:00'))
    await saveSession(5)
    vi.useRealTimers()
    const profile = await getProfile()
    expect(profile.scrolltype).toBe('morning anxiety checker')
  })

  it('classifies deep void diver when longestSession > 45 mins', async () => {
    vi.setSystemTime(new Date('2026-01-05T14:00:00'))
    await saveSession(60)
    vi.useRealTimers()
    const profile = await getProfile()
    expect(profile.scrolltype).toBe('deep void diver')
  })

  it('classifies compulsive refresher when > 4 sessions per day', async () => {
    // 7 sessions triggers recalculation (7 % 7 === 0)
    vi.setSystemTime(new Date('2026-01-05T14:00:00'))
    for (let i = 0; i < 7; i++) await saveSession(10)
    vi.useRealTimers()
    const profile = await getProfile()
    expect(profile.scrolltype).toBe('compulsive refresher')
  })

  it('classifies weekend void walker when worstDay is saturday', async () => {
    // 2026-01-03 is a Saturday
    vi.setSystemTime(new Date('2026-01-03T14:00:00'))
    await saveSession(5)
    vi.useRealTimers()
    const profile = await getProfile()
    expect(profile.scrolltype).toBe('weekend void walker')
  })

  it('classifies casual self-saboteur by default', async () => {
    // 2026-01-05 is a Monday, hour 14, short session
    vi.setSystemTime(new Date('2026-01-05T14:00:00'))
    await saveSession(5)
    vi.useRealTimers()
    const profile = await getProfile()
    expect(profile.scrolltype).toBe('casual self-saboteur')
  })
})

// ─── deleteAllLocalData ───────────────────────────────────────────────────────

describe('deleteAllLocalData', () => {
  it('clears localStorage', async () => {
    await saveSession(10)
    await deleteAllLocalData()
    expect(localStorage.getItem('sct_data')).toBeNull()
  })

  it('returns default data after deletion', async () => {
    await saveSession(10)
    await deleteAllLocalData()
    resetIDB()
    const profile = await getProfile()
    expect(profile.totalSessions).toBe(0)
    expect(profile.totalMins).toBe(0)
  })
})
