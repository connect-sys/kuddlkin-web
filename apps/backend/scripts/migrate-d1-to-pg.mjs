/**
 * One-time Cloudflare D1 (SQLite) -> PostgreSQL migrator.
 *
 * Usage:
 *   1. Export the live D1 database to SQL:
 *        npx wrangler d1 export kuddl-prod --remote --output prod-d1.sql
 *   2. Materialise it as a SQLite file:
 *        sqlite3 prod-d1.db < prod-d1.sql
 *   3. Run this (DATABASE_URL comes from the root .env):
 *        node scripts/migrate-d1-to-pg.mjs ./prod-d1.db
 *   4. Apply compat objects:
 *        psql "$DATABASE_URL" -f scripts/pg-compat.sql
 *
 * Type mapping: TEXT->text, INTEGER->bigint, REAL->double precision,
 * BOOLEAN->smallint (0/1), DATETIME/DATE/TIME->text (app treats them as ISO
 * strings). FOREIGN KEY clauses + AUTOINCREMENT are dropped; UNIQUE kept.
 * Rows are copied via parameterized inserts so the driver handles escaping.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import Database from "better-sqlite3";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const SQLITE = process.argv[2];
if (!SQLITE) {
  console.error("Usage: node scripts/migrate-d1-to-pg.mjs <path-to-sqlite.db>");
  process.exit(1);
}

const sq = new Database(SQLITE, { readonly: true });
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 4,
});

const mapType = (t) => {
  const u = (t || "").toUpperCase().trim();
  if (u.startsWith("BOOLEAN")) return "smallint";
  if (u.startsWith("INT")) return "bigint";
  if (u.startsWith("REAL") || u.startsWith("FLOAT") || u.startsWith("DOUBLE"))
    return "double precision";
  if (u.startsWith("NUMERIC") || u.startsWith("DECIMAL")) return "numeric";
  if (u.startsWith("BLOB")) return "bytea";
  return "text"; // TEXT, DATETIME, DATE, TIME, VARCHAR(n), etc.
};

const mapDefault = (d) => {
  if (d == null) return null;
  const s = String(d).trim();
  if (/^current_timestamp$/i.test(s)) return "(now())::text";
  if (/^true$/i.test(s)) return "1";
  if (/^false$/i.test(s)) return "0";
  if (/^"(.*)"$/.test(s)) return "'" + s.slice(1, -1).replace(/'/g, "''") + "'";
  return s;
};

const tables = sq
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name"
  )
  .all()
  .map((r) => r.name);

let totalRows = 0;
for (const t of tables) {
  const cols = sq.prepare(`PRAGMA table_info("${t}")`).all();
  const uniques = [];
  for (const idx of sq.prepare(`PRAGMA index_list("${t}")`).all()) {
    if (idx.unique && idx.origin === "u") {
      const info = sq.prepare(`PRAGMA index_info("${idx.name}")`).all();
      uniques.push(info.map((i) => `"${i.name}"`).join(", "));
    }
  }
  const defs = cols.map((c) => {
    let s = `"${c.name}" ${mapType(c.type)}`;
    if (c.pk) s += " PRIMARY KEY";
    else if (c.notnull) s += " NOT NULL";
    const dv = mapDefault(c.dflt_value);
    if (dv != null) s += ` DEFAULT ${dv}`;
    return s;
  });
  for (const u of uniques) defs.push(`UNIQUE (${u})`);

  await pool.query(`DROP TABLE IF EXISTS "${t}" CASCADE`);
  await pool.query(`CREATE TABLE "${t}" (\n  ${defs.join(",\n  ")}\n)`);

  const rows = sq.prepare(`SELECT * FROM "${t}"`).all();
  const names = cols.map((c) => c.name);
  const boolCols = new Set(
    cols.filter((c) => /^BOOLEAN/i.test(c.type)).map((c) => c.name)
  );
  const quoted = names.map((c) => `"${c}"`).join(", ");
  let ok = 0;
  for (const row of rows) {
    const vals = names.map((c) => {
      let v = row[c];
      if (boolCols.has(c) && typeof v === "boolean") v = v ? 1 : 0;
      if (boolCols.has(c) && (v === "true" || v === "false"))
        v = v === "true" ? 1 : 0;
      if (typeof v === "bigint") v = Number(v);
      return v;
    });
    const ph = vals.map((_, i) => `$${i + 1}`).join(", ");
    try {
      await pool.query(`INSERT INTO "${t}" (${quoted}) VALUES (${ph})`, vals);
      ok++;
    } catch (e) {
      console.error(`  ! ${t}: skipped a row (${e.message})`);
    }
  }
  totalRows += ok;
  console.log(`✓ ${t.padEnd(30)} ${ok}/${rows.length}`);
}

console.log(`\nDone: ${tables.length} tables, ${totalRows} rows.`);
console.log("Next: psql \"$DATABASE_URL\" -f scripts/pg-compat.sql");
await pool.end();
sq.close();
