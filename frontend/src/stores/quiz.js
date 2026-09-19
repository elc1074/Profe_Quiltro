import { defineStore } from 'pinia'
import mockQuiz from '../data/mockQuiz.json'

function initialRecordings(questions) {
  const map = {}
  questions.forEach((q) => {
    map[q.id] = { status: 'idle', elapsed: 0 } // idle | recording | recorded
  })
  return map
}

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    file: null, // { name, size }
    questionCount: 5, // fixed for now; architecture supports 5 or 10 later
    availableCounts: [5, 10],

    generating: false,
    generated: false,

    questions: mockQuiz.questions.map((q) => ({ id: q.id, prompt: q.prompt })),
    recordings: initialRecordings(mockQuiz.questions),
    currentIndex: 0,

    grading: false,
    result: null, // filled with mockQuiz after grading completes

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
      // Simulated staged progress; the calling view drives the visible steps.
      await new Promise((resolve) => setTimeout(resolve, 3200))
      this.generating = false
      this.generated = true
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
      if (!q) return
      this.recordings[q.id].elapsed++
    },
    startRecording(id) {
      this.recordings[id].status = 'recording'
    },
    stopRecording(id) {
      this.recordings[id].status = 'recorded'
    },
    reRecord(id) {
      this.recordings[id].status = 'recording'
    },
    deleteRecording(id) {
      this.recordings[id].status = 'idle'
    },
    async submitForGrading() {
      this.grading = true
      await new Promise((resolve) => setTimeout(resolve, 2600))
      this.grading = false
      this.result = mockQuiz
    },
    resetQuiz() {
      this.file = null
      this.generating = false
      this.generated = false
      this.currentIndex = 0
      this.recordings = initialRecordings(mockQuiz.questions)
      this.grading = false
      this.result = null
      this.showUnansweredDialog = false
    },
  },
})
