-- Melhorias aplicadas manualmente no projeto Supabase existente em 2026-10-09.
-- Em um projeto novo, execute depois de 20261009_initial_schema.sql.

alter table public.questions
  add constraint questions_quiz_id_question_order_key
  unique (quiz_id, question_order);

alter table public.answers
  add constraint answers_attempt_id_question_id_key
  unique (attempt_id, question_id);

create index idx_quizzes_created_by_created_at
  on public.quizzes (created_by, created_at desc);

create index idx_questions_quiz_id
  on public.questions (quiz_id);

create index idx_quiz_attempts_user_id_started_at
  on public.quiz_attempts (user_id, started_at desc);

create index idx_quiz_attempts_quiz_id
  on public.quiz_attempts (quiz_id);

create index idx_answers_attempt_id
  on public.answers (attempt_id);

drop policy "User can update own quizzes" on public.quizzes;

create policy "User can update own quizzes"
on public.quizzes for update
using (created_by = auth.uid())
with check (created_by = auth.uid());
