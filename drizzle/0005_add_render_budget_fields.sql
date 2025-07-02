-- Adicionando campos específicos para orçamentos de render na tabela budgets
ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS base_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS complexity_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS delivery_time_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS delivery_time_days INTEGER;

-- Adicionando campos específicos para orçamentos de render e m² na tabela budget_items
ALTER TABLE budget_items
-- Campos para orçamentos por m²
ADD COLUMN IF NOT EXISTS price_per_m2 DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS square_meters DECIMAL(12,2),
-- Campos para orçamentos de render
ADD COLUMN IF NOT EXISTS development_time INTEGER,
ADD COLUMN IF NOT EXISTS images_quantity INTEGER,
ADD COLUMN IF NOT EXISTS complexity_level TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP; 