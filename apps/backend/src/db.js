/**
 * D1 → PostgreSQL compatibility layer.
 *
 * The whole backend was written against Cloudflare D1's prepared-statement API:
 *     env.KUDDL_DB.prepare(sql).bind(...args).first() | .all() | .run()
 * This shim implements that exact surface on top of `pg`, so the ~1,090 existing
 * queries keep working without being rewritten. The only differences that still
 * need per-query fixes are genuine SQL-dialect issues (double-quoted string
 * literals, `INSERT OR IGNORE/REPLACE`, `last_row_id`) — handled separately.
 *
 * Result shapes match D1:
 *   .first()  -> row object | null   (or a single column value if a name given)
 *   .all()    -> { success, results: rows[], meta }
 *   .run()    -> { success, meta: { changes, last_row_id } }
 *   .raw()    -> array-of-arrays
 *   db.batch([stmt,...]) -> runs in a transaction, returns per-stmt results
 */
import pg from "pg";

const { Pool } = pg;

// pg returns BIGINT/NUMERIC as strings by default; D1 code expects JS numbers.
pg.types.setTypeParser(20, (v) => (v === null ? null : Number(v))); // int8
pg.types.setTypeParser(1700, (v) => (v === null ? null : Number(v))); // numeric

/**
 * Rewrite SQLite-style `?` placeholders to Postgres `$1, $2, …`.
 * Question marks inside single- or double-quoted string literals are left alone.
 */
/**
 * Translate the handful of SQLite-only SQL functions the codebase uses into
 * Postgres equivalents. Date columns were migrated as TEXT (ISO strings), so
 * date('now') becomes a matching 'YYYY-MM-DD' text value. (sqlite_master is
 * handled by a Postgres view of the same name — see scripts/pg-compat.sql.)
 */
export function translateDialect(sql) {
  return sql
    .replace(
      /\bdatetime\(\s*'now'\s*\)/gi,
      "to_char(now() at time zone 'utc','YYYY-MM-DD\"T\"HH24:MI:SS')"
    )
    .replace(/\bdate\(\s*'now'\s*\)/gi, "to_char(CURRENT_DATE,'YYYY-MM-DD')")
    .replace(/\bstrftime\(\s*'%Y-%m'\s*,\s*([^)]+?)\s*\)/gi, "substr($1,1,7)")
    .replace(
      /\bstrftime\(\s*'%s'\s*,\s*'now'\s*\)/gi,
      "extract(epoch from now())::bigint"
    );
}

export function toPgPlaceholders(sql) {
  let out = "";
  let n = 1;
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    if (c === "'" && !inDouble) inSingle = !inSingle;
    else if (c === '"' && !inSingle) inDouble = !inDouble;
    else if (c === "?" && !inSingle && !inDouble) {
      out += "$" + n++;
      continue;
    }
    out += c;
  }
  return out;
}

class PreparedStatement {
  constructor(pool, sql) {
    this._pool = pool;
    this._sql = sql;
    this._args = [];
  }

  bind(...args) {
    this._args = args;
    return this;
  }

  async _query(client) {
    const text = toPgPlaceholders(translateDialect(this._sql));
    const runner = client || this._pool;
    return runner.query({ text, values: this._args });
  }

  /** D1: first() -> first row | null; first(col) -> that column's value | null */
  async first(column) {
    const res = await this._query();
    const row = res.rows[0];
    if (!row) return null;
    if (column !== undefined) return row[column] ?? null;
    return row;
  }

  /** D1: all() -> { success, results, meta } */
  async all() {
    const res = await this._query();
    return {
      success: true,
      results: res.rows,
      meta: { rows_read: res.rowCount, changes: res.rowCount, duration: 0 },
    };
  }

  /** D1: run() -> { success, meta: { changes, last_row_id } } */
  async run() {
    const res = await this._query();
    // last_row_id only meaningful if the query used RETURNING id.
    const lastId = res.rows && res.rows[0] ? res.rows[0].id ?? null : null;
    return {
      success: true,
      meta: {
        changes: res.rowCount,
        rows_written: res.rowCount,
        last_row_id: lastId,
        duration: 0,
      },
    };
  }

  /** D1: raw() -> array of arrays */
  async raw() {
    const res = await this._query();
    return res.rows.map((r) => Object.values(r));
  }
}

export class PgD1Database {
  constructor(pool) {
    this._pool = pool;
  }

  prepare(sql) {
    return new PreparedStatement(this._pool, sql);
  }

  /** D1 batch: run all statements inside a single transaction. */
  async batch(statements) {
    const client = await this._pool.connect();
    try {
      await client.query("BEGIN");
      const results = [];
      for (const stmt of statements) {
        const text = toPgPlaceholders(stmt._sql);
        const res = await client.query({ text, values: stmt._args });
        results.push({
          success: true,
          results: res.rows,
          meta: { changes: res.rowCount },
        });
      }
      await client.query("COMMIT");
      return results;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  /** D1 exec: run raw (possibly multi-statement) SQL. */
  async exec(sql) {
    await this._pool.query(sql);
    return { count: 1, duration: 0 };
  }
}

let _pool;

/** Lazily create (once) the pg Pool + D1 shim from env. */
export function createDb() {
  if (!_pool) {
    _pool = process.env.DATABASE_URL
      ? new Pool({ connectionString: process.env.DATABASE_URL, max: 10 })
      : new Pool({
          host: process.env.PGHOST || "localhost",
          port: Number(process.env.PGPORT || 5432),
          database: process.env.PGDATABASE,
          user: process.env.PGUSER,
          password: process.env.PGPASSWORD,
          max: 10,
        });
    _pool.on("error", (e) => console.error("pg pool error:", e.message));
  }
  return { db: new PgD1Database(_pool), pool: _pool };
}
