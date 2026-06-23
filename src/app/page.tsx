'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import VideoSourceInput from '@/components/VideoSourceInput'
import VideoPlayer from '@/components/VideoPlayer'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'
import {
  isFormatSupported,
  isURLSupported,
  transcodeFileToWebM,
  transcodeURLToWebM,
} from '@/lib/transcode'
import { saveBlob, hasBlob, loadBlob } from '@/lib/storage'

const LAST_URL_KEY = 'last-video-url'
const LAST_URL_NAME_KEY = 'last-video-name'

export default function Home() {
  const [converting, setConverting] = useState(false)
  const [convertProgress, setConvertProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const transcodeRef = useRef(false)

  const {
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
  } = useVideoPlayer()

  useEffect(() => {
    const lastUrl = localStorage.getItem(LAST_URL_KEY)
    const lastName = localStorage.getItem(LAST_URL_NAME_KEY)
    if (!lastUrl || !lastName) return
    ;(async () => {
      try {
        if (await hasBlob(lastUrl)) {
          const blob = await loadBlob(lastUrl)
          if (blob) {
            const url = URL.createObjectURL(blob)
            loadVideo(url, lastName)
          }
        }
      } catch {}
    })()
  }, [loadVideo])

  const handleFileSelected = useCallback(
    async (file: File) => {
      if (isFormatSupported(file)) {
        const url = URL.createObjectURL(file)
        loadVideo(url, file.name)
        return
      }

      if (transcodeRef.current) return
      transcodeRef.current = true
      setConverting(true)
      setConvertProgress(0)
      setIsDownloading(false)

      try {
        const webm = await transcodeFileToWebM(file, (p) => setConvertProgress(p))
        const url = URL.createObjectURL(webm)
        loadVideo(url, file.name.replace(/\.[^.]+$/, '.webm'))
      } catch (err) {
        alert(
          'Falha ao converter o video: ' +
            (err instanceof Error ? err.message : 'Erro desconhecido')
        )
      } finally {
        setConverting(false)
        transcodeRef.current = false
      }
    },
    [loadVideo]
  )

  const handleUrlSubmitted = useCallback(
    async (rawUrl: string) => {
      const name = rawUrl.split('/').pop() || 'Video remoto'

      if (isURLSupported(rawUrl)) {
        loadVideo(rawUrl, name)
        return
      }

      if (transcodeRef.current) return
      transcodeRef.current = true

      try {
        const cached = await hasBlob(rawUrl)
        if (cached) {
          const blob = await loadBlob(rawUrl)
          if (blob) {
            const url = URL.createObjectURL(blob)
            loadVideo(url, name)
            localStorage.setItem(LAST_URL_KEY, rawUrl)
            localStorage.setItem(LAST_URL_NAME_KEY, name)
            return
          }
        }

        setIsDownloading(true)
        setConvertProgress(0)
        setConverting(true)

        const webm = await transcodeURLToWebM(rawUrl, (p) => setConvertProgress(p))

        setIsDownloading(false)

        const objectUrl = URL.createObjectURL(webm)
        loadVideo(objectUrl, name)
        localStorage.setItem(LAST_URL_KEY, rawUrl)
        localStorage.setItem(LAST_URL_NAME_KEY, name)

        saveBlob(rawUrl, webm).catch(() => {})
      } catch (err) {
        alert(
          'Nao foi possivel carregar o video da URL.\n' +
            'Verifique se a URL esta correta e se o servidor permite acesso.\n\n' +
            (err instanceof Error ? err.message : 'Erro desconhecido')
        )
      } finally {
        setConverting(false)
        setIsDownloading(false)
        transcodeRef.current = false
      }
    },
    [loadVideo]
  )

  const handleReset = useCallback(() => {
    resetVideo()
  }, [resetVideo])

  if (converting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 gap-6">
        <div className="flex flex-col items-center gap-4 p-8 bg-zinc-900 rounded-xl w-full max-w-md">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-medium text-white">
            {isDownloading ? 'Baixando video...' : 'Convertendo video...'}
          </p>
          <p className="text-sm text-zinc-400">
            {isDownloading
              ? 'Baixando o video do servidor...'
              : 'Convertendo para WebM (formato compativel com o navegador).'}
          </p>
          {!isDownloading && (
            <>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(convertProgress * 100)}%` }}
                />
              </div>
              <span className="text-xs text-zinc-500">
                {Math.round(convertProgress * 100)}%
              </span>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
      {!hasSource ? (
        <VideoSourceInput
          onFileSelected={handleFileSelected}
          onUrlSubmitted={handleUrlSubmitted}
        />
      ) : (
        <VideoPlayer
          videoRef={videoRef}
          isPlaying={isPlaying}
          volume={volume}
          isMuted={isMuted}
          currentTime={currentTime}
          duration={duration}
          videoUrl={videoUrl!}
          videoName={videoName}
          filterStyle={filterStyle}
          error={error}
          isLoading={isLoading}
          togglePlay={togglePlay}
          skip={skip}
          seek={seek}
          changeVolume={changeVolume}
          toggleMute={toggleMute}
          setColorFilter={setColorFilter}
          colorFilter={colorFilter}
          resetVideo={handleReset}
        />
      )}
    </div>
  )
}
