function normalizarPerguntas(resposta) {
  const lista = Array.isArray(resposta)
    ? resposta
    : resposta?.perguntas ?? resposta?.questions

  if (!Array.isArray(lista) || lista.length === 0) return []

  return lista
    .map((item, indice) => ({
      id: item.id ?? item.questionId ?? indice + 1,
      pergunta: item.pergunta ?? item.question ?? item.texto,
    }))
    .filter((item) => typeof item.pergunta === 'string' && item.pergunta.trim())
}

function normalizarJson(valor, mensagemDeErro) {
  if (typeof valor !== 'string') return valor

  try {
    return JSON.parse(valor)
  } catch {
    throw new Error(mensagemDeErro)
  }
}

function normalizarAvaliacao(resposta) {
  const avaliacao = normalizarJson(
    resposta?.output ?? resposta,
    'O n8n retornou uma avaliação em formato inválido.',
  )
  const respostas = avaliacao?.answers ?? avaliacao?.respostas

  if (!Array.isArray(respostas)) {
    throw new Error('O n8n não retornou as avaliações das respostas.')
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
  if (!url) throw new Error('A URL do webhook n8n não foi configurada.')
  return url
}

async function enviarAoWebhook(formulario) {
  let resposta
  try {
    resposta = await fetch(urlDoWebhook(), { method: 'POST', body: formulario })
  } catch {
    throw new Error('Não foi possível acessar o webhook. Verifique a URL e a configuração de CORS.')
  }

  if (!resposta.ok) throw new Error(`O n8n retornou o erro ${resposta.status}.`)
  return resposta.json()
}

export async function generateQuiz(file) {
  const cabecalho = await file.slice(0, 5).text()
  if (cabecalho !== '%PDF-') throw new Error('Selecione um arquivo PDF válido antes de gerar o quiz.')

  const formulario = new FormData()
  formulario.append('action', 'generate')
  formulario.append('data', file)

  const retorno = await enviarAoWebhook(formulario)
  const perguntas = normalizarPerguntas(retorno)
  if (perguntas.length === 0) throw new Error('O n8n não retornou uma lista de perguntas.')

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
      expectedAnswer: '',
      feedback: '',
    })),
    totalScore: 0,
    maxScore: perguntas.length * 10,
  }
}

export async function evaluateQuiz(quiz, recordings) {
  if (!quiz?.chapter?.trim()) {
    throw new Error('O capítulo não foi retornado ao gerar o quiz. Ajuste a resposta do fluxo generate para incluir "chapter".')
  }

  const answers = quiz.questions.map((question) => ({
    questionId: question.id,
    question: question.prompt,
    answer: recordings[question.id]?.transcript?.trim() ?? '',
  }))

  const formulario = new FormData()
  formulario.append('action', 'evaluate')
  formulario.append('chapter', quiz.chapter)
  formulario.append('answers', JSON.stringify(answers))

  return normalizarAvaliacao(await enviarAoWebhook(formulario))
}
