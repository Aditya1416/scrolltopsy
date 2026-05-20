import { normaliseName, storeAppForSession, getAppForSession, getTopApp } from './appData.js'

// ─── normaliseName ────────────────────────────────────────────────────────────

describe('normaliseName', () => {
  it('returns known friendly name for a known package', () => {
    expect(normaliseName('Instagram', 'com.instagram.android')).toBe('Instagram')
  })

  it('returns TikTok for the secondary TikTok package', () => {
    expect(normaliseName('TikTok', 'com.ss.android.ugc.trill')).toBe('TikTok')
  })

  it('returns rawName when packageName is unknown', () => {
    expect(normaliseName('MyApp', 'com.unknown.app')).toBe('MyApp')
  })

  it('returns rawName when packageName is null', () => {
    expect(normaliseName('SomeApp', null)).toBe('SomeApp')
  })
})

// ─── storeAppForSession / getAppForSession ────────────────────────────────────

describe('storeAppForSession / getAppForSession', () => {
  it('stores and retrieves an app for a session', () => {
    storeAppForSession('session-1', 'Instagram')
    expect(getAppForSession('session-1')).toBe('Instagram')
  })

  it('returns null for an unknown session', () => {
    expect(getAppForSession('does-not-exist')).toBeNull()
  })

  it('stores multiple sessions independently', () => {
    storeAppForSession('s-a', 'TikTok')
    storeAppForSession('s-b', 'YouTube')
    expect(getAppForSession('s-a')).toBe('TikTok')
    expect(getAppForSession('s-b')).toBe('YouTube')
  })
})

// ─── getTopApp ────────────────────────────────────────────────────────────────

describe('getTopApp', () => {
  it('returns the most frequent app across sessions', () => {
    storeAppForSession('t1', 'Instagram')
    storeAppForSession('t2', 'Instagram')
    storeAppForSession('t3', 'TikTok')
    const sessions = [{ id: 't1' }, { id: 't2' }, { id: 't3' }]
    expect(getTopApp(sessions)).toBe('Instagram')
  })

  it('returns null when no sessions have app data', () => {
    const sessions = [{ id: 'unknown-x' }, { id: 'unknown-y' }]
    expect(getTopApp(sessions)).toBeNull()
  })

  it('returns null for an empty session list', () => {
    expect(getTopApp([])).toBeNull()
  })
})
