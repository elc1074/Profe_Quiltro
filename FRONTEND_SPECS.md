# Especificação de Frontend — Profe Quiltro

## Visão do produto

Prototipo navegável para estudantes universitários de Medicina Veterinária no Chile. O produto transforma um PDF enviado pelo estudante em um quiz de respostas faladas, tornando a revisão mais leve, incentivadora e agradável.

O idioma da interface deve acompanhar o idioma do navegador. A internacionalização já existente deve ser preservada.

## Objetivo do protótipo

Demonstrar o fluxo completo de criação e correção de um quiz com dados simulados. Não há autenticação, processamento de PDF, gravação real ou integração com IA/n8n nesta etapa; a interface deve comunicar esses estados de forma convincente.

## Direção visual

- Tom leve, acolhedor e divertido, sem perder a legibilidade acadêmica.
- Paleta baseada em verdes, com cores de apoio para acerto, erro e avisos.
- Componentes com cantos arredondados, ícones amigáveis, espaços generosos e pequenas mensagens de incentivo.
- Oferecer modo claro e escuro, respeitando a preferência do sistema como padrão e permitindo alternância manual.
- Priorizar celular e desktop; controles de gravação devem ser grandes e fáceis de tocar.

## Navegação e telas

### 1. Home

- Apresenta o propósito: estudar anatomia por meio de quizzes gerados a partir de materiais próprios.
- CTA principal: **Novo quiz**.
- Pode exibir uma breve explicação em três etapas: enviar PDF, responder por áudio e receber feedback.
- Login, perfil e histórico ficam fora do fluxo atual, mas podem aparecer como itens futuros/desabilitados na navegação.

### 2. Envio de material

- Título e instrução para enviar o PDF da disciplina.
- Área de arrastar e soltar e botão para escolher arquivo.
- Exibir nome, tamanho e ação para remover/substituir o PDF selecionado.
- Mostrar que o quiz terá 5 perguntas nesta versão; a arquitetura visual deve comportar futuramente a escolha entre 5 e 10.
- CTA: **Gerar quiz**. Sem arquivo selecionado, o botão permanece desabilitado.

### 3. Geração do quiz

- Estado de carregamento com progresso visual, texto claro e mensagens leves, por exemplo: “Estamos preparando suas perguntas…”.
- Não prometer progresso real: usar uma animação/etapas simuladas até navegar para as perguntas.
- Indicar que as perguntas são elaboradas com IA a partir do material enviado.

### 4. Resposta ao quiz

- Mostrar uma pergunta por vez, seu enunciado e o contador de tempo individual.
- Incluir índice com as 5 perguntas e estados visuais: atual, respondida e não respondida. O estudante pode avançar ou voltar livremente.
- Controle de áudio com os estados: pronto para gravar, gravando, gravação disponível para ouvir e opção de regravar.
- Não exibir transcrição.
- Permitir deixar perguntas sem resposta. Ao finalizar, caso existam perguntas em branco, abrir um aviso com quantidade e opções para revisar ou enviar mesmo assim.
- Após uma resposta gravada, permitir remover ou substituir a gravação.
- CTA final: **Enviar respostas para correção**.

### 5. Correção

- Estado de processamento após o envio, com feedback visual amigável e breve explicação de que as respostas estão sendo avaliadas.
- Ao terminar o estado simulado, navegar automaticamente para o resultado.

### 6. Resultado

- Exibir nota total em destaque e resumo de acertos, erros e perguntas sem resposta.
- Listar as cinco questões. Cada item deve conter:
  - nota da questão;
  - status correto, incorreto ou sem resposta;
  - tempo gasto;
  - resposta do estudante (ou indicação de ausência);
  - resposta correta/esperada;
  - comentário explicativo e encorajador.
- Incluir ação para iniciar um novo quiz e, futuramente, espaço para salvar/consultar o histórico.

## Fluxo principal

`Home → Novo quiz → Enviar PDF → Gerando perguntas → Responder (com ida e volta pelo índice) → Enviar respostas → Corrigindo → Resultado`

## Estados e mensagens importantes

- Sem PDF: orientar o envio e bloquear a geração.
- PDF selecionado: confirmar visualmente que o arquivo está pronto.
- Gravação em andamento: destacar microfone e disponibilizar parar gravação.
- Pergunta sem resposta: marcar de forma discreta no índice.
- Tentativa de finalizar com pendências: avisar sem impedir o envio.
- Erro simulado: prever componente reutilizável com ação “Tentar novamente”.

## Dados simulados

Criar os fixtures em `frontend/src/data/mockQuiz.json`, separados da interface. O JSON deve representar um quiz de anatomia veterinária com 5 questões e conter, no mínimo:

```json
{
  "id": "anatomia-canina-01",
  "sourceFile": "anatomia-membro-toracico.pdf",
  "questionCount": 5,
  "questions": [
    {
      "id": 1,
      "prompt": "Enunciado da pergunta",
      "studentAnswerLabel": "Resposta em áudio 01",
      "durationSeconds": 42,
      "status": "correct",
      "score": 2,
      "expectedAnswer": "Resposta esperada",
      "feedback": "Comentário explicativo e incentivador"
    }
  ],
  "totalScore": 8,
  "maxScore": 10
}
```

Usar `correct`, `incorrect` e `unanswered` para o status. Dados de áudio podem ser apenas rótulos/estados visuais no protótipo, sem arquivo de áudio real.

## Escopo futuro

- Login e criação de conta.
- Perfil do estudante.
- Histórico de quizzes e evolução das notas.
- Escolha de 5 ou 10 questões e nível de dificuldade.
- Integração com n8n/IA, upload real de PDF, gravação de áudio e correção real.
