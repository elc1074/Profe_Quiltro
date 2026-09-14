import { reactive } from 'vue'
import { evaluateQuiz, generateQuiz } from '@/services/quizWebhook'

const session = reactive({ selectedFile: '', file: null, quiz: null, recordings: {}, startedAt: null })
export function useQuizSession() {
  async function generate() {
    session.quiz = await generateQuiz(session.file)
    session.recordings = {}
    session.startedAt = new Date()
    return session.quiz
  }
  async function evaluate() {
    const evaluation = await evaluateQuiz(session.quiz, session.recordings)
    const answersByQuestionId = new Map(evaluation.answers.map((answer) => [String(answer.questionId), answer]))

    for (const question of session.quiz.questions) {
      const evaluationAnswer = answersByQuestionId.get(String(question.id))
      const studentAnswer = session.recordings[question.id]?.transcript?.trim()
      question.status = !studentAnswer
        ? 'unanswered'
        : (evaluationAnswer?.score ?? 0) >= 6 ? 'correct' : 'incorrect'
      question.score = evaluationAnswer?.score ?? 0
      question.maxScore = evaluationAnswer?.maxScore ?? 10
      question.expectedAnswer = evaluationAnswer?.expectedAnswer ?? ''
      question.feedback = evaluationAnswer?.feedback ?? ''
    }

    const calculatedScore = session.quiz.questions.reduce((total, question) => total + question.score, 0)
    const calculatedMax = session.quiz.questions.reduce((total, question) => total + question.maxScore, 0)
    session.quiz.totalScore = Number.isFinite(evaluation.overallScore) ? evaluation.overallScore : calculatedScore
    session.quiz.maxScore = Number.isFinite(evaluation.overallMax) ? evaluation.overallMax : calculatedMax
    session.quiz.summary = evaluation.summary
    return session.quiz
  }
  function reset() { session.selectedFile = ''; session.file = null; session.quiz = null; session.recordings = {}; session.startedAt = null }
  return { session, generate, evaluate, reset }
}
