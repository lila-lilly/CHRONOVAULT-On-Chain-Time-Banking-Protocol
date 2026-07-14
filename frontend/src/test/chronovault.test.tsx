import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { truncAddr, timeAgo, formatDeadline, MOCK_TASKS, MOCK_PROFILES } from '../lib/mockData'
import { STANDING_META, TASK_STATUS_META } from '../lib/constants'
import StandingBadge from '../components/StandingBadge'
import StatusPill from '../components/StatusPill'

// ─── truncAddr ────────────────────────────────────────────────────────────────

describe('truncAddr', () => {
  const ADDR = 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37'

  it('contains ellipsis', () => {
    expect(truncAddr(ADDR)).toContain('…')
  })

  it('is shorter than the original', () => {
    expect(truncAddr(ADDR).length).toBeLessThan(ADDR.length)
  })

  it('starts with first 6 chars by default', () => {
    expect(truncAddr(ADDR).startsWith('GDQP2K')).toBe(true)
  })

  it('ends with last 4 chars', () => {
    expect(truncAddr(ADDR).endsWith('W37')).toBe(true)
  })

  it('respects custom char count', () => {
    expect(truncAddr(ADDR, 4).startsWith('GDQP')).toBe(true)
  })
})

// ─── timeAgo ─────────────────────────────────────────────────────────────────

describe('timeAgo', () => {
  it('returns "today" for recent timestamps', () => {
    const now = Math.floor(Date.now() / 1000) - 100
    expect(timeAgo(now)).toBe('today')
  })

  it('returns "yesterday" for ~1 day ago', () => {
    const yesterday = Math.floor(Date.now() / 1000) - 86500
    expect(timeAgo(yesterday)).toBe('yesterday')
  })

  it('returns days for older timestamps', () => {
    const old = Math.floor(Date.now() / 1000) - 3 * 86400
    expect(timeAgo(old)).toBe('3d ago')
  })
})

// ─── formatDeadline ──────────────────────────────────────────────────────────

describe('formatDeadline', () => {
  it('returns Expired for past timestamp', () => {
    expect(formatDeadline(Math.floor(Date.now() / 1000) - 1000)).toBe('Expired')
  })

  it('shows days and hours for multi-day deadline', () => {
    const future = Math.floor(Date.now() / 1000) + 3 * 86400 + 7200
    const label  = formatDeadline(future)
    expect(label).toContain('3d')
    expect(label).toContain('2h')
  })

  it('shows only hours for sub-day deadline', () => {
    const future = Math.floor(Date.now() / 1000) + 5 * 3600
    expect(formatDeadline(future)).toBe('5h')
  })
})

// ─── MOCK_TASKS integrity ─────────────────────────────────────────────────────

describe('MOCK_TASKS', () => {
  it('has exactly 6 tasks', () => {
    expect(MOCK_TASKS.length).toBe(6)
  })

  it('all tasks have required fields', () => {
    MOCK_TASKS.forEach(t => {
      expect(t).toHaveProperty('id')
      expect(t).toHaveProperty('requester')
      expect(t).toHaveProperty('title')
      expect(t).toHaveProperty('category')
      expect(t).toHaveProperty('status')
      expect(t.hours).toBeGreaterThan(0)
      expect(t.hours).toBeLessThanOrEqual(40)
    })
  })

  it('all IDs are unique', () => {
    const ids = MOCK_TASKS.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers multiple statuses', () => {
    const statuses = new Set(MOCK_TASKS.map(t => t.status))
    expect(statuses.size).toBeGreaterThanOrEqual(4)
    expect(statuses.has('Open')).toBe(true)
    expect(statuses.has('Claimed')).toBe(true)
    expect(statuses.has('Completed')).toBe(true)
  })

  it('completed tasks have completed_at > 0', () => {
    MOCK_TASKS.filter(t => t.status === 'Completed').forEach(t => {
      expect(t.completed_at).toBeGreaterThan(0)
    })
  })

  it('open tasks have no provider assigned', () => {
    const EMPTY = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'
    MOCK_TASKS.filter(t => t.status === 'Open').forEach(t => {
      expect(t.provider).toBe(EMPTY)
    })
  })
})

// ─── MOCK_PROFILES integrity ──────────────────────────────────────────────────

describe('MOCK_PROFILES', () => {
  it('has 5 profiles', () => {
    expect(MOCK_PROFILES.length).toBe(5)
  })

  it('sorted by community_score descending', () => {
    for (let i = 0; i < MOCK_PROFILES.length - 1; i++) {
      expect(MOCK_PROFILES[i].community_score).toBeGreaterThanOrEqual(MOCK_PROFILES[i + 1].community_score)
    }
  })

  it('all have valid standings', () => {
    const valid = Object.keys(STANDING_META)
    MOCK_PROFILES.forEach(p => expect(valid).toContain(p.standing))
  })

  it('hours_given >= 0 for all', () => {
    MOCK_PROFILES.forEach(p => expect(p.hours_given).toBeGreaterThanOrEqual(0))
  })
})

// ─── STANDING_META ────────────────────────────────────────────────────────────

describe('STANDING_META', () => {
  it('defines exactly 6 standings', () => {
    expect(Object.keys(STANDING_META).length).toBe(6)
  })

  it('all have required fields', () => {
    Object.values(STANDING_META).forEach(m => {
      expect(m.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(m.glyph).toBeTruthy()
      expect(m.label).toBeTruthy()
      expect(m.desc).toBeTruthy()
      expect(typeof m.min).toBe('number')
    })
  })

  it('min scores are strictly ascending', () => {
    const mins = Object.values(STANDING_META).map(m => m.min)
    for (let i = 0; i < mins.length - 1; i++) {
      expect(mins[i]).toBeLessThan(mins[i + 1])
    }
  })

  it('Seedling starts at 0', () => {
    expect(STANDING_META['Seedling'].min).toBe(0)
  })

  it('Elder has highest min', () => {
    const max = Math.max(...Object.values(STANDING_META).map(m => m.min))
    expect(STANDING_META['Elder'].min).toBe(max)
  })
})

// ─── TASK_STATUS_META ─────────────────────────────────────────────────────────

describe('TASK_STATUS_META', () => {
  it('defines all 6 statuses', () => {
    const expected = ['Open','Claimed','Submitted','Completed','Cancelled','Disputed']
    expected.forEach(s => expect(TASK_STATUS_META[s]).toBeDefined())
  })

  it('all have color, label, desc', () => {
    Object.values(TASK_STATUS_META).forEach(m => {
      expect(m.color).toBeTruthy()
      expect(m.label).toBeTruthy()
      expect(m.desc).toBeTruthy()
    })
  })
})

// ─── Scoring Algorithm (JS mirror of Rust) ────────────────────────────────────

describe('Community Score Algorithm', () => {
  function calcScore(given: number, taken: number, tasksGiven: number): number {
    const base = given * 80 + tasksGiven * 20
    const cost = taken * 15
    const ratioAdj = given >= taken
      ? Math.min(given - taken, 20) * 10
      : -(Math.min(taken - given, 10) * 8)
    return Math.max(0, base - cost + ratioAdj)
  }

  function scoreToStanding(score: number): string {
    if (score < 100)  return 'Seedling'
    if (score < 250)  return 'Grower'
    if (score < 500)  return 'Contributor'
    if (score < 800)  return 'Steward'
    if (score < 1200) return 'Pillar'
    return 'Elder'
  }

  it('returns 0 for new member with no activity', () => {
    expect(calcScore(0, 0, 0)).toBe(0)
  })

  it('gives 80 pts per hour contributed', () => {
    expect(calcScore(1, 0, 0)).toBe(80 + 10) // 80 base + 10 ratio bonus
  })

  it('awards task diversity bonus', () => {
    const withTasks    = calcScore(5, 0, 3)
    const withoutTasks = calcScore(5, 0, 0)
    expect(withTasks).toBeGreaterThan(withoutTasks)
    expect(withTasks - withoutTasks).toBe(3 * 20)
  })

  it('penalises taking hours', () => {
    const giver = calcScore(5, 0, 0)
    const taker = calcScore(5, 5, 0)
    expect(giver).toBeGreaterThan(taker)
  })

  it('give-surplus bonus capped at 20 hours × 10 = 200', () => {
    const lowSurplus  = calcScore(5, 0,  0)  // surplus 5 → +50
    const highSurplus = calcScore(30, 0, 0)  // surplus 30 → capped at 200
    // 30*80 + min(30,20)*10 = 2400 + 200 = 2600
    expect(highSurplus).toBe(2600)
    // 5*80 + min(5,20)*10 = 400 + 50 = 450
    expect(lowSurplus).toBe(450)
  })

  it('take-deficit penalty capped at 10 hours × 8 = 80', () => {
    // 0 given, 20 taken → 0 - 20*15 - min(20,10)*8 = 0-300-80 = floored to 0
    expect(calcScore(0, 20, 0)).toBe(0)
  })

  it('score never goes below 0', () => {
    expect(calcScore(0, 100, 0)).toBe(0)
    expect(calcScore(0, 1,   0)).toBe(0)
  })

  it('standing boundaries are correct', () => {
    expect(scoreToStanding(0)).toBe('Seedling')
    expect(scoreToStanding(99)).toBe('Seedling')
    expect(scoreToStanding(100)).toBe('Grower')
    expect(scoreToStanding(250)).toBe('Contributor')
    expect(scoreToStanding(500)).toBe('Steward')
    expect(scoreToStanding(800)).toBe('Pillar')
    expect(scoreToStanding(1200)).toBe('Elder')
    expect(scoreToStanding(9999)).toBe('Elder')
  })
})

// ─── TIME credit escrow logic ─────────────────────────────────────────────────

describe('TIME Credit Escrow', () => {
  interface Wallet { balance: number }

  function postTask(wallet: Wallet, hours: number): { success: boolean; newBalance: number; error?: string } {
    if (hours < 1 || hours > 40) return { success: false, newBalance: wallet.balance, error: 'hours out of range' }
    if (wallet.balance < hours)  return { success: false, newBalance: wallet.balance, error: 'insufficient balance' }
    return { success: true, newBalance: wallet.balance - hours }
  }

  function cancelTask(wallet: Wallet, hours: number): number {
    return wallet.balance + hours // refund
  }

  function confirmTask(providerWallet: Wallet, hours: number): number {
    return providerWallet.balance + hours // pay provider
  }

  it('posting a task deducts credits from requester', () => {
    const result = postTask({ balance: 10 }, 3)
    expect(result.success).toBe(true)
    expect(result.newBalance).toBe(7)
  })

  it('posting fails if balance is insufficient', () => {
    const result = postTask({ balance: 2 }, 5)
    expect(result.success).toBe(false)
    expect(result.error).toBe('insufficient balance')
  })

  it('posting fails for 0 hours', () => {
    const result = postTask({ balance: 10 }, 0)
    expect(result.success).toBe(false)
    expect(result.error).toBe('hours out of range')
  })

  it('posting fails for >40 hours', () => {
    const result = postTask({ balance: 100 }, 41)
    expect(result.success).toBe(false)
    expect(result.error).toBe('hours out of range')
  })

  it('cancelling refunds credits', () => {
    const newBalance = cancelTask({ balance: 7 }, 3)
    expect(newBalance).toBe(10)
  })

  it('confirming transfers credits to provider', () => {
    const newBalance = confirmTask({ balance: 0 }, 3)
    expect(newBalance).toBe(3)
  })

  it('exact balance is accepted', () => {
    const result = postTask({ balance: 5 }, 5)
    expect(result.success).toBe(true)
    expect(result.newBalance).toBe(0)
  })
})

// ─── Component: StandingBadge ─────────────────────────────────────────────────

describe('StandingBadge', () => {
  it('renders standing label', () => {
    render(<StandingBadge standing="Elder" />)
    expect(screen.getByText('Elder')).toBeInTheDocument()
  })

  it('renders glyph by default', () => {
    render(<StandingBadge standing="Elder" />)
    expect(screen.getByText('✸')).toBeInTheDocument()
  })

  it('hides glyph when showGlyph=false', () => {
    render(<StandingBadge standing="Elder" showGlyph={false} />)
    expect(screen.queryByText('✸')).not.toBeInTheDocument()
  })

  it('falls back to Seedling for unknown', () => {
    render(<StandingBadge standing="Unknown" />)
    expect(screen.getByText('Seedling')).toBeInTheDocument()
  })
})

// ─── Component: StatusPill ────────────────────────────────────────────────────

describe('StatusPill', () => {
  it('renders Open status', () => {
    render(<StatusPill status="Open" />)
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('renders Completed status', () => {
    render(<StatusPill status="Completed" />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('renders Disputed status', () => {
    render(<StatusPill status="Disputed" />)
    expect(screen.getByText('Disputed')).toBeInTheDocument()
  })

  it('renders Submitted status as Under Review', () => {
    render(<StatusPill status="Submitted" />)
    expect(screen.getByText('Under Review')).toBeInTheDocument()
  })

  it('renders Claimed status as In Progress', () => {
    render(<StatusPill status="Claimed" />)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })
})
