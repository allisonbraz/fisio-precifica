-- REVISAR ANTES DE APLICAR. Este arquivo NÃO foi executado em banco nenhum.
--
-- A migração 0000 criou users."openId" varchar. O schema atual usa users."supabaseId" uuid.
-- Antes de rodar no Supabase do FisioPrecifica, confira as colunas reais:
--   select column_name, data_type from information_schema.columns
--   where table_schema = 'public' and table_name = 'users';
--
-- O script é idempotente:
--   - se supabaseId uuid já existe, não renomeia nem converte;
--   - se openId ainda existe, renomeia para supabaseId;
--   - só converte para uuid quando todos os valores são UUIDs válidos;
--   - se houver valor inválido, a transação inteira é recusada e nada muda.
--
-- Não use `pnpm db:push` às cegas: esse comando também gera migração e aplica no banco.

DO $$
DECLARE
  has_open_id boolean;
  has_supabase_id boolean;
  supabase_type text;
  invalid_uuid_count bigint;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'openId'
  ) INTO has_open_id;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'supabaseId'
  ) INTO has_supabase_id;

  IF has_open_id AND NOT has_supabase_id THEN
    ALTER TABLE "users" RENAME COLUMN "openId" TO "supabaseId";
    has_supabase_id := true;
  END IF;

  IF NOT has_supabase_id THEN
    RAISE EXCEPTION 'A tabela users não tem openId nem supabaseId. Revise o banco antes de continuar.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_openId_unique'
      AND conrelid = 'public.users'::regclass
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_supabaseId_unique'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE "users" RENAME CONSTRAINT "users_openId_unique" TO "users_supabaseId_unique";
  END IF;

  SELECT udt_name INTO supabase_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'supabaseId';

  IF supabase_type IS DISTINCT FROM 'uuid' THEN
    SELECT count(*) INTO invalid_uuid_count
    FROM "users"
    WHERE "supabaseId" IS NOT NULL
      AND btrim("supabaseId"::text) !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

    IF invalid_uuid_count > 0 THEN
      RAISE EXCEPTION 'Recusei converter users.supabaseId para uuid: % linha(s) não são UUID válidos.', invalid_uuid_count;
    END IF;

    ALTER TABLE "users" ALTER COLUMN "supabaseId" TYPE uuid USING NULLIF(btrim("supabaseId"::text), '')::uuid;
  END IF;

  ALTER TABLE "users" ALTER COLUMN "loginMethod" SET DEFAULT 'email';
  ALTER TABLE "users" ALTER COLUMN "source" SET DEFAULT 'supabase';

  CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" USING btree ("email");
END $$;
