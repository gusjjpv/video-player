'use client'

import { useEffect, useCallback } from 'react'
import type { ColorFilter } from '@/hooks/useVideoPlayer'
import ProgressBar from './ProgressBar'
import PlayerControls from './PlayerControls'
import VolumeSlider from './VolumeSlider'
import ColorFilterSelector from './ColorFilterSelector'

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>
  isPlaying: boolean
  volume: number
  isMuted: boolean
  currentTime: number
  duration: number
  videoUrl: string
  videoName: string
  filterStyle: string
  error: string | null
  isLoading: boolean
  togglePlay: () => void
  skip: (seconds: number) => void
  seek: (time: number) => void
  changeVolume: (value: number) => void
  toggleMute: () => void
  setColorFilter: (filter: ColorFilter) => void
  colorFilter: ColorFilter
  resetVideo: () => void
}

export default function VideoPlayer({
  videoRef,
  isPlaying,
  volume,
  isMuted,
  currentTime,
  duration,
  videoUrl,
  videoName,
  filterStyle,
  error,
  isLoading,
  togglePlay,
  skip,
  seek,
  changeVolume,
  toggleMute,
  setColorFilter,
  colorFilter,
  resetVideo,
}: Props) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          skip(-5)
          break
        case 'ArrowRight':
          e.preventDefault()
          skip(5)
          break
        case 'ArrowUp':
          e.preventDefault()
          changeVolume(Math.min(1, volume + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          changeVolume(Math.max(0, volume - 0.1))
          break
        case 'KeyM':
          e.preventDefault()
          toggleMute()
          break
      }
    },
    [togglePlay, skip, changeVolume, toggleMute, volume]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const isInitial = !isPlaying && currentTime === 0 && !error && !isLoading

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white truncate">{videoName}</h2>
        <button
          onClick={resetVideo}
          className="px-3 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-800 rounded-md hover:text-white hover:bg-zinc-700 transition-colors"
        >
          Novo video
        </button>
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video object-contain cursor-pointer"
          style={{ filter: filterStyle }}
          onClick={togglePlay}
          playsInline
        />

        {isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-zinc-400 text-sm">Carregando video...</span>
            </div>
          </div>
        )}

        {isInitial && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-16 h-16 bg-red-600/80 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950/90 p-6">
            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-red-400 text-sm text-center max-w-md">{error}</p>
            <button
              onClick={resetVideo}
              className="mt-2 px-4 py-2 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Tentar outro video
            </button>
          </div>
        )}
      </div>

      {!error && (
        <div className="bg-zinc-900 rounded-lg p-4 space-y-3">
          <ProgressBar currentTime={currentTime} duration={duration} onSeek={seek} />

          <div className="flex items-center flex-wrap gap-2">
            <PlayerControls isPlaying={isPlaying} onTogglePlay={togglePlay} onSkip={skip} />

            <div className="w-px h-6 bg-zinc-700 mx-1" />

            <VolumeSlider
              volume={volume}
              isMuted={isMuted}
              onChangeVolume={changeVolume}
              onToggleMute={toggleMute}
            />

            <div className="w-px h-6 bg-zinc-700 mx-1" />

            <ColorFilterSelector currentFilter={colorFilter} onFilterChange={setColorFilter} />
          </div>
        </div>
      )}
    </div>
  )
}
