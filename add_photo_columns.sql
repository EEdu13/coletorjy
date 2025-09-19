-- Script para adicionar colunas de fotos na tabela sobrevivencia
-- Execute este script no PostgreSQL para adicionar as novas colunas

-- Adicionar coluna para URL da foto da área
ALTER TABLE qualidadejy.sobrevivencia 
ADD COLUMN IF NOT EXISTS foto_area TEXT DEFAULT '';

-- Adicionar coluna para URL da foto da linha  
ALTER TABLE qualidadejy.sobrevivencia 
ADD COLUMN IF NOT EXISTS foto_linha TEXT DEFAULT '';

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'qualidadejy' 
  AND table_name = 'sobrevivencia' 
  AND column_name IN ('foto_area', 'foto_linha')
ORDER BY column_name;