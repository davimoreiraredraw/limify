-- Pega o primeiro usuário do sistema como fallback
DO $$ 
DECLARE
    first_user_id TEXT;
BEGIN
    -- Pega o ID do primeiro usuário
    SELECT id INTO first_user_id FROM profiles LIMIT 1;

    -- Atualiza todas as despesas sem user_id
    UPDATE expenses 
    SET user_id = first_user_id 
    WHERE user_id IS NULL;
END $$;

-- Agora que todos os registros têm um user_id, podemos tornar a coluna NOT NULL
ALTER TABLE expenses ALTER COLUMN user_id SET NOT NULL; 