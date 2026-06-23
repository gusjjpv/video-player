'use client'

import { useRef, useCallback } from 'react'

interface Props {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function ProgressBar({ currentTime, duration, onSeek }: Props) {
  const barRef = useRef<HTMLDivElement>(null)

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = barRef.current
      if (!bar || duration <= 0) return
      const rect = bar.getBoundingClientRect()
      const x = e.clientX - rect.left
      const ratio = Math.max(0, Math.min(1, x / rect.width))
      onSeek(ratio * duration)
    },
    [duration, onSeek]
  )

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-400 w-10 text-right tabular-nums">
        {formatTime(currentTime)}
      </span>

      <div
        ref={barRef}
        onClick={handleClick}
        className="relative flex-1 h-2 bg-zinc-700 rounded-full cursor-pointer group"
      >
        <div
          className="absolute top-0 left-0 h-full bg-red-600 rounded-full transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      <span className="text-xs text-zinc-400 w-10 tabular-nums">
        {formatTime(duration)}
      </span>
    </div>
  )
}
