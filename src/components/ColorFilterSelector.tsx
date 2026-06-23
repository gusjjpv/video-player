'use client'

import type { ColorFilter } from '@/hooks/useVideoPlayer'

interface Props {
  currentFilter: ColorFilter
  onFilterChange: (filter: ColorFilter) => void
}

const FILTERS: { key: ColorFilter; label: string }[] = [
  { key: 'normal', label: 'Normal' },
  { key: 'desaturated', label: 'Sem cores' },
  { key: 'red', label: 'Vermelho' },
  { key: 'blue', label: 'Azul' },
  { key: 'green', label: 'Verde' },
  { key: 'gray', label: 'Cinza' },
]

export default function ColorFilterSelector({ currentFilter, onFilterChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onFilterChange(f.key)}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            currentFilter === f.key
              ? 'bg-red-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
