<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const modoUpload = ref(false)
const carregando = ref(false)
const erroUpload = ref('')
const inputArquivo = ref(null)

function abrirSeletorArquivo() {
  inputArquivo.value?.click()
}

function iniciarQuestionario() {
  modoUpload.value = true
  erroUpload.value = ''
}

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

async function validarArquivo(arquivo) {
  if (!arquivo) return

  const cabecalho = await arquivo.slice(0, 5).text()
  const ehPdf = cabecalho === '%PDF-'

  if (!ehPdf) {
    erroUpload.value = t('home.upload.invalid_file')
    return
  }

  erroUpload.value = ''
  carregando.value = true

  try {
    const urlWebhook = import.meta.env.VITE_N8N_QUIZ_URL
    if (!urlWebhook) {
      throw new Error('A URL do webhook n8n não foi configurada.')
    }

    const formulario = new FormData()
    formulario.append('action', 'generate')
    formulario.append('data', arquivo)

    const resposta = await fetch(urlWebhook, {
      method: 'POST',
      body: formulario,
    })

    if (!resposta.ok) {
      throw new Error(`O n8n retornou o erro ${resposta.status}.`)
    }

    const dados = await resposta.json()
    const perguntas = normalizarPerguntas(dados)

    if (perguntas.length === 0) {
      console.error('Formato de resposta inesperado do n8n:', dados)
      throw new Error('O n8n não retornou uma lista de perguntas.')
    }

    sessionStorage.setItem('profe-quiltro-perguntas', JSON.stringify(perguntas))
    await router.push({
      name: 'perguntas',
      params: { locale: route.params.locale },
    })
  } catch (erro) {
    console.error('Falha ao criar questionário:', erro)
    erroUpload.value = 'Não foi possível criar o questionário. Tente novamente.'
  } finally {
    carregando.value = false
  }
}

function selecionarArquivo(event) {
  void validarArquivo(event.target.files?.[0])
  event.target.value = ''
}

function soltarArquivo(event) {
  void validarArquivo(event.dataTransfer.files?.[0])
}
</script>

<template>
  <main class="pagina-inicial">
    <section v-if="!modoUpload" class="apresentacao">
      <div class="apresentacao-texto">
        <p>{{ t('home.intro') }}</p>
      </div>
      <div class="apresentacao-ilustracao" aria-hidden="true"></div>
    </section>

    <section v-else class="upload-view">
      <button class="voltar" type="button" @click="modoUpload = false">
        {{ t('home.upload.back') }}
      </button>
      <button
        class="area-upload"
        type="button"
        @click="abrirSeletorArquivo"
        @dragover.prevent
        @drop.prevent="soltarArquivo">
        <span class="icone-arquivo" aria-hidden="true"><span>+</span></span>
        <strong>{{ t('home.upload.title') }}</strong>
        <small>{{ t('home.upload.accepted') }}</small>
      </button>
      <input
        ref="inputArquivo"
        class="input-arquivo"
        type="file"
        accept="application/pdf,.pdf"
        @change="selecionarArquivo" />
      <p v-if="erroUpload" class="mensagem-erro" role="alert">{{ erroUpload }}</p>
    </section>

    <button v-if="!modoUpload" class="botao-principal" type="button" @click="iniciarQuestionario">
      {{ t('home.create') }}
    </button>

    <div v-if="carregando" class="modal-fundo" role="dialog" aria-modal="true" :aria-label="t('home.loading.title')">
      <section class="modal-carregamento">
        <div class="modal-marca" aria-hidden="true"></div>
        <h1>Profe Quiltro</h1>
        <p>{{ t('home.loading.message') }}</p>
        <span class="spinner" aria-hidden="true"></span>
      </section>
    </div>
  </main>
</template>

<style scoped>
.pagina-inicial {
  min-height: calc(100vh - 80px);
  padding: 3.6rem 1.5rem 5rem;
  background: #fff;
  color: #1d1d1d;
  font-family: Georgia, 'Times New Roman', serif;
}

.apresentacao,
.area-upload {
  max-width: 1120px;
  margin: 0 auto;
  border-radius: 9px;
  background: #d9d9d9;
}

.apresentacao {
  min-height: 345px;
  padding: 2.3rem 3rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
}

.apresentacao-texto {
  max-width: 430px;
  padding-top: 1.5rem;
  font-size: 1.1rem;
  text-decoration: underline;
}

.apresentacao-ilustracao {
  width: min(260px, 35%);
  aspect-ratio: 1 / 1;
  border-radius: 9px;
  background: #2b2b2b;
}

.botao-principal {
  display: block;
  margin: 4.1rem auto 0;
  padding: 0.8rem 1.3rem;
  border: 0;
  border-radius: 4px;
  background: #2b2b2b;
  color: #fff;
  font: inherit;
  cursor: pointer;
}

.botao-principal:hover,
.botao-principal:focus-visible {
  background: #444;
}

.upload-view {
  max-width: 1120px;
  margin: 0 auto;
}

.voltar {
  margin-bottom: 1rem;
  border: 0;
  background: transparent;
  color: #2b2b2b;
  font: inherit;
  cursor: pointer;
}

.area-upload {
  min-height: 310px;
  padding: 3.8rem 1.5rem;
  border: 2px dashed #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  text-align: center;
  cursor: pointer;
}

.area-upload:hover,
.area-upload:focus-visible {
  border-color: #2b2b2b;
  background: #d1d1d1;
}

.area-upload strong { 
  font-size: 1.1rem; 
  display: inline-block;
  max-width: 80%;
}

.area-upload small { color: #5b5b5b; }

.icone-arquivo {
  width: 42px;
  height: 50px;
  margin-bottom: 0.8rem;
  border: 2px solid #2b2b2b;
  border-radius: 5px;
  position: relative;
  display: grid;
  place-items: center;
  font-size: 1.8rem;
  line-height: 1;
}

.icone-arquivo::before {
  content: '';
  width: 13px;
  height: 13px;
  position: absolute;
  top: -2px;
  right: -2px;
  border-bottom: 2px solid #2b2b2b;
  border-left: 2px solid #2b2b2b;
  background: #d9d9d9;
}

.input-arquivo { display: none; }

.mensagem-erro {
  margin-top: 1rem;
  color: #a52222;
  text-align: center;
}

.modal-fundo {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 1.2rem;
  background: rgba(29, 29, 29, 0.93);
}

.modal-carregamento {
  width: min(680px, 100%);
  min-height: 475px;
  padding: 3rem 2rem;
  border-radius: 17px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.6rem;
  text-align: center;
}

.modal-marca {
  width: 132px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #2b2b2b;
}

.modal-carregamento h1 {
  font-size: clamp(2.2rem, 6vw, 3.8rem);
  font-weight: 400;
}

.modal-carregamento p {
  margin-top: 2rem;
  font-size: clamp(1.2rem, 3vw, 1.7rem);
}

.spinner {
  width: 70px;
  height: 70px;
  margin-top: 1.2rem;
  border: 3px solid #2b2b2b;
  border-right-color: transparent;
  border-radius: 50%;
  animation: girar 1s linear infinite;
}

@keyframes girar { to { transform: rotate(360deg); } }

@media (max-width: 600px) {
  .pagina-inicial { padding: 2rem 1rem 3rem; }
  .apresentacao { min-height: 410px; padding: 1.5rem; flex-direction: column; }
  .apresentacao-ilustracao { width: 100%; max-width: 190px; align-self: center; }
  .botao-principal { margin-top: 2.5rem; }
}
</style>
