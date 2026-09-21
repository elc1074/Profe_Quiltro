import { defineStore } from 'pinia'
import { evaluateQuiz as requestEvaluation, generateQuiz as requestQuiz } from '../services/quizWebhook'

function initialRecordings(questions) {
  const map = {}
  questions.forEach((q) => {
    map[q.id] = { status: 'idle', elapsed: 0 } // idle | recording | recorded
  })
  return map
}

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    file: null,
    chapter: '',
    questionCount: 5,
    availableCounts: [5, 10],

    generating: false,
    generated: false,

    questions: [],
    recordings: {},
    currentIndex: 0,

    grading: false,
    result: null,

    showUnansweredDialog: false,
    simulateError: false,
  }),
  getters: {
    hasFile: (state) => !!state.file,
    currentQuestion: (state) => state.questions[state.currentIndex],
    totalQuestions: (state) => state.questions.length,
    answeredCount: (state) =>
      Object.values(state.recordings).filter((r) => r.status === 'recorded').length,
    unansweredIds: (state) =>
      state.questions
        .filter((q) => state.recordings[q.id]?.status !== 'recorded')
        .map((q) => q.id),
    progressPercent: (state) => {
      const answered = Object.values(state.recordings).filter((r) => r.status === 'recorded').length
      return Math.round((answered / state.questions.length) * 100)
    },
  },
  actions: {
    setFile(file) {
      this.file = file
    },
    removeFile() {
      this.file = null
    },
    async generateQuiz() {
      this.generating = true
      this.generated = false
      this.result = null

      try {
        const generatedQuiz = await requestQuiz(this.file)
        this.chapter = generatedQuiz.chapter
        this.questionCount = generatedQuiz.questionCount
        this.questions = generatedQuiz.questions
        this.recordings = initialRecordings(this.questions)
        this.currentIndex = 0
        this.generated = true
      } finally {
        this.generating = false
      }
    },
    goTo(index) {
      if (index >= 0 && index < this.questions.length) this.currentIndex = index
    },
    next() {
      if (this.currentIndex < this.questions.length - 1) this.currentIndex++
    },
    prev() {
      if (this.currentIndex > 0) this.currentIndex--
    },
    tickCurrent() {
      const q = this.currentQuestion
      if (!q || this.recordings[q.id]?.status !== 'recording') return
      this.recordings[q.id].elapsed++
    },
    startRecording(id) {
      this.recordings[id].status = 'recording'
    },
    stopRecording(id, recording) {
      this.recordings[id] = {
        status: 'recorded',
        elapsed: Math.max(1, Math.round(recording?.duration || this.recordings[id]?.elapsed || 0)),
        ...recording,
      }
    },
    updateTranscript(id, transcript) {
      if (this.recordings[id]?.status !== 'recorded') return
      this.recordings[id].transcript = transcript
    },
    deleteRecording(id) {
      if (this.recordings[id]?.audioUrl) URL.revokeObjectURL(this.recordings[id].audioUrl)
      this.recordings[id] = { status: 'idle', elapsed: 0 }
    },
    async submitForGrading() {
      this.grading = true
      try {
        const evaluation = await requestEvaluation({
          chapter: this.chapter,
          questions: this.questions,
        }, this.recordings)
        const answersByQuestionId = new Map(
          evaluation.answers.map((answer) => [String(answer.questionId), answer]),
        )
        const questions = this.questions.map((question) => {
          const answer = answersByQuestionId.get(String(question.id))
          const recording = this.recordings[question.id]
          const studentAnswer = recording?.transcript?.trim() ?? ''
          const score = answer?.score ?? 0

          return {
            ...question,
            status: !studentAnswer ? 'unanswered' : score >= 6 ? 'correct' : 'incorrect',
            score,
            maxScore: answer?.maxScore ?? 10,
            durationSeconds: recording?.elapsed ?? 0,
            studentAnswerLabel: studentAnswer || 'Sem resposta',
            expectedAnswer: answer?.expectedAnswer ?? '',
            feedback: answer?.feedback ?? '',
          }
        })
        const calculatedScore = questions.reduce((total, question) => total + question.score, 0)
        const calculatedMax = questions.reduce((total, question) => total + question.maxScore, 0)

        this.questions = questions
        this.result = {
          questions,
          totalScore: Number.isFinite(evaluation.overallScore) ? evaluation.overallScore : calculatedScore,
          maxScore: Number.isFinite(evaluation.overallMax) ? evaluation.overallMax : calculatedMax,
          summary: evaluation.summary,
        }
      } finally {
        this.grading = false
      }
    },
    resetQuiz() {
      this.file = null
      this.chapter = ''
      this.generating = false
      this.generated = false
      this.questions = []
      this.currentIndex = 0
      this.recordings = {}
      this.grading = false
      this.result = null
      this.showUnansweredDialog = false
    },
  },
})
