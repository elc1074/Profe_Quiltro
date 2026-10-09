-- Profe Quiltro: schema inicial.
-- Execute apenas em um projeto Supabase vazio, antes das migrations posteriores.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz default now()
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  language text,
  topic text,
  difficulty text,
  source text,
  created_at timestamptz default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_order integer not null,
  question_text text not null,
  correct_answer text,
  options jsonb,
  created_at timestamptz default now()
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  started_at timestamptz default now(),
  finished_at timestamptz,
  score numeric,
  total_questions integer,
  correct_answers integer
);

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  answer_text text,
  transcription text,
  is_correct boolean,
  evaluation jsonb,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.answers enable row level security;

create policy "User can read own profile"
on public.profiles for select
using (id = auth.uid());

create policy "User can update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "User can create own quizzes"
on public.quizzes for insert
with check (created_by = auth.uid());

create policy "User can delete own quizzes"
on public.quizzes for delete
using (created_by = auth.uid());

create policy "User can read own quizzes"
on public.quizzes for select
using (created_by = auth.uid());

create policy "User can update own quizzes"
on public.quizzes for update
using (created_by = auth.uid());

create policy "User can access questions from own quizzes"
on public.questions for all
using (
  exists (
    select 1 from public.quizzes
    where quizzes.id = questions.quiz_id
      and quizzes.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.quizzes
    where quizzes.id = questions.quiz_id
      and quizzes.created_by = auth.uid()
  )
);

create policy "User can manage own attempts"
on public.quiz_attempts for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "User can manage own answers"
on public.answers for all
using (
  exists (
    select 1 from public.quiz_attempts
    where quiz_attempts.id = answers.attempt_id
      and quiz_attempts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.quiz_attempts
    where quiz_attempts.id = answers.attempt_id
      and quiz_attempts.user_id = auth.uid()
  )
);
