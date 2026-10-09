# Integração com Supabase

## Configuração

No `frontend/.env` local:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
VITE_N8N_QUIZ_URL=SUA_URL_DO_WEBHOOK
```

Usar somente a chave pública (`anon`). Nunca enviar ou versionar `service_role`,
senha do banco ou credenciais do n8n.

## Autenticação e perfil

- Login e cadastro: e-mail e senha via Supabase Auth.
- No cadastro, enviar o nome em `user_metadata.name`.
- A trigger cria `profiles` automaticamente; não inserir perfil manualmente.
- Perfil: ler/atualizar apenas `name` em `profiles`.

## Tabelas

### `profiles`

| Campo | Descrição |
| --- | --- |
| `id` | ID do usuário no Supabase Auth. |
| `name` | Nome informado no cadastro. |
| `created_at` | Data de criação do perfil. |

### `quizzes`

| Campo | Descrição |
| --- | --- |
| `id` | ID do quiz. |
| `created_by` | ID do usuário que criou o quiz (`user.id`). |
| `title` | Título do quiz. |
| `language` | Idioma: `pt`, `es` ou `en`. |
| `topic` | Tema/assunto do material. |
| `difficulty` | Dificuldade solicitada: `easy`, `medium` ou `hard`. |
| `source` | Nome ou referência do PDF enviado. |
| `created_at` | Data de criação. |

### `questions`

| Campo | Descrição |
| --- | --- |
| `id` | ID da pergunta. |
| `quiz_id` | Quiz ao qual a pergunta pertence. |
| `question_order` | Posição da pergunta no quiz; não pode repetir no mesmo quiz. |
| `question_text` | Enunciado da pergunta. |
| `correct_answer` | Resposta esperada, quando disponível. |
| `options` | Opções em JSON; deixar `null` para perguntas abertas. |
| `created_at` | Data de criação. |

### `quiz_attempts`

| Campo | Descrição |
| --- | --- |
| `id` | ID da tentativa. |
| `user_id` | ID do estudante que respondeu (`user.id`). |
| `quiz_id` | Quiz respondido. |
| `started_at` | Início da tentativa. |
| `finished_at` | Final da tentativa. |
| `score` | Nota total obtida. |
| `total_questions` | Quantidade de perguntas. |
| `correct_answers` | Quantidade de respostas corretas. |

### `answers`

| Campo | Descrição |
| --- | --- |
| `id` | ID da resposta. |
| `attempt_id` | Tentativa à qual a resposta pertence. |
| `question_id` | Pergunta respondida. |
| `answer_text` | Resposta textual enviada/gerada. |
| `transcription` | Transcrição do áudio. |
| `is_correct` | Se a resposta foi considerada correta. |
| `evaluation` | JSON com nota, resposta esperada e feedback. |
| `created_at` | Data de criação. |

## Fluxo de persistência

1. n8n gera as perguntas.
2. Criar `quizzes` com `created_by = user.id`.
3. Criar `questions` com `quiz_id`, `question_order` e `question_text`.
4. Ao iniciar, criar `quiz_attempts` com `user_id = user.id` e `quiz_id`.
5. Após a avaliação do n8n, atualizar a tentativa e criar `answers`.

Em `answers.evaluation`, salvar o retorno da correção, por exemplo:

```json
{ "score": 8, "maxScore": 10, "expectedAnswer": "...", "feedback": "..." }
```

## Regras

- RLS já está ativa: cada usuário só acessa seus dados.
- `question_order` não pode repetir dentro de um quiz.
- Uma pergunta só pode ter uma resposta por tentativa.
- O frontend sempre usa o `user.id` autenticado em `created_by` e `user_id`.
