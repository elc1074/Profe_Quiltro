const KROKO_API_URL = 'https://license.kroko.ai/api/public/v1/models'
const KROKO_MODEL_BASE_URL = 'https://huggingface.co/Banafo/Kroko-ASR/resolve/main'
const KROKO_CATALOG_TIMEOUT_MS = 8_000
// The Kroko worker reads these generated model-part URLs from this exact cache.
const CACHE_NAME = 'kroko-sdk'
const SAMPLE_RATE = 16_000
const MODEL_PART_NAMES = ['encoder', 'decoder', 'joiner', 'tokens']
const BUILTIN_STREAMING_MODELS = {
  en: { name: 'Kroko-EN-Community-128-L-Streaming-001.data', file_size: 155_836_304 },
  es: { name: 'Kroko-ES-Community-128-L-Streaming-001.data', file_size: 155_836_470 },
  pt: { name: 'Kroko-PT-Community-128-L-Streaming-001.data', file_size: 155_836_324 },
}
const TRACE_STARTED_AT = typeof performance !== 'undefined' ? performance.now() : Date.now()
const transcriptionDiagnostics = []

const recognizers = new Map()
const modelParts = new Map()

function traceClock() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

function traceTranscription(event, details = {}, level = 'info') {
  const entry = {
    elapsedMs: Math.round(traceClock() - TRACE_STARTED_AT),
    event,
    ...details,
  }
  transcriptionDiagnostics.push(entry)
  console[level]?.(`[Kroko +${entry.elapsedMs}ms] ${event}`, details)
}

function startTrace(event, details = {}) {
  const startedAt = traceClock()
  traceTranscription(`${event}:start`, details)
  return (result = {}, level = 'info') => {
    traceTranscription(`${event}:${level === 'error' ? 'error' : 'done'}`, {
      ...details,
      ...result,
      durationMs: Math.round(traceClock() - startedAt),
    }, level)
  }
}

if (typeof window !== 'undefined') {
  window.__KROKO_TRANSCRIPTION_DIAGNOSTICS__ = transcriptionDiagnostics
}

export function getLiveTranscriptionDiagnostics() {
  return [...transcriptionDiagnostics]
}

function normaliseLanguage(language) {
  return language.toLowerCase().split(/[-_]/)[0]
}

export function isLiveTranscriptionSupported() {
  return typeof window !== 'undefined'
    && typeof navigator !== 'undefined'
    && !!navigator.mediaDevices?.getUserMedia
    && typeof window.AudioContext === 'function'
    && typeof window.Worker === 'function'
    && typeof window.caches?.open === 'function'
}

function assertLiveTranscriptionSupport() {
  if (!isLiveTranscriptionSupported()) {
    throw new Error('Este navegador não oferece suporte à transcrição por áudio.')
  }
}

async function getCommunityStreamingModel(language) {
  const targetLanguage = normaliseLanguage(language)
  const builtinModel = BUILTIN_STREAMING_MODELS[targetLanguage]
  if (builtinModel) {
    const model = {
      ...builtinModel,
      language_iso: targetLanguage.toUpperCase(),
      streaming: true,
      type: 'free',
      url: `${KROKO_MODEL_BASE_URL}/${builtinModel.name}?download=true`,
    }
    traceTranscription('catalog.builtin', {
      language: targetLanguage,
      model: model.name,
      modelBytes: model.file_size,
    })
    return model
  }

  // Only unknown/future locales need the remote catalog. The app's supported
  // locales above must not be blocked by an unavailable licensing endpoint.
  const finishCatalog = startTrace('catalog.fetch', { language: targetLanguage })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), KROKO_CATALOG_TIMEOUT_MS)
  let response
  try {
    response = await fetch(KROKO_API_URL, { signal: controller.signal })
    if (!response.ok) throw new Error('Não foi possível obter o modelo de transcrição.')
  } catch (error) {
    const message = error?.name === 'AbortError'
      ? 'A consulta de modelos excedeu 8 segundos.'
      : error?.message
    finishCatalog({ error: message }, 'error')
    throw new Error(message || 'Não foi possível obter o modelo de transcrição.')
  } finally {
    clearTimeout(timeout)
  }

  const models = await response.json()
  const model = models.find((item) => (
    item.streaming
    && item.type === 'free'
    && normaliseLanguage(item.language_iso || '') === targetLanguage
  ))

  if (!model?.url) {
    finishCatalog({ error: `Modelo não encontrado para ${targetLanguage}` }, 'error')
    throw new Error(`Ainda não há um modelo Kroko comunitário para ${targetLanguage}.`)
  }

  finishCatalog({
    model: model.name,
    modelBytes: model.file_size,
    status: response.status,
  })
  return model
}

function getModelPartUrls(modelUrl) {
  return MODEL_PART_NAMES.map((name) => `${modelUrl}/${name}`)
}

async function unpackModel(modelUrl) {
  const finishUnpack = startTrace('model.prepare')
  const cache = await caches.open(CACHE_NAME)
  const partUrls = getModelPartUrls(modelUrl)
  const finishLookup = startTrace('model.parts.lookup')
  const cachedParts = await Promise.all(partUrls.map((url) => cache.match(url)))
  const cacheHits = Object.fromEntries(MODEL_PART_NAMES.map((name, index) => [name, !!cachedParts[index]]))
  finishLookup({ cacheHits })

  // On subsequent visits the worker can read the already extracted files
  // directly. Avoid reading and copying the complete 156 MB archive again.
  if (cachedParts.every(Boolean)) {
    // Clean up the duplicate archive left by older app versions.
    await cache.delete(modelUrl)
    finishUnpack({ source: 'extracted-parts-cache', cacheHits })
    return partUrls
  }

  // Older app versions cached both the archive and its extracted parts. Reuse
  // that archive for this migration, but do not persist it on a cold download.
  let response = await cache.match(modelUrl)
  let source = 'archive-cache'
  if (!response) {
    source = 'network'
    const finishFetch = startTrace('model.fetch')
    try {
      response = await fetch(modelUrl)
      if (!response.ok) throw new Error('Não foi possível baixar o modelo de transcrição.')
      finishFetch({
        status: response.status,
        contentLength: Number(response.headers.get('content-length')) || null,
      })
    } catch (error) {
      finishFetch({ error: error?.message }, 'error')
      finishUnpack({ source, error: error?.message }, 'error')
      throw error
    }
  }

  const finishRead = startTrace('model.body.read', { source })
  let file
  try {
    file = new Uint8Array(await response.arrayBuffer())
    finishRead({ bytes: file.byteLength })
  } catch (error) {
    finishRead({ error: error?.message }, 'error')
    finishUnpack({ source, error: error?.message }, 'error')
    throw error
  }
  if (file.byteLength < 4) throw new Error('O arquivo do modelo Kroko é inválido.')

  const finishExtract = startTrace('model.extract', { bytes: file.byteLength })
  const headerSize = new DataView(file.buffer).getUint32(0, true)
  const payloadOffset = 4 + headerSize
  if (file.byteLength < payloadOffset) throw new Error('O arquivo do modelo Kroko está incompleto.')

  const payload = file.subarray(payloadOffset)
  let offset = 0
  const readPart = () => {
    if (offset + 4 > payload.length) throw new Error('O arquivo do modelo Kroko está corrompido.')
    const size = new DataView(payload.buffer, payload.byteOffset + offset, 4).getUint32(0, true)
    offset += 4
    if (offset + size > payload.length) throw new Error('O arquivo do modelo Kroko está corrompido.')
    // A view avoids another full-size copy while the parts are persisted.
    const part = payload.subarray(offset, offset + size)
    offset += size
    return part
  }

  const parts = MODEL_PART_NAMES.map(() => readPart())
  const partSizes = Object.fromEntries(MODEL_PART_NAMES.map((name, index) => [name, parts[index].byteLength]))
  finishExtract({ headerSize, partSizes })

  // Free the legacy archive before writing missing parts so upgrades do not
  // temporarily require storage for two complete copies of the model.
  await cache.delete(modelUrl)
  await Promise.all(parts.map(async (part, index) => {
    const name = MODEL_PART_NAMES[index]
    if (cachedParts[index]) {
      traceTranscription('model.part.cache:skip', { name, bytes: part.byteLength })
      return
    }

    const finishPartCache = startTrace('model.part.cache', { name, bytes: part.byteLength })
    try {
      await cache.put(partUrls[index], new Response(part))
      finishPartCache()
    } catch (error) {
      finishPartCache({ error: error?.message }, 'error')
      throw error
    }
  }))

  finishUnpack({ source, cacheHits, partSizes })
  return partUrls
}

function getModelParts(language) {
  const normalizedLanguage = normaliseLanguage(language)
  if (!modelParts.has(normalizedLanguage)) {
    traceTranscription('model.promise:create', { language: normalizedLanguage })
    modelParts.set(normalizedLanguage, (async () => {
      const model = await getCommunityStreamingModel(normalizedLanguage)
      return unpackModel(model.url)
    })())
  } else {
    traceTranscription('model.promise:reuse', { language: normalizedLanguage })
  }

  return modelParts.get(normalizedLanguage).catch((error) => {
    modelParts.delete(normalizedLanguage)
    throw error
  })
}

async function getRecognizer(language, onLoading) {
  const normalizedLanguage = normaliseLanguage(language)
  if (!recognizers.has(normalizedLanguage)) {
    const finishRecognizer = startTrace('recognizer.prepare', { language: normalizedLanguage })
    recognizers.set(normalizedLanguage, (async () => {
      try {
        onLoading?.('Baixando o modelo de transcrição…')
        const [encoder, decoder, joiner, tokens] = await getModelParts(normalizedLanguage)

        onLoading?.('Preparando a transcrição local…')
        const finishImport = startTrace('sdk.import')
        const { KrokoWorker } = await import('@/vendor/kroko-sdk.js')
        finishImport()

        const finishWorker = startTrace('worker.create')
        const worker = new KrokoWorker()
        finishWorker()

        const finishCreateRecognizer = startTrace('recognizer.create')
        const recognizer = await worker.createOnlineRecognizer({
          modelConfig: {
            transducer: { encoder, decoder, joiner },
            tokens,
          },
        })
        finishCreateRecognizer()
        finishRecognizer()
        return recognizer
      } catch (error) {
        finishRecognizer({ error: error?.message }, 'error')
        throw error
      }
    })())
  } else {
    traceTranscription('recognizer.promise:reuse', { language: normalizedLanguage })
  }

  try {
    return await recognizers.get(normalizedLanguage)
  } catch (error) {
    recognizers.delete(normalizedLanguage)
    throw error
  }
}

// Starts the download and initialization ahead of recording. Subsequent
// recordings reuse the recognizer cached by language above.
export async function preloadLiveTranscription(language) {
  assertLiveTranscriptionSupport()
  const normalizedLanguage = normaliseLanguage(language)
  const finishPreload = startTrace('preload', { language: normalizedLanguage })
  try {
    await getRecognizer(normalizedLanguage)
    finishPreload()
  } catch (error) {
    finishPreload({ error: error?.message }, 'error')
    throw error
  }
}

function downsample(samples, inputSampleRate) {
  if (inputSampleRate === SAMPLE_RATE) return samples

  const ratio = inputSampleRate / SAMPLE_RATE
  const output = new Float32Array(Math.round(samples.length / ratio))
  let inputOffset = 0

  for (let outputOffset = 0; outputOffset < output.length; outputOffset += 1) {
    const nextInputOffset = Math.round((outputOffset + 1) * ratio)
    let sum = 0
    let count = 0
    for (let index = inputOffset; index < nextInputOffset && index < samples.length; index += 1) {
      sum += samples[index]
      count += 1
    }
    output[outputOffset] = count ? sum / count : 0
    inputOffset = nextInputOffset
  }

  return output
}

function toWav(chunks) {
  const length = chunks.reduce((total, chunk) => total + chunk.length, 0)
  const buffer = new ArrayBuffer(44 + (length * 2))
  const view = new DataView(buffer)
  view.setUint32(0, 0x46464952, true)
  view.setUint32(4, 36 + (length * 2), true)
  view.setUint32(8, 0x45564157, true)
  view.setUint32(12, 0x20746d66, true)
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, SAMPLE_RATE * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  view.setUint32(36, 0x61746164, true)
  view.setUint32(40, length * 2, true)

  let offset = 44
  for (const chunk of chunks) {
    for (const sample of chunk) {
      const value = Math.max(-1, Math.min(1, sample))
      view.setInt16(offset, value * 0x7fff, true)
      offset += 2
    }
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

export class KrokoLiveTranscription {
  constructor({ language = 'pt', onTranscript, onLoading } = {}) {
    this.language = language
    this.onTranscript = onTranscript
    this.onLoading = onLoading
    this.confirmedSegments = []
    this.partialSegment = ''
    this.audioChunks = []
    this.processing = Promise.resolve()
    this.recording = false
  }

  get transcript() {
    return [...this.confirmedSegments, this.partialSegment].filter(Boolean).join(' ').trim()
  }

  emitTranscript() {
    this.onTranscript?.(this.transcript)
  }

  async start() {
    assertLiveTranscriptionSupport()
    const language = normaliseLanguage(this.language)
    const finishStart = startTrace('recording.start', { language })

    try {
      this.onLoading?.('Preparando o microfone…')
      const finishRecognizerWait = startTrace('recording.recognizer.wait', { language })
      try {
        this.recognizer = await getRecognizer(this.language, this.onLoading)
        finishRecognizerWait()
      } catch (error) {
        finishRecognizerWait({ error: error?.message }, 'error')
        throw error
      }

      const finishMicrophone = startTrace('microphone.request')
      try {
        this.microphone = await navigator.mediaDevices.getUserMedia({
          audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
        })
        const track = this.microphone.getAudioTracks()[0]
        finishMicrophone({
          label: track?.label || null,
          readyState: track?.readyState || null,
        })
      } catch (error) {
        finishMicrophone({ error: error?.message, name: error?.name }, 'error')
        throw error
      }

      const finishAudioContext = startTrace('audio-context.prepare')
      try {
        this.audioContext = new AudioContext()
        await this.audioContext.resume()
        finishAudioContext({
          sampleRate: this.audioContext.sampleRate,
          state: this.audioContext.state,
        })
      } catch (error) {
        finishAudioContext({ error: error?.message }, 'error')
        throw error
      }

      this.source = this.audioContext.createMediaStreamSource(this.microphone)
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1)
      this.silentGain = this.audioContext.createGain()
      this.silentGain.gain.value = 0

      const finishStream = startTrace('recognizer.stream.create')
      try {
        this.stream = await this.recognizer.createStream()
        finishStream()
      } catch (error) {
        finishStream({ error: error?.message }, 'error')
        throw error
      }
      this.recording = true

      this.processor.onaudioprocess = (event) => {
        if (!this.recording) return
        const rawSamples = Float32Array.from(event.inputBuffer.getChannelData(0))
        const samples = downsample(rawSamples, this.audioContext.sampleRate)
        this.audioChunks.push(Float32Array.from(samples))
        this.processing = this.processing.then(() => this.process(samples))
      }

      this.source.connect(this.processor)
      this.processor.connect(this.silentGain)
      this.silentGain.connect(this.audioContext.destination)
      this.onLoading?.('')
      finishStart()
    } catch (error) {
      finishStart({ error: error?.message, name: error?.name }, 'error')
      throw error
    }
  }

  async process(samples) {
    await this.stream.acceptWaveform(SAMPLE_RATE, samples)
    while (await this.recognizer.isReady(this.stream)) {
      await this.recognizer.decode(this.stream)
    }

    const result = (await this.recognizer.getResult(this.stream)).text.trim()
    if (result) this.partialSegment = result

    if (await this.recognizer.isEndpoint(this.stream)) {
      if (this.partialSegment) this.confirmedSegments.push(this.partialSegment)
      this.partialSegment = ''
      await this.recognizer.reset(this.stream)
    }

    this.emitTranscript()
  }

  async stop() {
    if (!this.recording) return null
    this.recording = false
    this.processor?.disconnect()
    this.source?.disconnect()
    this.microphone?.getTracks().forEach((track) => track.stop())
    await this.processing

    await this.stream.inputFinished()
    while (await this.recognizer.isReady(this.stream)) {
      await this.recognizer.decode(this.stream)
    }
    const finalResult = (await this.recognizer.getResult(this.stream)).text.trim()
    if (finalResult && finalResult !== this.partialSegment) this.partialSegment = finalResult
    if (this.partialSegment) this.confirmedSegments.push(this.partialSegment)
    this.partialSegment = ''
    this.emitTranscript()

    await this.stream.free()
    await this.audioContext?.close()
    const audio = toWav(this.audioChunks)
    return {
      audio,
      audioUrl: URL.createObjectURL(audio),
      duration: this.audioChunks.reduce((total, chunk) => total + chunk.length, 0) / SAMPLE_RATE,
      transcript: this.transcript,
    }
  }

  async cancel() {
    if (!this.recording) return
    this.recording = false
    this.processor?.disconnect()
    this.source?.disconnect()
    this.microphone?.getTracks().forEach((track) => track.stop())
    await this.stream?.free()
    await this.audioContext?.close()
  }
}
