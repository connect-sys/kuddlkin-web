/**
 * Node HTTP entry point (replaces the Cloudflare Workers runtime).
 *
 * It reuses the EXISTING itty-router in worker.js unchanged — we just call the
 * same `worker.fetch(request, env, ctx)` from a Node server, where:
 *   - `env.KUDDL_DB`      is the D1→Postgres shim   (db.js)
 *   - `env.KUDDL_STORAGE` is the R2→GCS shim        (storage.js)
 *   - every other `env.X` reads from process.env    (loaded from the root .env)
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import dotenv from "dotenv";

// Load the SINGLE root .env (kuddlkin-web/.env) — one source of truth.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const { createServerAdapter } = await import("@whatwg-node/server");
const { default: worker } = await import("./worker.js");
const { createDb } = await import("./db.js");
const { createStorage } = await import("./storage.js");

const { db, pool } = createDb();
const storage = createStorage();

// `env` proxy: Workers bindings resolve to our shims, everything else to process.env.
const env = new Proxy(
  {},
  {
    get(_t, prop) {
      if (prop === "KUDDL_DB") return db;
      if (prop === "KUDDL_STORAGE") return storage;
      if (typeof prop === "string") return process.env[prop];
      return undefined;
    },
    has(_t, prop) {
      return prop === "KUDDL_DB" || prop === "KUDDL_STORAGE" || prop in process.env;
    },
  }
);

// Minimal Workers ExecutionContext stand-in.
const ctx = {
  waitUntil(promise) {
    Promise.resolve(promise).catch((e) =>
      console.error("waitUntil error:", e?.message)
    );
  },
  passThroughOnException() {},
};

const adapter = createServerAdapter((request) => worker.fetch(request, env, ctx));
const server = createServer(adapter);

const PORT = Number(process.env.PORT || 5000);
server.listen(PORT, () => {
  console.log(`🚀 Kuddlkin API (Node) listening on http://localhost:${PORT}`);
});

// Verify DB connectivity on boot.
pool
  .query("SELECT 1")
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch((e) => console.error("❌ PostgreSQL connection failed:", e.message));

process.on("SIGINT", async () => {
  await pool.end().catch(() => {});
  process.exit(0);
});
