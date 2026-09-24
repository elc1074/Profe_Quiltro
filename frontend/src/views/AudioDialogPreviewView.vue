<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import AudioLoadingDialog from '../components/AudioLoadingDialog.vue'

const router = useRouter()
const dialogOpen = ref(false)
const loadingMessage = ref('Baixando o modelo de transcrição...')
const simulationRunning = ref(false)
const lastAction = ref('Nenhuma ação realizada.')
let simulationTimer = null

const messages = [
  'Baixando o modelo de transcrição...',
  'Preparando a transcrição local...',
  'Carregamento concluído.',
]

function openDialog() {
  dialogOpen.value = true
  lastAction.value = 'Dialog aberto.'
}

function closeDialog() {
  dialogOpen.value = false
  lastAction.value = 'Dialog fechado. A simulação continua.'
}

function startSimulation() {
  clearInterval(simulationTimer)
  simulationRunning.value = true
  dialogOpen.value = true
  let index = 0
  loadingMessage.value = messages[index]
  lastAction.value = 'Simulação iniciada.'

  simulationTimer = setInterval(() => {
    index += 1
    loadingMessage.value = messages[index]
    if (index === messages.length - 1) {
      clearInterval(simulationTimer)
      simulationRunning.value = false
      lastAction.value = 'Simulação concluída sem usar PDF ou IA.'
    }
  }, 1800)
}

function resetSimulation() {
  clearInterval(simulationTimer)
  simulationRunning.value = false
  dialogOpen.value = false
  loadingMessage.value = messages[0]
  lastAction.value = 'Simulação reiniciada.'
}

onBeforeUnmount(() => clearInterval(simulationTimer))
</script>

<template>
  <main class="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
    <div class="rounded-xl2 bg-cream p-6 shadow-soft dark:bg-lagoon-light/50 dark:shadow-softDark sm:p-8">
      <p class="text-sm font-semibold text-rosewood dark:text-blush">Preview local</p>
      <h1 class="mt-2 font-display text-2xl font-semibold text-lagoon dark:text-cream-soft">
        Teste do dialog de carregamento
      </h1>
      <p class="mt-3 text-sm leading-6 text-lagoon/70 dark:text-cream-soft/70">
        Esta tela não envia arquivos, não chama a IA e não solicita acesso ao microfone. Ela testa somente a abertura, o fechamento e a atualização visual do dialog.
      </p>

      <div class="mt-6 flex flex-wrap gap-3">
        <BaseButton @click="openDialog">Abrir dialog</BaseButton>
        <BaseButton variant="secondary" :disabled="simulationRunning" @click="startSimulation">
          Simular carregamento
        </BaseButton>
        <BaseButton variant="ghost" @click="resetSimulation">Reiniciar</BaseButton>
      </div>

      <p class="mt-6 rounded-lg bg-cream-soft p-3 text-sm text-lagoon/70 dark:bg-lagoon-soft dark:text-cream-soft/70" aria-live="polite">
        {{ lastAction }}
      </p>

      <button
        type="button"
        class="mt-5 text-sm font-semibold text-rosewood underline underline-offset-4 dark:text-blush"
        @click="router.push('/')"
      >
        Voltar para o início
      </button>
    </div>

    <AudioLoadingDialog
      v-if="dialogOpen"
      :message="loadingMessage"
      gif-src="/gato_borboleta_sf.gif"
      @close="closeDialog"
    />
  </main>
</template>
