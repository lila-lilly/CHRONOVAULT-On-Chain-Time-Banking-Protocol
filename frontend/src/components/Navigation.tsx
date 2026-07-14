import { LayoutGrid, PlusCircle, List, User } from 'lucide-react'
import { clsx } from 'clsx'
import { useChronoStore } from '../lib/store'
import { truncAddr } from '../lib/mockData'
import ClockFace from './ClockFace'

const TABS = [
  { id: 'board',   label: 'Board',    icon: LayoutGrid  },
  { id: 'post',    label: 'Post Task', icon: PlusCircle  },
  { id: 'mytasks', label: 'My Tasks',  icon: List        },
  { id: 'profile', label: 'Profile',   icon: User        },
] as const

export default function Navigation() {
  const { activeTab, setTab, isConnected, pubKey, timeBalance, disconnect } = useChronoStore()

  return (
    <nav
      className="sticky top-0 z-40 border-b border-white/[0.05]"
      style={{ background: 'rgba(8,12,20,0.92)', backdropFilter: 'blur(20px)' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 gap-4">

        {/* Logo */}
        <button onClick={() => setTab('board')} className="flex items-center gap-2.5 shrink-0">
          <ClockFace size={32} />
          <div>
            <div className="font-display text-base text-silver leading-none">
              Chrono<span className="text-gold-gradient">Vault</span>
            </div>
            <div className="text-[9px] font-clock text-muted tracking-widest uppercase">Time Banking · Stellar</div>
          </div>
        </button>

        {/* Desktop tabs */}
        <div className="hidden md:flex items-center gap-0.5 bg-black/20 rounded-md border border-white/[0.05] p-1">
          {TABS.map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-body font-medium transition-all duration-150',
                  active ? 'bg-blue/20 text-silver border border-blue/20' : 'text-muted hover:text-silver'
                )}
              >
                <Icon size={12} className={active ? 'text-blue-lt' : ''} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Wallet + balance */}
        {isConnected ? (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs border border-white/[0.06] rounded-md px-3 py-1.5 bg-black/20">
              <span className="time-display text-gold-gradient font-bold">{timeBalance}</span>
              <span className="font-clock text-muted text-[9px] uppercase">TIME</span>
              <span className="w-px h-3 bg-white/10 mx-1" />
              <span className="font-mono text-muted">{truncAddr(pubKey)}</span>
            </div>
            <button onClick={disconnect} className="btn-ghost text-xs py-1.5 px-3">Disconnect</button>
          </div>
        ) : (
          <button onClick={() => setTab('profile')} className="btn-gold text-xs py-1.5 px-4">Connect Wallet</button>
        )}
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden flex border-t border-white/[0.05]">
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={clsx('flex-1 flex flex-col items-center gap-1 py-2 text-[9px] font-clock uppercase tracking-wide transition-colors', active ? 'text-silver' : 'text-muted')}
            >
              <Icon size={14} className={active ? 'text-blue-lt' : ''} />
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
