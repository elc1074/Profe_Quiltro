const KROKO_API_URL = 'https://license.kroko.ai/api/public/v1/models'
// The Kroko worker reads these generated model-part URLs from this exact cache.
const CACHE_NAME = 'kroko-sdk'
const SAMPLE_RATE = 16_000

const recognizers = new Map()

function normaliseLanguage(language) {
  return language.toLowerCase().split(/[-_]/)[0]
}

async function getCommunityStreamingModel(language) {
  const response = await fetch(KROKO_API_URL)
  if (!response.ok) throw new Error('Não foi possível obter o modelo de transcrição.')

  const targetLanguage = normaliseLanguage(language)
  const models = await response.json()
  const model = models.find((item) => (
    item.streaming
    && item.type === 'free'
    && normaliseLanguage(item.language_iso || '') === targetLanguage
  ))

  if (!model?.url) {
    throw new Error(`Ainda não há um modelo Kroko comunitário para ${targetLanguage}.`)
  }

  return model
}

async function fetchWithCache(url) {
  const cache = await caches.open(CACHE_NAME)
  let response = await cache.match(url)

  if (!response) {
    response = await fetch(url)
    if (!response.ok) throw new Error('Não foi possível baixar o modelo de transcrição.')
    await cache.put(url, response.clone())
  }

  return response
}

async function cacheModelPart(modelUrl, name, data) {
  const cacheUrl = `${modelUrl}/${name}`
  const cache = await caches.open(CACHE_NAME)
  if (!await cache.match(cacheUrl)) {
    await cache.put(cacheUrl, new Response(data))
  }
  return cacheUrl
}

async function unpackModel(modelUrl) {
  const response = await fetchWithCache(modelUrl)
  const file = new Uint8Array(await response.arrayBuffer())
  if (file.byteLength < 4) throw new Error('O arquivo do modelo Kroko é inválido.')

  const headerSize = new DataView(file.buffer).getUint32(0, true)
  const payloadOffset = 4 + headerSize
  if (file.byteLength < payloadOffset) throw new Error('O arquivo do modelo Kroko está incompleto.')

  const payload = file.slice(payloadOffset)
  let offset = 0
  const readPart = () => {
    if (offset + 4 > payload.length) throw new Error('O arquivo do modelo Kroko está corrompido.')
    const size = new DataView(payload.buffer, payload.byteOffset + offset, 4).getUint32(0, true)
    offset += 4
    if (offset + size > payload.length) throw new Error('O arquivo do modelo Kroko está corrompido.')
    const part = payload.slice(offset, offset + size)
    offset += size
    return part
  }

  const [encoder, decoder, joiner, tokens] = [readPart(), readPart(), readPart(), readPart()]
  return Promise.all([
    cacheModelPart(modelUrl, 'encoder', encoder),
    cacheModelPart(modelUrl, 'decoder', decoder),
    cacheModelPart(modelUrl, 'joiner', joiner),
    cacheModelPart(modelUrl, 'tokens', tokens),
  ])
}

async function getRecognizer(language, onLoading) {
  const normalizedLanguage = normaliseLanguage(language)
  if (!recognizers.has(normalizedLanguage)) {
    recognizers.set(normalizedLanguage, (async () => {
      onLoading?.('Baixando o modelo de transcrição…')
      const model = await getCommunityStreamingModel(normalizedLanguage)
      const [encoder, decoder, joiner, tokens] = await unpackModel(model.url)

      onLoading?.('Preparando a transcrição local…')
      const { KrokoWorker } = await import('@/vendor/kroko-sdk.js')
      const worker = new KrokoWorker()
      return worker.createOnlineRecognizer({
        modelConfig: {
          transducer: { encoder, decoder, joiner },
          tokens,
        },
      })
    })())
  }

  try {
    return await recognizers.get(normalizedLanguage)
  } catch (error) {
    recognizers.delete(normalizedLanguage)
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
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Este navegador não permite usar o microfone.')
    }

    this.onLoading?.('Preparando o microfone…')
    this.recognizer = await getRecognizer(this.language, this.onLoading)
    this.microphone = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    })
    this.audioContext = new AudioContext()
    await this.audioContext.resume()
    this.source = this.audioContext.createMediaStreamSource(this.microphone)
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1)
    this.silentGain = this.audioContext.createGain()
    this.silentGain.gain.value = 0
    this.stream = await this.recognizer.createStream()
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
