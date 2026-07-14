import { useState } from 'react'
import { Search, Clock, Users, CheckCircle, Zap } from 'lucide-react'
import TaskCard from '../components/TaskCard'
import StandingBadge from '../components/StandingBadge'
import ClockFace from '../components/ClockFace'
import { MOCK_PROFILES, truncAddr } from '../lib/mockData'
import { useChronoStore } from '../lib/store'
import { TASK_CATEGORIES } from '../lib/constants'
import type { TaskStatus } from '../lib/store'
import { clsx } from 'clsx'

const FILTERS: { label: string; value: TaskStatus | 'all' }[] = [
  { label: 'All',       value: 'all'       },
  { label: 'Open',      value: 'Open'      },
  { label: 'Active',    value: 'Claimed'   },
  { label: 'Completed', value: 'Completed' },
]

export default function Board() {
  const { setTab, tasks } = useChronoStore()
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState<TaskStatus | 'all'>('all')
  const [category, setCategory] = useState('')

  const totalHours = tasks.filter(t => t.status === 'Completed').reduce((s, t) => s + t.hours, 0)

  const filtered = tasks.filter(t => {
    const fStatus   = filter === 'all' || t.status === filter
    const fCat      = !category || t.category === category
    const fSearch   = !search || t.title.toLowerCase().includes(search.toLowerCase())
    return fStatus && fCat && fSearch
  })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 pt-8 space-y-10">

      {/* Hero */}
      <section className="relative py-6 text-center">
        <div className="absolute inset-0 bg-gold-glow pointer-events-none" />
        <div className="absolute inset-0 bg-blue-glow pointer-events-none" />
        <div className="relative">
          <div className="flex justify-center mb-6">
            <ClockFace size={100} />
          </div>
          <p className="label mb-3">Stellar Soroban · Testnet</p>
          <h1 className="font-display text-4xl sm:text-6xl text-silver mb-3 leading-tight">
            Time is the<br />
            <span className="text-gold-gradient italic">only currency.</span>
          </h1>
          <p className="max-w-lg mx-auto text-muted text-sm leading-relaxed mb-8">
            ChronoVault is a decentralized time banking protocol. Contribute your skills, earn TIME credits.
            Every hour you give is tracked forever on the Stellar blockchain.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => setTab('post')}    className="btn-gold">Post a Task</button>
            <button onClick={() => setTab('profile')} className="btn-ghost">View My Profile</button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Clock,        label: 'Hours Exchanged', value: `${totalHours + 847}h` },
          { icon: Users,        label: 'Members',         value: MOCK_PROFILES.length + 312 },
          { icon: CheckCircle,  label: 'Tasks Completed', value: tasks.filter(t => t.status === 'Completed').length + 124 },
          { icon: Zap,          label: 'TIME in Circulation', value: '2,847' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="vault-card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-gold" />
              </div>
              <div>
                <div className="time-display text-xl font-bold text-silver">{s.value}</div>
                <div className="label">{s.label}</div>
              </div>
            </div>
          )
        })}
      </section>

      {/* How it works */}
      <section>
        <p className="label text-center mb-5">How ChronoVault Works</p>
        <div className="grid sm:grid-cols-4 gap-3">
          {[
            { n: '01', title: 'Post',      desc: 'Describe what you need. Offer TIME credits as payment.' },
            { n: '02', title: 'Claim',     desc: 'A community member claims the task and starts working.' },
            { n: '03', title: 'Deliver',   desc: 'Provider submits work. Requester confirms quality.'     },
            { n: '04', title: 'Earn',      desc: 'TIME credits transfer on-chain. Reputation updates.'    },
          ].map(s => (
            <div key={s.n} className="vault-card p-4">
              <div className="time-display text-2xl text-blue/30 font-bold mb-2">{s.n}</div>
              <h3 className="font-display text-base text-silver mb-1">{s.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Task filters + board */}
      <section>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="chrono-input pl-9 text-xs" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="chrono-input text-xs max-w-[160px]" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {TASK_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0E1420' }}>{c}</option>)}
          </select>
          <div className="flex gap-1 border border-white/[0.05] rounded-md p-1 bg-black/20">
            {FILTERS.map(f => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={clsx('px-3 py-1.5 rounded text-xs font-mono transition-all whitespace-nowrap',
                  filter === f.value ? 'bg-blue/20 text-silver border border-blue/20' : 'text-muted hover:text-silver'
                )}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="vault-card p-12 text-center">
              <p className="font-display text-lg text-silver mb-2">No tasks found</p>
              <p className="text-sm text-muted">Try different filters or post a new task.</p>
            </div>
          ) : (
            filtered.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      </section>

      {/* Leaderboard */}
      <section>
        <p className="label mb-4">Top TIME Contributors</p>
        <div className="vault-card overflow-hidden">
          <div className="grid grid-cols-[1.5rem_1fr_auto_auto_auto] gap-x-4 p-3 border-b border-white/[0.05]">
            <span className="label">#</span>
            <span className="label">Member</span>
            <span className="label hidden sm:block">Standing</span>
            <span className="label">Given</span>
            <span className="label">Score</span>
          </div>
          {MOCK_PROFILES.map((p, i) => (
            <div key={p.member} className="grid grid-cols-[1.5rem_1fr_auto_auto_auto] gap-x-4 items-center p-3 border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
              <span className="font-clock text-xs text-muted">{i + 1}</span>
              <div>
                <div className="font-mono text-xs text-silver">{truncAddr(p.member)}</div>
                <div className="text-[9px] text-muted">{p.tasks_given} tasks</div>
              </div>
              <div className="hidden sm:block"><StandingBadge standing={p.standing} size="sm" /></div>
              <div className="time-display text-sm font-bold text-gold-gradient">{p.hours_given}h</div>
              <div className="font-clock text-xs text-blue-lt">{p.community_score}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
