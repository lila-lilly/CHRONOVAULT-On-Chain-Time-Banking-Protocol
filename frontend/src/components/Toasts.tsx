import { CheckCircle, XCircle, Info, X, ExternalLink } from 'lucide-react'
import { useChronoStore } from '../lib/store'

export default function Toasts() {
  const { toasts, removeToast } = useChronoStore()
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map(n => (
        <div key={n.id} className="vault-card flex items-start gap-3 p-4"
          style={{ borderColor: n.type === 'success' ? 'rgba(52,211,153,0.3)' : n.type === 'error' ? 'rgba(220,38,38,0.3)' : 'rgba(212,168,67,0.3)' }}>
          {n.type === 'success' && <CheckCircle size={15} style={{ color: '#34D399' }} className="shrink-0 mt-0.5" />}
          {n.type === 'error'   && <XCircle     size={15} className="text-ruby shrink-0 mt-0.5" />}
          {n.type === 'info'    && <Info         size={15} className="text-gold shrink-0 mt-0.5" />}
          <div className="flex-1">
            <p className="text-sm text-silver leading-snug">{n.message}</p>
            {n.link && (
              <a href={n.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 text-xs text-blue-lt hover:underline">
                View on Stellar Expert <ExternalLink size={10} />
              </a>
            )}
          </div>
          <button onClick={() => removeToast(n.id)} className="text-muted hover:text-silver shrink-0"><X size={13} /></button>
        </div>
      ))}
    </div>
  )
}
