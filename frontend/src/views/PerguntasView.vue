<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import I18nManager from '@/i18n/manager'
import { useQuizSession } from '@/composables/useQuizSession'
import { KrokoLiveTranscription } from '@/services/krokoLiveTranscription'

const { t, locale } = useI18n()
const router = useRouter()
const { session } = useQuizSession()
const quiz = computed(() => session.quiz)
const current = ref(0)
const recording = ref(false)
const elapsed = ref(0)
const confirmSend = ref(false)
const liveTranscript = ref('')
const transcriptionStatus = ref('')
const transcriptionError = ref('')
let timer
let activeTranscription = null
let recordingQuestionId = null

const question = computed(() => quiz.value?.questions[current.value])
const answered = computed(() => Object.keys(session.recordings).length)
const savedRecording = computed(() => session.recordings[question.value?.id])

function format(seconds) {
  const rounded = Math.max(0, Math.round(seconds || 0))
  return `${String(Math.floor(rounded / 60)).padStart(2, '0')}:${String(rounded % 60).padStart(2, '0')}`
}
function recordingDuration(id) {
  const saved = session.recordings[id]
  return typeof saved === 'number' ? saved : saved?.duration || 0
}
async function startRecording() {
  transcriptionError.value = ''
  transcriptionStatus.value = ''
  liveTranscript.value = ''
  elapsed.value = 0
  recordingQuestionId = question.value.id
  try {
    activeTranscription = new KrokoLiveTranscription({
      language: locale.value,
      onLoading: (status) => { transcriptionStatus.value = status },
      onTranscript: (transcript) => {
        if (recordingQuestionId === question.value?.id) liveTranscript.value = transcript
      },
    })
    await activeTranscription.start()
    recording.value = true
    timer = setInterval(() => { elapsed.value += 1 }, 1000)
  } catch (error) {
    await activeTranscription?.cancel()
    activeTranscription = null
    recordingQuestionId = null
    transcriptionStatus.value = ''
    transcriptionError.value = error.message || 'Não foi possível iniciar a transcrição.'
  }
}
async function stopRecording() {
  if (!activeTranscription || !recordingQuestionId) return
  const questionId = recordingQuestionId
  recording.value = false
  clearInterval(timer)
  transcriptionStatus.value = 'Finalizando a transcrição…'
  try {
    const result = await activeTranscription.stop()
    if (!result) return
    session.recordings[questionId] = {
      ...result,
      duration: Math.max(1, Math.round(result.duration)),
      transcript: result.transcript || liveTranscript.value,
    }
    elapsed.value = session.recordings[questionId].duration
  } catch (error) {
    transcriptionError.value = error.message || 'Não foi possível finalizar a transcrição.'
  } finally {
    activeTranscription = null
    recordingQuestionId = null
    transcriptionStatus.value = ''
  }
}
async function toggleRecording() { if (recording.value) await stopRecording(); else await startRecording() }
async function select(index) {
  if (recording.value) await stopRecording()
  current.value = index
  elapsed.value = recordingDuration(quiz.value.questions[index].id)
  liveTranscript.value = ''
  transcriptionError.value = ''
}
function removeRecording() {
  const saved = savedRecording.value
  if (saved?.audioUrl) URL.revokeObjectURL(saved.audioUrl)
  delete session.recordings[question.value.id]
  elapsed.value = 0
  liveTranscript.value = ''
}
async function finish() {
  if (recording.value) await stopRecording()
  if (answered.value < quiz.value.questions.length) confirmSend.value = true
  else send()
}
function send() {
  for (const item of quiz.value.questions) {
    const answer = session.recordings[item.id]
    if (answer && typeof answer !== 'number') {
      item.durationSeconds = answer.duration
      item.studentAnswerLabel = answer.transcript.trim() || 'Resposta em áudio sem transcrição.'
    }
  }
  clearInterval(timer)
  router.push(I18nManager.i18nRoute({ name: 'correcao' }))
}
onMounted(() => { if (!session.quiz) router.replace(I18nManager.i18nRoute({ name: 'home' })) })
onBeforeUnmount(async () => { clearInterval(timer); await activeTranscription?.cancel() })
</script>

<template>
  <main v-if="quiz" class="quiz-page">
    <div class="quiz-header"><div><p class="eyebrow">{{ t('quiz.eyebrow', { current: current + 1, total: quiz.questionCount }) }}</p><h1>{{ t('quiz.title') }}</h1></div><div class="answered"><span>✦</span>{{ t('quiz.answered', { count: answered, total: quiz.questionCount }) }}</div></div>
    <div class="quiz-layout">
      <aside class="question-index"><p>{{ t('quiz.indexTitle') }}</p><button v-for="(item, index) in quiz.questions" :key="item.id" :class="{ active: index === current, done: session.recordings[item.id] }" @click="select(index)"><span>{{ item.id }}</span><i>{{ session.recordings[item.id] ? '✓' : '·' }}</i></button></aside>
      <section class="question-panel">
        <div class="question-top"><span>{{ t('quiz.questionLabel', { number: current + 1 }) }}</span><span class="timer">◷ {{ format(elapsed) }}</span></div>
        <h2>{{ question.prompt }}</h2>
        <div class="audio-studio" :class="{ recording, saved: savedRecording && !recording }">
          <p v-if="recording" class="recording-label"><i></i>{{ t('quiz.recording') }}</p>
          <p v-else-if="savedRecording">{{ t('quiz.readyAudio', { time: format(savedRecording.duration) }) }}</p>
          <p v-else>{{ t('quiz.readyToRecord') }}</p>
          <p v-if="transcriptionStatus" class="transcription-status" aria-live="polite">{{ transcriptionStatus }}</p>
          <p v-if="transcriptionError" class="transcription-error" role="alert">{{ transcriptionError }}</p>
          <div class="wave" aria-hidden="true"><span v-for="n in 18" :key="n"></span></div>
          <button class="microphone" :class="{ stop: recording }" :disabled="!!transcriptionStatus && !recording" @click="toggleRecording"><span>{{ recording ? '■' : '●' }}</span><b>{{ recording ? t('quiz.stop') : t('quiz.record') }}</b></button>
          <section v-if="recording" class="live-transcript" aria-live="polite"><span>Transcrição ao vivo</span><p>{{ liveTranscript || 'O que você disser aparecerá aqui…' }}</p></section>
          <section v-else-if="savedRecording" class="transcript-editor"><label :for="`transcript-${question.id}`">Revise sua resposta antes de enviar</label><textarea :id="`transcript-${question.id}`" v-model="savedRecording.transcript" rows="5" spellcheck="true" /><p>Você pode corrigir qualquer palavra reconhecida incorretamente.</p></section>
          <div v-if="savedRecording && !recording" class="audio-actions"><audio v-if="savedRecording.audioUrl" :src="savedRecording.audioUrl" controls /><button @click="removeRecording">× {{ t('quiz.rerecord') }}</button></div>
        </div>
        <div class="quiz-navigation"><button :disabled="current === 0" @click="select(current - 1)">← {{ t('quiz.previous') }}</button><button v-if="current < quiz.questions.length - 1" class="next" @click="select(current + 1)">{{ t('quiz.next') }} →</button><button v-else class="send" @click="finish">{{ t('quiz.send') }} →</button></div>
      </section>
    </div>
    <div v-if="confirmSend" class="modal"><section><span class="modal-leaf">✦</span><h2>{{ t('quiz.pendingTitle') }}</h2><p>{{ t('quiz.pendingDescription', { count: quiz.questionCount - answered }) }}</p><div><button class="secondary" @click="confirmSend = false">{{ t('quiz.review') }}</button><button class="send" @click="send">{{ t('quiz.sendAnyway') }}</button></div></section></div>
  </main>
</template>

<style>
.quiz-page{max-width:1080px;min-height:calc(100vh - 76px);margin:auto;padding:3rem 5vw 5rem}.quiz-header{display:flex;align-items:end;justify-content:space-between;gap:1rem;margin-bottom:2.5rem}.eyebrow{color:#347158;font-size:.76rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.quiz-header h1{margin-top:.45rem;color:#1F5B45;font:700 clamp(2rem,4vw,3rem) Lora,serif}.answered{padding:.55rem .8rem;border-radius:99px;color:#347158;background:#E7F3EA;font-size:.82rem;font-weight:700;white-space:nowrap}.quiz-layout{display:grid;grid-template-columns:180px 1fr;gap:2rem}.question-index{padding:.7rem;align-self:start;border-radius:18px;background:#F2F8F3}.question-index p{margin:.35rem .45rem .8rem;color:#52705D;font-size:.8rem;font-weight:800}.question-index button{width:100%;padding:.65rem .5rem;display:flex;align-items:center;justify-content:space-between;border:0;border-radius:10px;color:#52705D;background:transparent;cursor:pointer}.question-index button span{display:grid;place-items:center;width:25px;height:25px;border-radius:50%;background:#fff;font-size:.78rem;font-weight:800}.question-index button i{color:#A8C7B4;font-style:normal}.question-index button.done i{color:#2E9E62}.question-index button.active{color:#fff;background:#1F5B45}.question-index button.active span{color:#1F5B45;background:#E7F3EA}.question-panel{padding:clamp(1.5rem,4vw,3rem);border:1px solid #D8E7DC;border-radius:24px;background:#fff;box-shadow:0 14px 35px #1f5b4510}.question-top{display:flex;justify-content:space-between;color:#52705D;font-size:.84rem;font-weight:800}.timer{color:#1F5B45}.question-panel h2{max-width:760px;margin:1.1rem 0 2.5rem;color:#22302A;font:600 clamp(1.45rem,3vw,2rem)/1.35 Lora,serif}.audio-studio{min-height:275px;padding:1.75rem;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:20px;color:#52705D;background:#F2F8F3;text-align:center}.recording-label{color:#C4504B;font-weight:800}.recording-label i{display:inline-block;width:9px;height:9px;margin-right:.4rem;border-radius:50%;background:#D95D55;animation:pulse .8s infinite alternate}.transcription-status{margin:.45rem 0 0;color:#347158;font-size:.82rem;font-weight:700}.transcription-error{max-width:520px;margin:.65rem 0 0;color:#A73D37;font-size:.85rem;line-height:1.4}.wave{height:46px;margin:.85rem 0;display:flex;align-items:center;gap:3px}.wave span{width:4px;height:9px;border-radius:3px;background:#A8C7B4}.recording .wave span{background:#D95D55;animation:wave .7s ease-in-out infinite alternate}.recording .wave span:nth-child(3n){animation-delay:.18s}.recording .wave span:nth-child(2n){animation-delay:.35s}.microphone{width:120px;height:120px;display:grid;place-content:center;gap:.25rem;border:8px solid #D0E6D6;border-radius:50%;color:#fff;background:#1F5B45;cursor:pointer;box-shadow:0 0 0 10px #E7F3EA}.microphone:disabled{opacity:.6;cursor:wait}.microphone.stop{background:#D95D55;border-color:#F6D1CE;box-shadow:0 0 0 10px #FFF0ED}.microphone span{font-size:1.7rem}.microphone b{font-size:.75rem}.live-transcript,.transcript-editor{width:min(100%,620px);margin-top:1.6rem;padding:1rem;border:1px solid #B9D5C2;border-radius:12px;background:#fff;text-align:left}.live-transcript span,.transcript-editor label{display:block;color:#1F5B45;font-size:.78rem;font-weight:800}.live-transcript p{min-height:1.4em;margin-top:.45rem;color:#22302A;line-height:1.5}.transcript-editor textarea{box-sizing:border-box;width:100%;margin-top:.55rem;padding:.7rem;border:1px solid #B9D5C2;border-radius:8px;color:#22302A;background:#fff;font:inherit;line-height:1.5;resize:vertical}.transcript-editor p{margin-top:.5rem;color:#52705D;font-size:.78rem;line-height:1.4}.audio-actions{width:min(100%,620px);margin-top:1rem;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:.7rem}.audio-actions audio{max-width:100%;height:36px}.audio-actions button,.quiz-navigation button,.secondary{padding:.65rem .85rem;border:1px solid #B9D5C2;border-radius:10px;color:#1F5B45;background:#fff;font-weight:800;cursor:pointer}.quiz-navigation{display:flex;justify-content:space-between;margin-top:2rem}.quiz-navigation button:disabled{opacity:.35;cursor:not-allowed}.quiz-navigation .next,.send{color:#fff;background:#1F5B45;border-color:#1F5B45}.modal{position:fixed;inset:0;z-index:20;display:grid;place-items:center;padding:1.5rem;background:#10251c99}.modal section{max-width:430px;padding:2.2rem;border-radius:22px;background:#FAF8F1;text-align:center}.modal-leaf{color:#347158;font-size:2rem}.modal h2{margin:.7rem 0;color:#1F5B45;font:700 1.65rem Lora,serif}.modal p{color:#52705D;line-height:1.55}.modal section div{margin-top:1.5rem;display:flex;justify-content:center;gap:.6rem}.dark .quiz-header h1,.dark .question-panel h2,.dark .modal h2{color:#BEE0C9}.dark .question-panel,.dark .modal section,.dark .live-transcript,.dark .transcript-editor{background:#18382B;border-color:#29503B}.dark .audio-studio,.dark .question-index{background:#122C20}.dark .question-top,.dark .audio-studio,.dark .question-index p,.dark .modal p,.dark .transcript-editor p{color:#B8D4C1}.dark .live-transcript p,.dark .transcript-editor textarea{color:#EAF3EC;background:#10251C;border-color:#356447}.dark .live-transcript span,.dark .transcript-editor label{color:#BEE0C9}.dark .audio-actions button,.dark .quiz-navigation button,.dark .secondary{color:#BEE0C9;background:#18382B;border-color:#356447}.dark .quiz-navigation .next,.dark .send{background:#347158}.dark .answered{background:#18382B}@keyframes wave{to{height:40px}}@keyframes pulse{to{transform:scale(1.5);opacity:.5}}@media(max-width:720px){.quiz-page{padding-top:2rem}.quiz-header{align-items:start;flex-direction:column;margin-bottom:1.3rem}.quiz-layout{grid-template-columns:1fr;gap:1rem}.question-index{display:flex;align-items:center;gap:.3rem;overflow-x:auto}.question-index p,.question-index button i{display:none}.question-index button{flex:0 0 auto;width:42px;padding:.35rem}.question-panel{padding:1.4rem}.audio-studio{padding:1.2rem}.microphone{width:106px;height:106px}.quiz-navigation{gap:.7rem}.audio-actions{flex-direction:column}}
</style>
