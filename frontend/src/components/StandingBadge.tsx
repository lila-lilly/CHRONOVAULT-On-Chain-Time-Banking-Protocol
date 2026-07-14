import { STANDING_META } from '../lib/constants'

interface StandingBadgeProps { standing: string; size?: 'sm' | 'md' | 'lg'; showGlyph?: boolean }

export default function StandingBadge({ standing, size = 'md', showGlyph = true }: StandingBadgeProps) {
  const meta  = STANDING_META[standing] || STANDING_META['Seedling']
  const sizes = { sm: 'text-[10px] px-2 py-0.5 gap-1', md: 'text-xs px-3 py-1 gap-1.5', lg: 'text-sm px-4 py-1.5 gap-2' }
  return (
    <span
      className={`standing-badge ${sizes[size]}`}
      style={{ color: meta.color, background: `${meta.color}14`, border: `1px solid ${meta.color}35` }}
    >
      {showGlyph && <span className="font-mono">{meta.glyph}</span>}
      {meta.label}
    </span>
  )
}
