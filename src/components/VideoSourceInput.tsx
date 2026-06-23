'use client'

import { useState } from 'react'

interface Props {
  onFileSelected: (file: File) => void
  onUrlSubmitted: (url: string) => void
}

export default function VideoSourceInput({ onFileSelected, onUrlSubmitted }: Props) {
  const [url, setUrl] = useState('')
  const [mode, setMode] = useState<'file' | 'url'>('file')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelected(file)
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) onUrlSubmitted(url.trim())
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 border-2 border-dashed border-zinc-600 rounded-xl bg-zinc-900/50 w-full max-w-lg">
      <h2 className="text-xl font-semibold text-white">Carregar Video</h2>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('file')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'file'
              ? 'bg-red-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Arquivo
        </button>
        <button
          onClick={() => setMode('url')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'url'
              ? 'bg-red-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          URL
        </button>
      </div>

      {mode === 'file' ? (
        <label className="flex flex-col items-center gap-3 cursor-pointer group">
          <svg
            className="w-12 h-12 text-zinc-500 group-hover:text-red-500 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <span className="text-zinc-400 text-sm group-hover:text-zinc-300 transition-colors">
            Clique para selecionar um arquivo de video
          </span>
          <span className="text-zinc-600 text-xs">MP4, WebM, MKV, AVI, etc.</span>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <form onSubmit={handleUrlSubmit} className="flex flex-col gap-3 w-full">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemplo.com/video.mp4"
            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!url.trim()}
            className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Carregar
          </button>
        </form>
      )}
    </div>
  )
}
