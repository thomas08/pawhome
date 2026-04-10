import { PrismaClient } from "@prisma/client/wasm";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function createPrismaClient(connectionString: string, ssl: boolean): PrismaClient {
  const pool = new Pool({
    connectionString,
    max: 1,
    // No idle timeout — close connection immediately when done
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 10000,
    ...(ssl ? { ssl: { rejectUnauthorized: false } } : {}),
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function resolveConnectionString(): { connectionString: string; ssl: boolean } {
  // Try Hyperdrive first (CF Workers production)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const ctx = getCloudflareContext() as {
      env?: { HYPERDRIVE?: { connectionString: string } };
    };
    if (ctx.env?.HYPERDRIVE?.connectionString) {
      return { connectionString: ctx.env.HYPERDRIVE.connectionString, ssl: false };
    }
  } catch {
    // Local Node.js dev — no CF context
  }
  return { connectionString: process.env.DATABASE_URL ?? "", ssl: true };
}

// Per-request client: created fresh each request so pool connections never go stale.
// CF Workers freeze isolates between requests — a cached Pool's TCP connections die.
export function getPrismaClient(): PrismaClient {
  const { connectionString, ssl } = resolveConnectionString();
  return createPrismaClient(connectionString, ssl);
}

// Convenience proxy for simple one-off use (creates a new client per access).
// For multiple queries in one request, call getPrismaClient() once and reuse.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    return Reflect.get(getPrismaClient(), prop);
  },
});
