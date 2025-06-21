ALTER TABLE budgets ADD COLUMN user_id TEXT NOT NULL DEFAULT 'migration_user';
-- Remover o valor padrão após a migração para forçar o preenchimento do user_id
ALTER TABLE budgets ALTER COLUMN user_id DROP DEFAULT; 