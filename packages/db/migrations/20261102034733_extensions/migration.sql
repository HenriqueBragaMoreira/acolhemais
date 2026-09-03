-- PostGIS: busca de animais por raio a partir do CEP (portal, Fase 3).
-- UUIDv7 não precisa de extensão: uuidv7() é nativo do Postgres 18.
CREATE EXTENSION IF NOT EXISTS postgis;
