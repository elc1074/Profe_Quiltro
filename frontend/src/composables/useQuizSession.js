import { reactive } from 'vue'
import { generateQuiz } from '@/services/quizWebhook'

const session = reactive({ selectedFile: '', file: null, quiz: null, recordings: {}, startedAt: null })
export function useQuizSession() {
  async function generate() {
    session.quiz = await generateQuiz(session.file)
    session.recordings = {}
    session.startedAt = new Date()
    return session.quiz
  }
  function reset() { session.selectedFile = ''; session.file = null; session.quiz = null; session.recordings = {}; session.startedAt = null }
  return { session, generate, reset }
}
