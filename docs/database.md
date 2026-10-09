# Banco de dados e integração

O Profe Quiltro usa Supabase (PostgreSQL e Supabase Auth). A estrutura do banco
é definida em `supabase/migrations` e deve ser alterada somente por novas
migrations versionadas.

## Estado atual

O projeto Supabase existente já contém a estrutura inicial e recebeu as
melhorias de `20261009_schema_hardening.sql` manualmente em 9 de outubro de
2026. Portanto, não execute essas migrations novamente nesse mesmo projeto.

Para criar outro projeto Supabase vazio, aplique as migrations em ordem
cronológica.

## Autenticação e perfil

O Supabase Auth armazena e-mail e senha. Após um cadastro, a trigger
`on_auth_user_created` executa `handle_new_user()` e cria o registro em
`public.profiles`. O nome enviado no cadastro deve estar em
`user_metadata.name`.

O frontend pode ler e editar apenas o próprio perfil. Não há política de
`INSERT` para `profiles`, pois a trigger cuida dessa operação.

## Regras de acesso

Row Level Security está habilitado em todas as tabelas públicas:

- cada usuário acessa e altera somente seu `profile`;
- cada usuário gerencia somente quizzes cujo `created_by` é seu ID;
- perguntas são acessíveis apenas quando pertencem a um quiz do usuário;
- tentativas e respostas são acessíveis somente ao dono da tentativa.

## Dados usados pelo frontend

| Recurso | Campos principais |
| --- | --- |
| Perfil | `id`, `name`, `created_at` |
| Quiz | `id`, `created_by`, `title`, `language`, `topic`, `difficulty`, `source`, `created_at` |
| Pergunta | `id`, `quiz_id`, `question_order`, `question_text`, `correct_answer`, `options` |
| Tentativa | `id`, `user_id`, `quiz_id`, `started_at`, `finished_at`, `score`, `total_questions`, `correct_answers` |
| Resposta | `id`, `attempt_id`, `question_id`, `answer_text`, `transcription`, `is_correct`, `evaluation` |

`evaluation` é um objeto JSON e pode guardar a nota e o feedback retornados
pelo n8n. O frontend atual envia o PDF ao n8n para gerar perguntas e solicita
a avaliação ao finalizar o quiz; depois deve persistir quiz, perguntas,
tentativa e respostas no Supabase.

## Variáveis de ambiente do frontend

No arquivo local `frontend/.env`, use somente as chaves públicas:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

Esses valores podem ser encontrados no painel do Supabase em **Project
Settings > API**. Nunca versione o `.env` e nunca envie ao frontend a chave
`service_role`, a senha do banco ou credenciais do n8n.
