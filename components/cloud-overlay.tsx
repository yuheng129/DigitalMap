interface CloudOverlayProps {
  x: number
  y: number
}

export default function CloudOverlay({ x, y }: CloudOverlayProps) {
  return (
    <g>
      {/* Cloud shape using SVG path */}
      <path
        d={`M ${x - 20} ${y} Q ${x - 25} ${y - 8} ${x - 15} ${y - 12} Q ${x - 5} ${y - 15} ${x + 5} ${y - 12} Q ${x + 15} ${y - 8} ${x + 20} ${y} Z`}
        fill="#ffffff"
        opacity="0.85"
        stroke="#d1d5db"
        strokeWidth="0.5"
      />
      {/* Lock icon inside cloud */}
      <g transform={`translate(${x - 3}, ${y - 2})`}>
        <rect x="0" y="3" width="6" height="5" rx="0.5" fill="#6b7280" />
        <path d="M 1 3 V 2 A 2 2 0 0 1 5 2 V 3" stroke="#6b7280" strokeWidth="0.5" fill="none" />
      </g>
    </g>
  )
}
