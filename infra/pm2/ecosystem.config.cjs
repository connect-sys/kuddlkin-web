/**
 * PM2 process definitions for the Kuddlkin VM.
 *
 *   kuddl-backend   → Node HTTP API (apps/backend/src/server.js) on :5000
 *   kuddl-customer  → Next.js production server (`next start`) on :3000
 *
 * The Vite "partner" app is NOT here — it's static files served directly by NGINX.
 *
 * The backend loads the root .env itself (server.js → dotenv), so we only set
 * NODE_ENV here. PORT for each process is pinned below so they never collide.
 *
 * Usage on the VM (from /var/www/kuddlkin):
 *   pm2 start infra/pm2/ecosystem.config.cjs
 *   pm2 reload infra/pm2/ecosystem.config.cjs   # zero-downtime redeploy
 *   pm2 save                                     # persist across reboots
 */
module.exports = {
  apps: [
    {
      name: "kuddl-backend",
      cwd: "/var/www/kuddlkin/apps/backend",
      script: "src/server.js",
      interpreter: "node",
      exec_mode: "fork",
      instances: 1,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        // PORT comes from the root .env (PORT=5000). Set here too as a safety net.
        PORT: "5000",
      },
      error_file: "/var/log/kuddlkin/backend.err.log",
      out_file: "/var/log/kuddlkin/backend.out.log",
      time: true,
    },
    {
      name: "kuddl-customer",
      cwd: "/var/www/kuddlkin/apps/customer",
      // Point at Next's real JS entry — node_modules/.bin/next is a shell wrapper,
      // which `interpreter: node` cannot parse (SyntaxError).
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      interpreter: "node",
      exec_mode: "fork",
      instances: 1,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      error_file: "/var/log/kuddlkin/customer.err.log",
      out_file: "/var/log/kuddlkin/customer.out.log",
      time: true,
    },
  ],
};
