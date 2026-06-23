import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

let ffmpeg: FFmpeg | null = null
let transcodeProgressCallback: ((p: number) => void) | null = null

const SUPPORTED_EXTENSIONS = new Set([
  'mp4', 'webm', 'ogg', 'ogv',
])

const SUPPORTED_MIMES = new Set([
  'video/mp4', 'video/webm', 'video/ogg',
])

export function isFormatSupported(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext && SUPPORTED_EXTENSIONS.has(ext)) return true
  if (SUPPORTED_MIMES.has(file.type)) return true
  return false
}

export function isURLSupported(url: string): boolean {
  const ext = url.split('.').pop()?.split('?')[0]?.toLowerCase()
  return !!ext && SUPPORTED_EXTENSIONS.has(ext)
}

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg?.loaded) return ffmpeg

  ffmpeg = new FFmpeg()

  ffmpeg.on('progress', ({ progress }) => {
    transcodeProgressCallback?.(progress)
  })

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  })

  return ffmpeg
}

async function transcode(
  inputName: string,
  data: Uint8Array,
  onProgress?: (p: number) => void,
): Promise<Blob> {
  transcodeProgressCallback = onProgress ?? null

  const instance = await getFFmpeg()
  const outputName = 'output.webm'

  await instance.writeFile(inputName, data)

  await instance.exec([
    '-i', inputName,
    '-c:v', 'libvpx',
    '-crf', '10',
    '-b:v', '1M',
    '-c:a', 'libvorbis',
    '-q:a', '5',
    outputName,
  ])

  const outputData = await instance.readFile(outputName)

  await instance.deleteFile(inputName)
  await instance.deleteFile(outputName)

  transcodeProgressCallback = null

  // @ts-expect-error FileData Uint8Array type incompatibility with BlobPart
  return new Blob([outputData], { type: 'video/webm' })
}

export async function transcodeFileToWebM(
  file: File,
  onProgress?: (p: number) => void,
): Promise<Blob> {
  const ext = file.name.split('.').pop() || 'mkv'
  const inputName = `input.${ext}`
  const data = await fetchFile(file)
  return transcode(inputName, data, onProgress)
}

export async function transcodeURLToWebM(
  url: string,
  onProgress?: (p: number) => void,
): Promise<Blob> {
  const ext = url.split('.').pop()?.split('?')[0] || 'mp4'
  const inputName = `input.${ext}`
  const data = await fetchFile(url)
  return transcode(inputName, data, onProgress)
}
