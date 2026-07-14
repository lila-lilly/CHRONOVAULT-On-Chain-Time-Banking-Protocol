import type { Task, MemberProfile } from './store'

export const truncAddr = (a: string, n = 6) => `${a.slice(0, n)}…${a.slice(-4)}`
export const timeAgo   = (ts: number) => {
  const d = Math.floor((Date.now() / 1000 - ts) / 86400)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  return `${d}d ago`
}
export const formatDeadline = (ts: number) => {
  const diff = ts - Math.floor(Date.now() / 1000)
  if (diff <= 0) return 'Expired'
  const d = Math.floor(diff / 86400)
  const h = Math.floor((diff % 86400) / 3600)
  return d > 0 ? `${d}d ${h}h` : `${h}h`
}

const A = 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37'
const B = 'GBUHRWJBKGRAOXA5VD4DQNWH7NG3QKZXHQMK6QNMKK2FOPWWK3UXPBS'
const C = 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGB9ABODAZDBEKVX7BBHPS'
const D = 'GBHSCSZBKS5SFXNM5OLZJR4E2MGBDKJBCQZQKGXFB5MBVKX4IIYOQK'
const E = 'GCHNPAHOGVKZVN3KG4DNUXQRRLXBCFSCHHZRXZRN4MMRHVZQMFUKYOF'
const EMPTY = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'

export const MOCK_TASKS: Task[] = [
  {
    id: 0, requester: A, provider: EMPTY,
    title: 'Set up GitHub Actions CI for Rust/Soroban project',
    description: 'Need a working CI pipeline: cargo fmt, clippy, tests, WASM build, and deploy to testnet on merge to main.',
    category: 'DevOps',
    hours: 3, deadline: Math.floor(Date.now() / 1000) + 432000,
    status: 'Open', created_at: Math.floor(Date.now() / 1000) - 7200, completed_at: 0,
  },
  {
    id: 1, requester: B, provider: C,
    title: 'Write technical docs for a Soroban DEX protocol',
    description: 'Comprehensive README + API docs for a constant-product AMM. Include diagrams and code examples.',
    category: 'Writing & Docs',
    hours: 5, deadline: Math.floor(Date.now() / 1000) + 259200,
    status: 'Claimed', created_at: Math.floor(Date.now() / 1000) - 86400, completed_at: 0,
  },
  {
    id: 2, requester: C, provider: D,
    title: 'Design a logo and brand kit for a DeFi protocol',
    description: 'Modern, trustworthy logo with color palette, typography guide, and icon set. Deliver SVG + Figma source.',
    category: 'Design & UI',
    hours: 8, deadline: Math.floor(Date.now() / 1000) + 604800,
    status: 'Submitted', created_at: Math.floor(Date.now() / 1000) - 172800, completed_at: 0,
  },
  {
    id: 3, requester: D, provider: A,
    title: 'Audit a Soroban token contract for security vulnerabilities',
    description: 'Manual review of a 400-line Soroban token. Check for reentrancy, overflow, auth bypass. Deliver report.',
    category: 'Security Review',
    hours: 6, deadline: Math.floor(Date.now() / 1000) - 86400,
    status: 'Completed', created_at: Math.floor(Date.now() / 1000) - 604800, completed_at: Math.floor(Date.now() / 1000) - 86400,
  },
  {
    id: 4, requester: E, provider: EMPTY,
    title: 'Build a React dashboard for on-chain analytics',
    description: 'Display TVL, volume, and user metrics fetched from Soroban events. Mobile-responsive. Recharts preferred.',
    category: 'Web Development',
    hours: 10, deadline: Math.floor(Date.now() / 1000) + 864000,
    status: 'Open', created_at: Math.floor(Date.now() / 1000) - 3600, completed_at: 0,
  },
  {
    id: 5, requester: A, provider: E,
    title: 'Translate whitepaper from English to Spanish',
    description: '12-page DeFi whitepaper, technical terminology must be precise. Deliver as Markdown.',
    category: 'Translation',
    hours: 4, deadline: Math.floor(Date.now() / 1000) + 172800,
    status: 'Claimed', created_at: Math.floor(Date.now() / 1000) - 43200, completed_at: 0,
  },
]

export const MOCK_PROFILES: MemberProfile[] = [
  { member: A, hours_given: 18, hours_taken: 7,  tasks_given: 6, tasks_taken: 3, community_score: 1380, standing: 'Elder',       joined_at: Math.floor(Date.now()/1000)-7776000, last_active: Math.floor(Date.now()/1000)-3600   },
  { member: B, hours_given: 12, hours_taken: 9,  tasks_given: 4, tasks_taken: 4, community_score: 795,  standing: 'Steward',     joined_at: Math.floor(Date.now()/1000)-5184000, last_active: Math.floor(Date.now()/1000)-86400  },
  { member: C, hours_given: 8,  hours_taken: 5,  tasks_given: 3, tasks_taken: 3, community_score: 490,  standing: 'Contributor', joined_at: Math.floor(Date.now()/1000)-2592000, last_active: Math.floor(Date.now()/1000)-172800 },
  { member: D, hours_given: 5,  hours_taken: 3,  tasks_given: 2, tasks_taken: 2, community_score: 245,  standing: 'Grower',      joined_at: Math.floor(Date.now()/1000)-1296000, last_active: Math.floor(Date.now()/1000)-259200 },
  { member: E, hours_given: 2,  hours_taken: 1,  tasks_given: 1, tasks_taken: 1, community_score: 95,   standing: 'Seedling',    joined_at: Math.floor(Date.now()/1000)-432000,  last_active: Math.floor(Date.now()/1000)-43200  },
]
