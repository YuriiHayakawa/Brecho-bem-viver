-- Migration: contraproposta em product_offers
-- Projeto não usa Alembic (Base.metadata.create_all só cria tabelas novas,
-- não altera as existentes) — rodar manualmente em cada ambiente (local e produção).

ALTER TABLE product_offers
  ADD COLUMN IF NOT EXISTS counter_price NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS counter_message TEXT;

ALTER TABLE product_offers
  DROP CONSTRAINT IF EXISTS check_product_offer_status;

ALTER TABLE product_offers
  ADD CONSTRAINT check_product_offer_status
  CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'countered'));
