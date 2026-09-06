<template>
  <div class="quiz-container">
    <div
      v-for="(pergunta, index) in perguntas"
      :key="pergunta.id"
      class="question-card"
    >
      <button
        class="question-header"
        type="button"
        @click="toggleQuestion(pergunta.id)"
      >
        <span>{{ index + 1 }}. {{ pergunta.pergunta }} {{ pergunta.id }}</span>
        <span class="chevron" :class="{ open: isOpen(pergunta.id) }">⌄</span>
      </button>

      <div v-show="isOpen(pergunta.id)" class="question-body">
        <label class="answer-label" :for="`resposta-${pergunta.id}`">
          {{ t('perguntas.rotulo') }}
        </label>
        <textarea
          :id="`resposta-${pergunta.id}`"
          v-model="respostas[pergunta.id]"
          class="answer-textarea"
          placeholder="{{t('perguntas.descricao')}}"
          rows="5"
        />
      </div>
    </div>

    <div class="verify-wrapper">
      <button
        class="verify-button"
        type="button"
        :disabled="verificando"
        @click="verificarRespostas"
      >
        {{ verificando ? 'Verificando...' : 'Verificar Respuestas' }}
      </button>
    </div>

    <!--exibe resultado da correção, quando o back responder-->
    <div v-if="resultado" class="resultado-box">
      <pre>{{ resultado }}</pre>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import I18nManager from '@/i18n/manager.js'

const { t } = useI18n()

//texto temporário para simular as perguntas
const props = defineProps({
  perguntas: {
    type: Array,
    default: () => ([
      { id: 1, pergunta: "Pregunta" },
      { id: 2, pergunta: "Pregunta" },
      { id: 3, pergunta: "Pregunta" },
    ]),
  },
})

const emit = defineEmits(['verificar'])

//controla quais perguntas estão abertas
const openQuestions = reactive({ 1: true })

function isOpen(id) {
  return !!openQuestions[id]
}

function toggleQuestion(id) {
  openQuestions[id] = !openQuestions[id]
}

//guarda as respostas digitadas por id da pergunta
const respostas = reactive({})

const verificando = ref(false)
const resultado = ref(null)

async function verificarRespostas() {
  verificando.value = true
  resultado.value = null

  const payload = props.perguntas.map((p) => ({
    id: p.id,
    resposta: respostas[p.id] || '',
  }))

  try {
    //const { data } = await axios.post('/api/verificar-respostas', { respostas: payload })
    //resultado.value = data

    //temporário
    await new Promise((r) => setTimeout(r, 800))
    resultado.value = { mensagem: 'Integração pendente', payload }

    emit('verificar', payload)
  } catch (err) {
    resultado.value = { erro: 'Falha ao verificar respostas.' }
    console.error(err)
  } finally {
    verificando.value = false
  }
}
</script>

<style scoped>
.quiz-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: Georgia, 'Times New Roman', serif;
}

.question-card {
  background: #dcdcdc;
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.question-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  border: none;
  padding: 1.1rem 1.3rem;
  font-size: 1rem;
  cursor: pointer;
  text-align: left;
}

.chevron {
  transition: transform 0.2s ease;
  font-size: 1.1rem;
}

.chevron.open {
  transform: rotate(180deg);
}

.question-body {
  padding: 0 1.3rem 1.3rem;
}

.answer-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.answer-textarea {
  width: 100%;
  min-height: 110px;
  border: 1px solid #999;
  border-radius: 4px;
  padding: 0.75rem;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  box-sizing: border-box;
}

.verify-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.verify-button {
  background: #2b2b2b;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.7rem 1.6rem;
  font-size: 0.95rem;
  cursor: pointer;
}

.verify-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.resultado-box {
  margin-top: 1.5rem;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.85rem;
  overflow-x: auto;
}
</style>