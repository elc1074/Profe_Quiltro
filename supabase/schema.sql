-- Estado atual do schema público em 2026-10-09.
-- Referência rápida: para provisionar um banco vazio, aplique as migrations em ordem.
-- Não execute este arquivo junto com as migrations, pois ele já representa o resultado final.

-- Tabelas: profiles, quizzes, questions, quiz_attempts e answers.
-- A definição reproduzível está em migrations/20261009_initial_schema.sql
-- seguida por migrations/20261009_schema_hardening.sql.

-- Relações e índices adicionais vigentes:
-- questions: UNIQUE (quiz_id, question_order), INDEX (quiz_id)
-- answers: UNIQUE (attempt_id, question_id), INDEX (attempt_id)
-- quizzes: INDEX (created_by, created_at DESC)
-- quiz_attempts: INDEX (user_id, started_at DESC), INDEX (quiz_id)
