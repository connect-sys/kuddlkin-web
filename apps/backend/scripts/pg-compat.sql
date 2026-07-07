-- Postgres compatibility objects for the D1-shim backend.
-- Run once after the schema/data are loaded (idempotent).

-- The codebase does table/index existence checks via SQLite's sqlite_master.
-- Expose an identically-named view over the Postgres catalog so those queries
-- ("SELECT name FROM sqlite_master WHERE type='table' AND name='x'") just work.
CREATE OR REPLACE VIEW sqlite_master AS
  SELECT 'table'::text AS type,
         tablename      AS name,
         tablename      AS tbl_name,
         NULL::text     AS sql
    FROM pg_tables
   WHERE schemaname = 'public'
  UNION ALL
  SELECT 'index'::text  AS type,
         indexname      AS name,
         tablename      AS tbl_name,
         NULL::text     AS sql
    FROM pg_indexes
   WHERE schemaname = 'public';

-- SQLite let a TEXT PRIMARY KEY be NULL, so a few inserts (e.g. OTP) omit `id`.
-- Postgres rejects a NULL PK, so give every text `id` column a UUID default:
-- inserts that omit id get one; inserts that provide id override it.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.table_name
      FROM information_schema.columns c
      JOIN pg_tables t ON t.tablename = c.table_name AND t.schemaname = 'public'
     WHERE c.table_schema = 'public'
       AND c.column_name = 'id'
       AND c.data_type IN ('text', 'character varying')
  LOOP
    EXECUTE format(
      'ALTER TABLE %I ALTER COLUMN id SET DEFAULT gen_random_uuid()::text',
      r.table_name
    );
  END LOOP;
END $$;
