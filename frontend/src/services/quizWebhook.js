import i18n from '../i18n'

const WEBHOOK_TIMEOUT_MS = 45_000
const AI_UNAVAILABLE_PATTERN = /(?:gemini|generative ai|language model|\bllm\b|\bai\b)[\s\S]{0,120}(?:unavailable|overloaded|temporar|quota|rate.?limit|resource.?exhausted)|(?:unavailable|overloaded|temporar|quota|rate.?limit|resource.?exhausted)[\s\S]{0,120}(?:gemini|generative ai|language model|\bllm\b|\bai\b)|unexpected end of json input/i

function erroTraduzido(chave, parametros) {
  return new Error(i18n.global.t(chave, parametros))
}

function registrarFalhaWebhook(contexto, erro) {
  // Mantém o erro original disponível para suporte sem exibi-lo ao estudante.
  console.error(`Webhook ${contexto} failed`, erro)
}

function normalizarPerguntas(resposta) {
  const lista = Array.isArray(resposta)
    ? resposta
    : resposta?.perguntas ?? resposta?.questions

  if (!Array.isArray(lista) || lista.length === 0) return []

  return lista
    .map((item, indice) => ({
      id: item.id ?? item.questionId ?? indice + 1,
      pergunta: item.pergunta ?? item.question ?? item.texto,
      respostaEsperada: item.expectedAnswer ?? item.expected_answer ?? item.respostaEsperada ?? '',
    }))
    .filter(
      (item) =>
        typeof item.pergunta === 'string' &&
        item.pergunta.trim() &&
        typeof item.respostaEsperada === 'string' &&
        item.respostaEsperada.trim(),
    )
}

function normalizarJson(valor, chaveDeErro) {
  if (typeof valor !== 'string') return valor

  try {
    return JSON.parse(valor)
  } catch {
    throw erroTraduzido(chaveDeErro)
  }
}

function normalizarAvaliacao(resposta) {
  const avaliacao = normalizarJson(
    resposta?.output ?? resposta,
    'error.webhook.invalidEvaluation',
  )
  const respostas = avaliacao?.answers ?? avaliacao?.respostas

  if (!Array.isArray(respostas)) {
    throw erroTraduzido('error.webhook.missingEvaluation')
  }

  return {
    answers: respostas.map((item, indice) => ({
      questionId: item.questionId ?? item.id ?? indice + 1,
      score: Number(item.score) || 0,
      maxScore: Number(item.maxScore ?? item.max_score) || 10,
      expectedAnswer: item.expectedAnswer ?? item.expected_answer ?? '',
      feedback: item.feedback ?? '',
    })),
    overallScore: Number(avaliacao.overall_score ?? avaliacao.overallScore),
    overallMax: Number(avaliacao.overall_max ?? avaliacao.overallMax),
    summary: avaliacao.summary ?? '',
  }
}

function urlDoWebhook() {
  const url = import.meta.env.VITE_N8N_QUIZ_URL
  if (!url) throw erroTraduzido('error.webhook.notConfigured')
  return url
}

async function enviarAoWebhook(formulario) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS)
  let resposta

  try {
    resposta = await fetch(urlDoWebhook(), {
      method: 'POST',
      body: formulario,
      signal: controller.signal,
    })
  } catch (erro) {
    registrarFalhaWebhook('request', erro)
    if (erro?.name === 'AbortError') throw erroTraduzido('error.webhook.timeout')

    // O navegador não revela se foi CORS, DNS, certificado, extensão ou rede.
    throw erroTraduzido('error.webhook.connection')
  } finally {
    clearTimeout(timeout)
  }

  const corpo = await lerCorpoDaResposta(resposta)

  if (!resposta.ok) {
    registrarFalhaWebhook(
      `HTTP ${resposta.status}`,
      new Error(`${resposta.statusText}: ${corpo.slice(0, 500)}`),
    )
    if (resposta.status === 401 || resposta.status === 403) {
      throw erroTraduzido('error.webhook.accessDenied')
    }
    if (resposta.status === 404) throw erroTraduzido('error.webhook.notFound')
    if (resposta.status === 413) throw erroTraduzido('error.webhook.fileTooLarge')
    if (erroIndicaIaIndisponivel(corpo)) throw erroTraduzido('error.webhook.aiUnavailable')
    if (resposta.status === 429) throw erroTraduzido('error.webhook.tooManyRequests')
    if (resposta.status >= 500) throw erroTraduzido('error.webhook.server')
    throw erroTraduzido('error.webhook.requestFailed', { status: resposta.status })
  }

  if (!corpo.trim()) {
    registrarFalhaWebhook('empty response', new Error(`HTTP ${resposta.status}`))
    throw erroTraduzido('error.webhook.invalidResponse')
  }

  try {
    return JSON.parse(corpo)
  } catch (erro) {
    registrarFalhaWebhook('invalid JSON response', erro)
    if (erroIndicaIaIndisponivel(corpo)) throw erroTraduzido('error.webhook.aiUnavailable')
    throw erroTraduzido('error.webhook.invalidResponse')
  }
}

function erroIndicaIaIndisponivel(corpo) {
  return AI_UNAVAILABLE_PATTERN.test(corpo)
}

async function lerCorpoDaResposta(resposta) {
  try {
    return await resposta.text()
  } catch (erro) {
    registrarFalhaWebhook('unreadable response', erro)
    throw erroTraduzido('error.webhook.invalidResponse')
  }
}

export async function generateQuiz(file, settings = {}) {
  const cabecalho = await file.slice(0, 5).text()
  if (cabecalho !== '%PDF-') throw erroTraduzido('error.webhook.invalidPdf')

  const formulario = new FormData()
  formulario.append('action', 'generate')
  formulario.append('locale', i18n.global.locale.value)
  formulario.append('questionCount', String(settings.questionCount ?? 5))
  formulario.append('difficulty', settings.difficulty ?? 'easy')
  formulario.append('data', file)

  const retorno = await enviarAoWebhook(formulario)
  const perguntas = normalizarPerguntas(retorno)
  if (perguntas.length === 0) throw erroTraduzido('error.webhook.missingQuestions')

  sessionStorage.setItem('profe-quiltro-perguntas', JSON.stringify(perguntas))

  return {
    id: `quiz-${Date.now()}`,
    sourceFile: file.name,
    chapter: retorno?.chapter ?? retorno?.capitulo ?? '',
    questionCount: perguntas.length,
    questions: perguntas.map((pergunta) => ({
      id: pergunta.id,
      prompt: pergunta.pergunta,
      status: 'unanswered',
      score: 0,
      maxScore: 10,
      durationSeconds: 0,
      studentAnswerLabel: 'Sem resposta',
      expectedAnswer: pergunta.respostaEsperada.trim(),
      feedback: '',
    })),
    totalScore: 0,
    maxScore: perguntas.length * 10,
  }
}

export async function evaluateQuiz(quiz, recordings) {
  if (!quiz?.chapter?.trim()) {
    throw erroTraduzido('error.webhook.missingChapter')
  }

  const answers = quiz.questions.map((question) => ({
    questionId: question.id,
    question: question.prompt,
    answer: recordings[question.id]?.transcript?.trim() ?? '',
  }))

  const formulario = new FormData()
  formulario.append('action', 'evaluate')
  formulario.append('locale', i18n.global.locale.value)
  formulario.append('chapter', quiz.chapter)
  formulario.append('answers', JSON.stringify(answers))

  return normalizarAvaliacao(await enviarAoWebhook(formulario))
}
