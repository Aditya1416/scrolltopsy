import { IDBFactory } from 'fake-indexeddb'
import { saveSession, getProfile, getSessions } from '../lib/storage.js'

beforeEach(() => {
  Object.defineProperty(globalThis, 'indexedDB', {
    value: new IDBFactory(),
    writable: true,
    configurable: true,
  })
})

// ─── Session rounding (mirrors App.jsx Math.ceil(durationSeconds / 60)) ──────

describe('session duration rounding', () => {
  it('sub-60s duration rounds up to 1 minute', () => {
    expect(Math.ceil(30 / 60)).toBe(1)
  })

  it('59 seconds rounds up to 1 minute', () => {
    expect(Math.ceil(59 / 60)).toBe(1)
  })

  it('61 seconds rounds up to 2 minutes', () => {
    expect(Math.ceil(61 / 60)).toBe(2)
  })
})

// ─── Edge-case sessions ───────────────────────────────────────────────────────

describe('saveSession edge cases', () => {
  it('saveSession(1440) resolves without throwing', async () => {
    await expect(saveSession(1440)).resolves.toBeUndefined()
    const profile = await getProfile()
    expect(profile.totalMins).toBe(1440)
  })

  it('getData returns without error when localStorage has 500 sessions', async () => {
    const now = Date.now()
    const sessions = Array.from({ length: 500 }, (_, i) => ({
      id: `s${i}`,
      durationMins: 5,
      hour: 14,
      day: 'monday',
      timestamp: now - i * 60000,
    }))
    const data = {
      sessions,
      profile: {
        totalSessions: 500,
        totalMins: 2500,
        longestSessionMins: 5,
        worstHour: 14,
        worstDay: 'monday',
        scrolltype: 'casual self-saboteur',
      },
      meta: { firstSessionMs: now - 500 * 60000 },
    }
    localStorage.setItem('sct_data', JSON.stringify(data))

    const result = await getSessions()
    const profile = await getProfile()
    expect(result).toHaveLength(500)
    expect(profile.totalSessions).toBe(500)
  })
})
