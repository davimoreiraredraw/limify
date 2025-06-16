-- Cria a tabela de categorias
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adiciona índice para buscas por nome de categoria
CREATE INDEX idx_categories_name ON categories (name);

-- Cria a tabela de despesas
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  value DECIMAL(12, 2) NOT NULL,
  frequency TEXT NOT NULL,
  compensation_day INTEGER,
  category_id UUID REFERENCES categories(id),
  is_fixed BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adiciona índices para otimizar buscas
CREATE INDEX idx_expenses_category_id ON expenses (category_id);
CREATE INDEX idx_expenses_is_fixed ON expenses (is_fixed);
CREATE INDEX idx_expenses_is_active ON expenses (is_active);

-- Insere categorias padrão
INSERT INTO categories (name, color) VALUES 
  ('Software', '#6366f1'),
  ('Contabil', '#0ea5e9'),
  ('Escritório', '#10b981'),
  ('Veículo', '#f59e0b'),
  ('Marketing', '#ef4444'),
  ('Outros', '#6b7280')
ON CONFLICT (name) DO NOTHING;

-- Cria uma função para calcular o valor anual da despesa
CREATE OR REPLACE FUNCTION calculate_annual_value(
  value DECIMAL,
  frequency TEXT
) RETURNS DECIMAL AS $$
BEGIN
  CASE frequency
    WHEN 'Diário' THEN RETURN value * 365;
    WHEN 'Semanal' THEN RETURN value * 52;
    WHEN 'Mensal' THEN RETURN value * 12;
    WHEN 'Anual' THEN RETURN value;
    WHEN 'Único' THEN RETURN value;
    ELSE RETURN value * 12;  -- Padrão para frequências desconhecidas
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Cria uma função para calcular o valor mensal da despesa
CREATE OR REPLACE FUNCTION calculate_monthly_value(
  value DECIMAL,
  frequency TEXT
) RETURNS DECIMAL AS $$
BEGIN
  CASE frequency
    WHEN 'Diário' THEN RETURN value * 30;
    WHEN 'Semanal' THEN RETURN value * 4.33;
    WHEN 'Mensal' THEN RETURN value;
    WHEN 'Anual' THEN RETURN value / 12;
    WHEN 'Único' THEN RETURN value / 12;
    ELSE RETURN value;  -- Padrão para frequências desconhecidas
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Configura RLS (Row Level Security) para a tabela de categorias
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Configura RLS (Row Level Security) para a tabela de despesas
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY; 