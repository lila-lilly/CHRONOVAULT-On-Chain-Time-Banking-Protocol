import { Clock, User, Tag, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { Task } from '../lib/store'
import StatusPill from './StatusPill'
import { truncAddr, formatDeadline, timeAgo } from '../lib/mockData'
import { timeBankClient, signAndSubmit } from '../lib/contract'
import { useChronoStore } from '../lib/store'
import { clsx } from 'clsx'

const EMPTY = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'

export default function TaskCard({ task, compact = false }: { task: Task; compact?: boolean }) {
  const { pubKey, isConnected, addToast } = useChronoStore()
  const [loading, setLoading] = useState<string | null>(null)

  const isClaimer   = isConnected && task.status === 'Open' && pubKey !== task.requester
  const isProvider  = isConnected && task.provider === pubKey
  const isRequester = isConnected && task.requester === pubKey
  const canSubmit   = isProvider  && task.status === 'Claimed'
  const canConfirm  = isRequester && task.status === 'Submitted'
  const canDispute  = (isProvider || isRequester) && ['Claimed','Submitted'].includes(task.status)

  const act = async (label: string, txFn: () => Promise<unknown>, success: string) => {
    try {
      setLoading(label)
      const hash = await signAndSubmit(txFn)
      addToast('success', success, `https://stellar.expert/explorer/testnet/tx/${hash}`)
      await useChronoStore.getState().refreshData()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      addToast('error', `Transaction failed: ${msg}`)
    } finally {
      setLoading(null)
    }
  }

  const isExpired = task.deadline < Math.floor(Date.now() / 1000) && task.status === 'Open'

  return (
    <div className={clsx('task-card p-5', compact && 'p-4')}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base text-silver leading-tight mb-1 line-clamp-2">{task.title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusPill status={task.status} />
            <span className="label flex items-center gap-1">
              <Tag size={9} />
              {task.category}
            </span>
          </div>
        </div>
        {/* TIME credit badge */}
        <div className="shrink-0 clock-ring w-14 h-14 flex flex-col items-center justify-center"
             style={{ background: 'rgba(212,168,67,0.06)' }}>
          <span className="time-display text-lg font-bold text-gold-gradient leading-none">{task.hours}</span>
          <span className="text-[8px] font-clock text-muted uppercase tracking-widest">hrs</span>
        </div>
      </div>

      {!compact && (
        <p className="text-xs text-muted leading-relaxed mb-4 line-clamp-2">{task.description}</p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-4 text-[10px] font-mono text-muted mb-4">
        <span className="flex items-center gap-1">
          <User size={9} />
          {truncAddr(task.requester)}
        </span>
        {task.provider !== EMPTY && (
          <span className="flex items-center gap-1">
            <span style={{ color: '#22D3EE' }}>provider:</span>
            {truncAddr(task.provider)}
          </span>
        )}
        <span className="flex items-center gap-1 ml-auto">
          <Clock size={9} />
          {task.status === 'Completed' ? `done ${timeAgo(task.completed_at)}` : isExpired ? 'expired' : formatDeadline(task.deadline)}
        </span>
      </div>

      {/* Actions */}
      {!compact && (isClaimer || canSubmit || canConfirm || canDispute || isRequester) && (
        <div className="flex gap-2 pt-4 border-t border-white/[0.05]">
          {isClaimer && (
            <button
              onClick={() => act('claim', async () => await timeBankClient.claim_task({ task_id: BigInt(task.id), provider: pubKey }), `Task #${task.id} claimed! Start working and submit when done.`)}
              disabled={!!loading || isExpired}
              className="btn-blue text-xs py-1.5 px-4 flex items-center gap-1.5"
            >
              {loading === 'claim' ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
              Claim Task
            </button>
          )}
          {canSubmit && (
            <button
              onClick={() => act('submit', async () => await timeBankClient.submit_work({ task_id: BigInt(task.id), provider: pubKey }), `Work submitted for task #${task.id}. Awaiting requester confirmation.`)}
              disabled={!!loading}
              className="btn-gold text-xs py-1.5 px-4 flex items-center gap-1.5"
            >
              {loading === 'submit' ? <Loader2 size={12} className="animate-spin" /> : null}
              Submit Work
            </button>
          )}
          {canConfirm && (
            <button
              onClick={() => act('confirm', async () => await timeBankClient.confirm_completion({ task_id: BigInt(task.id), requester: pubKey }), `Task #${task.id} confirmed! ${task.hours} TIME credits transferred.`)}
              disabled={!!loading}
              className="btn-gold text-xs py-1.5 px-4"
            >
              {loading === 'confirm' ? <Loader2 size={12} className="animate-spin" /> : 'Confirm & Pay'}
            </button>
          )}
          {isRequester && task.status === 'Open' && !isExpired && (
            <button
              onClick={() => act('cancel', async () => await timeBankClient.cancel_task({ task_id: BigInt(task.id), requester: pubKey }), `Task #${task.id} cancelled.`)}
              disabled={!!loading}
              className="btn-ghost text-xs py-1.5 px-3 border-white/20 text-muted hover:border-white/40"
            >
              {loading === 'cancel' ? <Loader2 size={12} className="animate-spin" /> : 'Cancel Task'}
            </button>
          )}
          {canDispute && (
            <button
              onClick={() => act('dispute', async () => await timeBankClient.dispute_task({ task_id: BigInt(task.id), caller: pubKey }), `Dispute raised for task #${task.id}.`)}
              disabled={!!loading}
              className="btn-ghost text-xs py-1.5 px-3 border-ruby/20 text-ruby hover:border-ruby/40"
            >
              {loading === 'dispute' ? <Loader2 size={12} className="animate-spin" /> : 'Dispute'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
