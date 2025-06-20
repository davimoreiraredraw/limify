-- Primeiro adiciona a coluna como nullable
ALTER TABLE expenses ADD COLUMN user_id TEXT;

-- Cria o índice
CREATE INDEX idx_expenses_user_id ON expenses(user_id);

-- Adiciona a foreign key
ALTER TABLE expenses 
ADD CONSTRAINT fk_expenses_user_id 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Configura RLS (Row Level Security) para a tabela de despesas
CREATE POLICY "expenses_user_isolation_policy" ON "expenses"
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid()); 