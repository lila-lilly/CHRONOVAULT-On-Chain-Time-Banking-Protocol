import { useState } from 'react'
import TaskCard from '../components/TaskCard'
import { useChronoStore } from '../lib/store'
import type { TaskStatus } from '../lib/store'
import { clsx } from 'clsx'

const TABS: { label: string; value: TaskStatus | 'all' }[] = [
  { label: 'All',        value: 'all'       },
  { label: 'Open',       value: 'Open'      },
  { label: 'In Progress',value: 'Claimed'   },
  { label: 'Review',     value: 'Submitted' },
  { label: 'Done',       value: 'Completed' },
]

export default function MyTasks() {
  const { isConnected, setTab, tasks, pubKey } = useChronoStore()
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all')

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 pb-20 pt-16 text-center">
        <div className="vault-card p-10">
          <div className="time-display text-5xl text-blue/20 mb-4">⏳</div>
          <h2 className="font-display text-xl text-silver mb-2">No wallet connected</h2>
          <p className="text-sm text-muted mb-6">Connect your wallet to view your task history.</p>
          <button onClick={() => setTab('profile')} className="btn-gold">Connect Wallet</button>
        </div>
      </div>
    )
  }

  const myTasks = tasks.filter(t => t.requester === pubKey || t.provider === pubKey)
  const filtered = myTasks.filter(t => filter === 'all' || t.status === filter)

  const stats = {
    asProvider:  myTasks.filter(t => t.status === 'Completed' && t.provider === pubKey).length,
    asRequester: myTasks.filter(t => ['Open','Claimed','Submitted'].includes(t.status) && t.requester === pubKey).length,
    inProgress:  myTasks.filter(t => t.status === 'Claimed' && t.provider === pubKey).length,
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-20 pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-silver">My Tasks</h1>
          <p className="text-sm text-muted mt-0.5">{myTasks.length} tasks on record</p>
        </div>
        <button onClick={() => setTab('post')} className="btn-gold text-xs py-2">+ Post Task</button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Completed as Provider',  value: stats.asProvider  },
          { label: 'Posted as Requester',     value: stats.asRequester },
          { label: 'Currently In Progress',   value: stats.inProgress  },
        ].map(s => (
          <div key={s.label} className="vault-card p-3 text-center">
            <div className="time-display text-2xl font-bold text-gold-gradient">{s.value}</div>
            <div className="label mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 border-b border-white/[0.05] pb-1 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={clsx(
              'px-3 py-1.5 text-xs font-clock whitespace-nowrap rounded transition-all',
              filter === t.value
                ? 'bg-blue/15 text-silver border border-blue/20'
                : 'text-muted hover:text-silver'
            )}
          >
            {t.label}
            <span className="ml-1.5 text-muted">
              ({t.value === 'all'
                ? myTasks.length
                : myTasks.filter(x => x.status === t.value).length})
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="vault-card p-10 text-center">
            <p className="font-display text-lg text-silver mb-2">No tasks here</p>
            <p className="text-sm text-muted">Post a task or claim one from the board.</p>
          </div>
        ) : (
          filtered.map(task => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  )
}
