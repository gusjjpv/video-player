'use client'

interface Props {
  isPlaying: boolean
  onTogglePlay: () => void
  onSkip: (seconds: number) => void
}

export default function PlayerControls({ isPlaying, onTogglePlay, onSkip }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onSkip(-5)}
        className="p-2 text-zinc-300 hover:text-white transition-colors"
        title="Voltar 5 segundos"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
        </svg>
      </button>

      <button
        onClick={onTogglePlay}
        className="p-2 text-white hover:text-red-500 transition-colors"
        title={isPlaying ? 'Pausar' : 'Reproduzir'}
      >
        {isPlaying ? (
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <button
        onClick={() => onSkip(5)}
        className="p-2 text-zinc-300 hover:text-white transition-colors"
        title="Avançar 5 segundos"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.5 8c-3.65 0-6.58 2.97-7.1 6.81l2.37.78C7.25 12.31 9.69 10 12.5 10c1.96 0 3.73.72 5.12 1.88L13.5 15.5V22h9v-9l-3.62 3.62C16.55 14.99 14.15 14 11.5 14c-3.54 0-6.55 2.31-7.6 5.5l-2.37-.78C3.45 14.28 7.11 11 11.5 11c1.68 0 3.26.44 4.63 1.2L13.5 8z" />
        </svg>
      </button>
    </div>
  )
}
