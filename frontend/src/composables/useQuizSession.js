import { reactive } from 'vue'
const session = reactive({ selectedFile: '', recordings: {}, startedAt: null })
export function useQuizSession() {
  function reset() { session.selectedFile = ''; session.recordings = {}; session.startedAt = null }
  return { session, reset }
}
