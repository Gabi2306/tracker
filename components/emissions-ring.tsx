"use client"

interface EmissionsRingProps {
  value: number
  maxValue?: number
}

export function EmissionsRing({ value, maxValue = 25 }: EmissionsRingProps) {
  const percentage = Math.min((value / maxValue) * 100, 100)
  const radius = 80
  const strokeWidth = 8
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90" aria-hidden="true">
        {/* Background track */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#1E293B"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        {/* Glow effect */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={strokeWidth + 4}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          opacity="0.2"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-foreground" aria-label={`${value.toFixed(1)} kilogramos de CO2 equivalente`}>
          {value.toFixed(1)}
        </span>
        <span className="text-xs text-muted-foreground">
          {"kg CO"}
          <sub>2</sub>
          {"e"}
        </span>
      </div>
    </div>
  )
}
