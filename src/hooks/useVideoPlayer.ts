'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

export type ColorFilter = 'normal' | 'desaturated' | 'red' | 'blue' | 'green' | 'gray'

const FILTER_MAP: Record<ColorFilter, string> = {
  normal: 'none',
  desaturated: 'grayscale(100%)',
  red: 'sepia(100%) hue-rotate(-50deg) saturate(500%)',
  blue: 'sepia(100%) hue-rotate(150deg) saturate(500%)',
  green: 'sepia(100%) hue-rotate(70deg) saturate(500%)',
  gray: 'grayscale(100%) contrast(1.2)',
}

function getErrorMessage(el: HTMLVideoElement): string {
  const code = el.error?.code
  if (code === 4) return 'Formato de video nao suportado pelo navegador. Use MP4, WebM ou OGG.'
  if (code === 2) return 'Erro de rede ao carregar o video. Verifique se a URL esta acessivel.'
  if (code === 3) return 'O video foi interrompido durante o download. Verifique sua conexao.'
  if (code === 1) return 'Erro ao carregar o video. A URL pode estar incorreta ou o servidor nao permite acesso.'
  return el.error?.message || 'Formato de video nao suportado pelo navegador.'
}

export function useVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [colorFilter, setColorFilter] = useState<ColorFilter>('normal')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoName, setVideoName] = useState('')
  const [hasSource, setHasSource] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const onTimeUpdate = () => setCurrentTime(el.currentTime)
    const onLoadedMetadata = () => {
      setDuration(el.duration)
      setIsLoading(false)
    }
    const onLoadStart = () => {
      setIsLoading(true)
      setError(null)
    }
    const onCanPlay = () => setIsLoading(false)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)
    const onVolumeChange = () => {
      setVolumeState(el.volume)
      setIsMuted(el.muted)
    }
    const onError = () => {
      setIsLoading(false)
      setIsPlaying(false)
      setError(getErrorMessage(el))
    }

    el.addEventListener('loadstart', onLoadStart)
    el.addEventListener('loadedmetadata', onLoadedMetadata)
    el.addEventListener('canplay', onCanPlay)
    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onEnded)
    el.addEventListener('volumechange', onVolumeChange)
    el.addEventListener('error', onError)

    return () => {
      el.removeEventListener('loadstart', onLoadStart)
      el.removeEventListener('loadedmetadata', onLoadedMetadata)
      el.removeEventListener('canplay', onCanPlay)
      el.removeEventListener('timeupdate', onTimeUpdate)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('volumechange', onVolumeChange)
      el.removeEventListener('error', onError)
    }
  }, [hasSource])

  const togglePlay = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      el.play().catch(() => {})
    } else {
      el.pause()
    }
  }, [])

  const skip = useCallback((seconds: number) => {
    const el = videoRef.current
    if (!el) return
    el.currentTime = Math.max(0, Math.min(el.currentTime + seconds, el.duration))
  }, [])

  const seek = useCallback((time: number) => {
    const el = videoRef.current
    if (!el) return
    el.currentTime = time
  }, [])

  const changeVolume = useCallback((value: number) => {
    const el = videoRef.current
    if (!el) return
    el.volume = value
    el.muted = value === 0
  }, [])

  const toggleMute = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    el.muted = !el.muted
  }, [])

  const filterStyle = FILTER_MAP[colorFilter]

  const loadVideo = useCallback((url: string, name: string) => {
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    setVideoUrl(url)
    setVideoName(name)
    setHasSource(true)
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
    setIsLoading(true)
    setError(null)
    setColorFilter('normal')
  }, [videoUrl])

  const resetVideo = useCallback(() => {
    const el = videoRef.current
    if (el) {
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }
    setVideoUrl(null)
    setVideoName('')
    setHasSource(false)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setError(null)
    setIsLoading(false)
    setColorFilter('normal')
  }, [videoUrl])

  return {
    videoRef,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    colorFilter,
    videoUrl,
    videoName,
    hasSource,
    error,
    isLoading,
    filterStyle,
    togglePlay,
    skip,
    seek,
    changeVolume,
    toggleMute,
    setColorFilter,
    loadVideo,
    resetVideo,
  }
}
