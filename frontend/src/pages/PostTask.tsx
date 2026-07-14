import { useState } from 'react'
import { Clock, Loader2, CheckCircle, Info, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { useChronoStore } from '../lib/store'
import { TASK_CATEGORIES, DEADLINE_OPTIONS } from '../lib/constants'
import { truncAddr } from '../lib/mockData'

export default function PostTask() {
  const { isConnected, pubKey, timeBalance, addToast, setTab } = useChronoStore()
  const [form, setForm] = useState({ title: '', description: '', category: '', hours: 2, deadline: 604800 })
  const [submitting, setSubmitting] = useState(false)
  const [txHash, setTxHash]         = useState('')

  const set = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!isConnected) { addToast('error', 'Connect your wallet first'); return }
    if (!form.title.trim())    { addToast('error', 'Task title required'); return }
    if (!form.description.trim()) { addToast('error', 'Description required'); return }
    if (!form.category)        { addToast('error', 'Select a category'); return }
    if (form.hours < 1 || form.hours > 40) { addToast('error', 'Hours must be 1–40'); return }
    if (form.hours > timeBalance) { addToast('error', `Insufficient TIME balance (have ${timeBalance}, need ${form.hours})`); return }

    setSubmitting(true)
    try {
      await new Promise(r => setTimeout(r, 2000))
      const hash = Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
      setTxHash(hash)
      addToast('success', `Task posted! ${form.hours} TIME escrowed on-chain.`)
    } catch (e) {
      addToast('error', `Failed: ${e instanceof Error ? e.message : 'Unknown'}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (txHash) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 pb-20 pt-8">
        <div className="vault-card p-8 text-center" style={{ borderColor: 'rgba(52,211,153,0.2)' }}>
          <div className="clock-ring w-16 h-16 mx-auto mb-5 flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.1)' }}>
            <CheckCircle size={28} style={{ color: '#34D399' }} />
          </div>
          <h2 className="font-display text-2xl text-silver mb-2">Task Published</h2>
          <p className="text-sm text-muted mb-6">{form.hours} TIME credits are now escrowed in the TimeBank contract, waiting for a community member to claim your task.</p>
          <div className="space-y-2 text-left mb-6">
            <div className="vault-card p-3"><div className="label mb-1">Transaction Hash</div><div className="font-mono text-xs text-blue-lt break-all">{txHash}</div></div>
            <div className="vault-card p-3 grid grid-cols-2 gap-3 text-xs">
              <div><div className="label mb-1">Task</div><p className="text-silver">{form.title}</p></div>
              <div><div className="label mb-1">Category</div><p className="text-silver">{form.category}</p></div>
            </div>
            <div className="vault-card p-3 flex items-center gap-2 text-xs">
              <Clock size={12} className="text-gold" />
              <span className="text-muted">Escrowed:</span>
              <span className="time-display text-gold-gradient font-bold">{form.hours} TIME</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setTab('board')}   className="btn-blue flex-1">View Board</button>
            <button onClick={() => { setTxHash(''); setForm({ title:'',description:'',category:'',hours:2,deadline:604800 }) }} className="btn-ghost flex-1">Post Another</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-20 pt-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-silver mb-1">Post a Task</h1>
        <p className="text-sm text-muted">Describe what you need and offer TIME credits. Credits are escrowed until the task completes.</p>
      </div>

      {!isConnected ? (
        <div className="vault-card p-4 mb-5 flex items-start gap-3" style={{ borderColor: 'rgba(212,168,67,0.2)' }}>
          <Info size={14} className="text-gold shrink-0 mt-0.5" />
          <p className="text-sm text-muted">Connect your wallet in <strong className="text-silver">Profile</strong> to post real on-chain tasks.</p>
        </div>
      ) : timeBalance === 0 ? (
        <div className="vault-card p-4 mb-5 flex items-start gap-3" style={{ borderColor: 'rgba(220,38,38,0.2)' }}>
          <AlertCircle size={14} className="text-ruby shrink-0 mt-0.5" />
          <p className="text-sm text-muted">You have 0 TIME credits. Claim tasks to earn credits first, or ask an admin to mint you starter credits.</p>
        </div>
      ) : null}

      <div className="vault-card p-6 space-y-5">
        <div>
          <label className="label block mb-2">Task Title <span className="text-ruby">*</span></label>
          <input className="chrono-input" placeholder="e.g. Build a Soroban DEX interface in React" value={form.title} onChange={e => set('title', e.target.value)} />
        </div>

        <div>
          <label className="label block mb-2">Description <span className="text-ruby">*</span></label>
          <textarea className="chrono-input resize-none h-28 text-xs" placeholder="Be specific about deliverables, format, and quality expectations…" value={form.description} onChange={e => set('description', e.target.value)} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label block mb-2">Category <span className="text-ruby">*</span></label>
            <select className="chrono-input" value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select…</option>
              {TASK_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0E1420' }}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label block mb-2">Deadline</label>
            <select className="chrono-input" value={form.deadline} onChange={e => set('deadline', parseInt(e.target.value))}>
              {DEADLINE_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: '#0E1420' }}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label block mb-3">TIME Credits Offered: <span className="time-display text-gold-gradient font-bold text-sm ml-1">{form.hours}</span></label>
          <input type="range" min={1} max={Math.min(40, Math.max(timeBalance, 10))} step={1} value={form.hours} onChange={e => set('hours', parseInt(e.target.value))} className="w-full accent-yellow-500 cursor-pointer" />
          <div className="flex justify-between text-[10px] font-clock text-muted mt-1">
            <span>1 hr</span>
            <span>{Math.min(40, Math.max(timeBalance, 10))} hrs</span>
          </div>
          <p className="text-[10px] text-muted mt-1.5">Your balance: <span className="time-display text-gold-gradient">{timeBalance} TIME</span> · 1 hour of help = 1 TIME credit</p>
        </div>

        {/* Preview */}
        <div className="rounded-md border border-dashed border-white/10 p-4 space-y-2 text-xs">
          <div className="label mb-3">On-Chain Preview</div>
          <div className="flex gap-2"><span className="text-muted w-24">Requester:</span><span className="font-mono text-silver">{pubKey ? truncAddr(pubKey) : '(not connected)'}</span></div>
          <div className="flex gap-2"><span className="text-muted w-24">Category:</span><span className="text-silver">{form.category || '—'}</span></div>
          <div className="flex gap-2"><span className="text-muted w-24">TIME escrowed:</span><span className="time-display text-gold-gradient font-bold">{form.hours}</span></div>
        </div>

        <button onClick={handleSubmit} disabled={submitting} className={clsx('btn-gold w-full flex items-center justify-center gap-2 py-3', submitting && 'opacity-70 cursor-not-allowed')}>
          {submitting ? <><Loader2 size={15} className="animate-spin" />Submitting to Soroban…</> : <><Clock size={15} />Post Task &amp; Escrow Credits</>}
        </button>
      </div>
    </div>
  )
}
