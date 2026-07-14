import { TASK_STATUS_META } from '../lib/constants'
import type { TaskStatus } from '../lib/store'

export default function StatusPill({ status }: { status: TaskStatus }) {
  const meta = TASK_STATUS_META[status] || TASK_STATUS_META['Open']
  return (
    <span
      className="status-pill"
      style={{ color: meta.color, background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color, boxShadow: `0 0 4px ${meta.color}` }} />
      {meta.label}
    </span>
  )
}
