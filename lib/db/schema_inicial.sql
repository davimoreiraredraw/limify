-- Inserir categorias padrão
INSERT INTO categories (name, color) VALUES 
('Software', '#6366f1'),
('Contabil', '#0ea5e9'),
('Escritório', '#10b981'),
('Veículo', '#f59e0b'),
('Marketing', '#ef4444'),
('Outros', '#6b7280')
ON CONFLICT (name) DO NOTHING; 