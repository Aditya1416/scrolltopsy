import { classifyWithApp } from './appClassifier.js'

function profile(overrides = {}) {
  return {
    worstHour: 14,
    longestSessionMins: 20,
    scrolltype: 'casual self-saboteur',
    ...overrides,
  }
}

function patterns(overrides = {}) {
  return { relapsing: false, sessionCountToday: 1, ...overrides }
}

// ─── Instagram ────────────────────────────────────────────────────────────────

describe('Instagram', () => {
  it('returns rabbit hole diver during afternoon hours', () => {
    expect(classifyWithApp(profile({ worstHour: 14 }), patterns(), 'Instagram'))
      .toBe('instagram rabbit hole diver')
  })

  it('returns late-night instagram void diver for night hours', () => {
    expect(classifyWithApp(profile({ worstHour: 23 }), patterns(), 'Instagram'))
      .toBe('late-night instagram void diver')
  })

  it('returns morning instagram anxiety checker for morning hours', () => {
    expect(classifyWithApp(profile({ worstHour: 7 }), patterns(), 'Instagram'))
      .toBe('morning instagram anxiety checker')
  })
})

// ─── TikTok ───────────────────────────────────────────────────────────────────

describe('TikTok', () => {
  it('returns tiktok time sink architect during the day', () => {
    expect(classifyWithApp(profile({ worstHour: 14 }), patterns(), 'TikTok'))
      .toBe('tiktok time sink architect')
  })

  it('returns late-night tiktok spiral navigator at night', () => {
    expect(classifyWithApp(profile({ worstHour: 1 }), patterns(), 'TikTok'))
      .toBe('late-night tiktok spiral navigator')
  })
})

// ─── YouTube ──────────────────────────────────────────────────────────────────

describe('YouTube', () => {
  it('returns youtube deep dive diver for long sessions', () => {
    expect(classifyWithApp(profile({ worstHour: 14, longestSessionMins: 60 }), patterns(), 'YouTube'))
      .toBe('youtube deep dive diver')
  })

  it('returns late-night youtube abyss crawler at night', () => {
    expect(classifyWithApp(profile({ worstHour: 23 }), patterns(), 'YouTube'))
      .toBe('late-night youtube abyss crawler')
  })
})

// ─── Other apps ───────────────────────────────────────────────────────────────

describe('other apps', () => {
  it('returns reddit thread archaeologist', () => {
    expect(classifyWithApp(profile(), patterns(), 'Reddit'))
      .toBe('reddit thread archaeologist')
  })

  it('returns x/twitter doom feeder in the afternoon', () => {
    expect(classifyWithApp(profile({ worstHour: 14 }), patterns(), 'X / Twitter'))
      .toBe('x / twitter doom feeder')
  })
})

// ─── No topApp ────────────────────────────────────────────────────────────────

describe('no topApp', () => {
  it('returns profile.scrolltype when topApp is null', () => {
    const p = profile({ scrolltype: 'deep void diver' })
    expect(classifyWithApp(p, patterns(), null)).toBe('deep void diver')
  })

  it('returns compulsive relapse engine when relapsing with many sessions', () => {
    const p = profile({ scrolltype: 'casual self-saboteur' })
    const pat = patterns({ relapsing: true, sessionCountToday: 5 })
    expect(classifyWithApp(p, pat, null)).toBe('compulsive relapse engine')
  })
})
