## Funcionamento do Banco de Dados

O projeto utiliza o **Supabase** como banco de dados e serviço de autenticação. O Supabase utiliza PostgreSQL e será responsável tanto pelo armazenamento dos dados da aplicação quanto pelo gerenciamento dos usuários.

A autenticação é feita pelo **Supabase Auth**, que mantém email, senha e informações de acesso. Esses dados não são duplicados nas tabelas da aplicação. A tabela `profiles` armazena apenas informações complementares do usuário e utiliza o mesmo `id` gerado pelo Supabase Auth.

A estrutura principal do banco é composta pelas tabelas `profiles`, `quizzes`, `questions`, `quiz_attempts` e `answers`. Cada quiz pertence a um usuário e possui várias perguntas. Um usuário pode realizar um quiz diversas vezes, sendo cada realização registrada em `quiz_attempts` e suas respostas individuais armazenadas em `answers`.

### Estrutura das tabelas

- **`profiles`**: `id`, `name`, `created_at`
- **`quizzes`**: `id`, `created_by`, `title`, `language`, `topic`, `difficulty`, `source`, `created_at`
- **`questions`**: `id`, `quiz_id`, `question_order`, `question_text`, `correct_answer`, `options`, `created_at`
- **`quiz_attempts`**: `id`, `user_id`, `quiz_id`, `started_at`, `finished_at`, `score`, `total_questions`, `correct_answers`
- **`answers`**: `id`, `attempt_id`, `question_id`, `answer_text`, `transcription`, `is_correct`, `evaluation`, `created_at`

### Relacionamentos

```text
Supabase Auth
 auth.users
     │
     │ id
     ▼
 profiles
     │
     │ 1:N
     ▼
 quizzes ────────────────┐
     │                   │
     │ 1:N               │
     ▼                   │
 questions               │
                         │
 profiles                │
     │                   │
     │ 1:N               │
     ▼                   │
 quiz_attempts ◄─────────┘
     │
     │ 1:N
     ▼
 answers
     │
     └──── question_id ───► questions
```

Os principais relacionamentos são:

- `profiles.id` → `auth.users.id`
- `quizzes.created_by` → `profiles.id`
- `questions.quiz_id` → `quizzes.id`
- `quiz_attempts.user_id` → `profiles.id`
- `quiz_attempts.quiz_id` → `quizzes.id`
- `answers.attempt_id` → `quiz_attempts.id`
- `answers.question_id` → `questions.id`

Também será utilizado **Row Level Security (RLS)** para garantir que cada usuário tenha acesso apenas aos dados permitidos para sua conta.