export const NETWORK_PASSPHRASE   = 'Test SDF Network ; September 2015'
export const SOROBAN_RPC_URL      = 'https://soroban-testnet.stellar.org'
export const FRIENDBOT_URL        = 'https://friendbot.stellar.org'

export const TIME_BANK_ID         = import.meta.env.VITE_TIME_BANK_ID         || ''
export const COMMUNITY_LEDGER_ID  = import.meta.env.VITE_COMMUNITY_LEDGER_ID  || ''

export const STANDING_META: Record<string, { label: string; color: string; glyph: string; min: number; desc: string }> = {
  Seedling:    { label: 'Seedling',    color: '#4A5A78', glyph: '◌',  min: 0,    desc: 'Just joined the community'       },
  Grower:      { label: 'Grower',      color: '#3B82F6', glyph: '◎',  min: 100,  desc: 'Building a contribution history' },
  Contributor: { label: 'Contributor', color: '#22D3EE', glyph: '◉',  min: 250,  desc: 'Regular community helper'        },
  Steward:     { label: 'Steward',     color: '#D4A843', glyph: '⊛',  min: 500,  desc: 'Trusted and reliable member'     },
  Pillar:      { label: 'Pillar',      color: '#F0C96A', glyph: '✦',  min: 800,  desc: 'Cornerstone of the community'    },
  Elder:       { label: 'Elder',       color: '#FDE68A', glyph: '✸',  min: 1200, desc: 'Legendary contributor'           },
}

export const TASK_STATUS_META: Record<string, { label: string; color: string; desc: string }> = {
  Open:      { label: 'Open',       color: '#3B82F6', desc: 'Seeking a provider'     },
  Claimed:   { label: 'In Progress',color: '#22D3EE', desc: 'Provider working on it' },
  Submitted: { label: 'Under Review',color: '#D4A843', desc: 'Awaiting confirmation' },
  Completed: { label: 'Completed',  color: '#34D399', desc: 'Successfully finished'  },
  Cancelled: { label: 'Cancelled',  color: '#4A5A78', desc: 'Task was cancelled'     },
  Disputed:  { label: 'Disputed',   color: '#DC2626', desc: 'Under dispute'          },
}

export const TASK_CATEGORIES = [
  'Web Development', 'Smart Contracts', 'Design & UI', 'Writing & Docs',
  'Data Analysis', 'DevOps', 'Mobile Dev', 'Blockchain Research',
  'Video & Audio', 'Translation', 'Mentoring', 'Community Building',
  'Security Review', 'Marketing', '3D & Animation', 'AI & ML',
]

export const DEADLINE_OPTIONS = [
  { label: '2 days',  value: 172800  },
  { label: '5 days',  value: 432000  },
  { label: '1 week',  value: 604800  },
  { label: '2 weeks', value: 1209600 },
  { label: '1 month', value: 2592000 },
]
