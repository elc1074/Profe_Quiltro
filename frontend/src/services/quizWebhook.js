function normalizarPerguntas(resposta) {
  const lista = Array.isArray(resposta)
    ? resposta
    : resposta?.perguntas ?? resposta?.questions

  if (!Array.isArray(lista) || lista.length === 0) return []

  return lista
    .map((item, indice) => ({
      id: item.id ?? indice + 1,
      pergunta: item.pergunta ?? item.question ?? item.texto,
    }))
    .filter((item) => typeof item.pergunta === 'string' && item.pergunta.trim())
}

export async function generateQuiz(file) {
  const cabecalho = await file.slice(0, 5).text()
  if (cabecalho !== '%PDF-') throw new Error('Selecione um arquivo PDF válido antes de gerar o quiz.')

  const urlWebhook = import.meta.env.VITE_N8N_QUIZ_URL
  if (!urlWebhook) throw new Error('A URL do webhook n8n não foi configurada.')

  const formulario = new FormData()
  formulario.append('action', 'generate')
  formulario.append('data', file)

  let resposta
  try {
    resposta = await fetch(urlWebhook, { method: 'POST', body: formulario })
  } catch {
    throw new Error('Não foi possível acessar o webhook. Verifique a URL e a configuração de CORS.')
  }

  if (!resposta.ok) throw new Error(`O n8n retornou o erro ${resposta.status}.`)

  const perguntas = normalizarPerguntas(await resposta.json())
  if (perguntas.length === 0) throw new Error('O n8n não retornou uma lista de perguntas.')

  sessionStorage.setItem('profe-quiltro-perguntas', JSON.stringify(perguntas))

  return {
    id: `quiz-${Date.now()}`,
    sourceFile: file.name,
    questionCount: perguntas.length,
    questions: perguntas.map((pergunta) => ({
      id: pergunta.id,
      prompt: pergunta.pergunta,
      status: 'unanswered',
      score: 0,
      durationSeconds: 0,
      studentAnswerLabel: 'Sin respuesta',
      expectedAnswer: '',
      feedback: '',
    })),
    totalScore: 0,
    maxScore: perguntas.length * 2,
  }
}
