export default function ClockFace({ size = 120, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className}>
      {/* Outer ring */}
      <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(212,168,67,0.25)" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(212,168,67,0.08)" strokeWidth="0.5" />

      {/* Hour tick marks */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180)
        const x1 = 60 + 48 * Math.cos(angle)
        const y1 = 60 + 48 * Math.sin(angle)
        const x2 = 60 + 52 * Math.cos(angle)
        const y2 = 60 + 52 * Math.sin(angle)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(212,168,67,0.5)" strokeWidth="2" />
      })}

      {/* Minute tick marks */}
      {Array.from({ length: 60 }, (_, i) => {
        if (i % 5 === 0) return null
        const angle = (i * 6 - 90) * (Math.PI / 180)
        const x1 = 60 + 50 * Math.cos(angle)
        const y1 = 60 + 50 * Math.sin(angle)
        const x2 = 60 + 52 * Math.cos(angle)
        const y2 = 60 + 52 * Math.sin(angle)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(212,168,67,0.2)" strokeWidth="0.8" />
      })}

      {/* Minute hand */}
      <line
        className="minute-hand"
        x1="60" y1="60" x2="60" y2="20"
        stroke="rgba(212,168,67,0.7)" strokeWidth="1.5" strokeLinecap="round"
        style={{ transformOrigin: '60px 60px' }}
      />

      {/* Second hand */}
      <line
        className="second-hand"
        x1="60" y1="60" x2="60" y2="16"
        stroke="rgba(59,130,246,0.9)" strokeWidth="0.8" strokeLinecap="round"
        style={{ transformOrigin: '60px 60px' }}
      />

      {/* Center dot */}
      <circle cx="60" cy="60" r="3" fill="#D4A843" />
      <circle cx="60" cy="60" r="1.5" fill="#080C14" />

      {/* Inner decoration */}
      <circle cx="60" cy="60" r="8" fill="none" stroke="rgba(212,168,67,0.15)" strokeWidth="0.5" />
    </svg>
  )
}
