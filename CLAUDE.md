# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: PawHome v2

Bot-first dog adoption platform. Primary UX is via **Telegram Bot** (powered by OpenClaw Gateway). The **Next.js web app** is read-only display only — no auth, no forms.

See `AGENT.md` for full architecture spec, schema, and design guidelines.

---

## Commands

```bash
# ─── Local dev ───────────────────────────────────────────────
cd dogai
npm run db:up           # Start PostgreSQL (port 5433) + Redis via Docker
npm run db:migrate      # Apply Prisma migrations (runs prisma migrate dev)
npm run db:generate     # Regenerate Prisma client (both generators)
npm run db:seed         # Seed initial data
npm run dev             # db:generate + Next.js dev server together

# Scripts (run from dogai/)
npx tsx scripts/<name>.ts   # e.g. npx tsx scripts/db-stats.ts <<< '{}'

# ─── Cloudflare Workers deploy ───────────────────────────────
cd web
npm run cf:build        # Build via opennextjs-cloudflare (output: .open-next/)
npm run cf:preview      # Local preview with wrangler
# Deploy requires env vars:
export CLOUDFLARE_API_TOKEN=<token>
export CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE="postgresql://pawhome:password@localhost:5433/pawhome"
npm run cf:deploy       # Build + wrangler deploy (Worker, not Pages)
npm run cf:types        # Generate CF env types

# ─── Database ────────────────────────────────────────────────
# Run from dogai/ (prisma/schema.prisma lives here)
npx prisma migrate dev
npx prisma migrate deploy
npx prisma generate
npx prisma studio
```

---

## Architecture

### Paradigm: Bot-First, Web-as-Display

All business logic lives in **OpenClaw skills + helper scripts**. The web app only reads the database via API routes and displays data.

```
Telegram Bot → OpenClaw Gateway → Skills/Scripts → PostgreSQL + R2
                                                        ↓ (read-only)
                                                    Next.js Web App
```

### OpenClaw Agent Config (`dogai/openclaw/openclaw.json` → deploy to `~/.openclaw/`)
- Model: `anthropic/claude-sonnet-4-20250514`
- Workspace: `~/.openclaw/workspace/pawhome`
- Telegram channel with bot token from `TELEGRAM_BOT_TOKEN`
- 6 skills defined in `dogai/openclaw/skills/*.md`: `dog-register`, `photo-describe`, `dog-namer`, `update-narrator`, `dog-matcher`, `adoption-handler`
- System prompt lives in `dogai/openclaw/AGENTS.md`
- 2 daily cron jobs: morning update (08:00) and evening update (16:00)

### Helper Scripts (`dogai/scripts/`)
Standalone TypeScript files. Each: imports Prisma, reads JSON from stdin, writes JSON to stdout. The OpenClaw agent calls these via its `exec` tool.

Shared utilities used by scripts live in `dogai/lib/`: `prisma.ts` (Prisma client), `r2.ts` (S3/R2 upload), `telegram.ts` (file download).

Key scripts: `db-register-dog.ts`, `db-get-dog.ts`, `db-list-dogs.ts`, `db-follow.ts`, `db-create-update.ts`, `db-create-adoption.ts`, `db-update-adoption.ts`, `db-update-dog.ts`, `notify-followers.ts`, `upload-photo.ts`, `db-stats.ts`, `db-set-role.ts`

### Cloudflare Workers Deployment (`web/`)
- Build adapter: `@opennextjs/cloudflare` (output: `.open-next/`)
- Deploy: `wrangler deploy` (Worker with Assets binding) — **not** `wrangler pages deploy`
- Compatibility flag: `nodejs_compat_v2` (required for `pg` library)
- **Hyperdrive** binding (`HYPERDRIVE`, id: `b651caaca6d8434799ae2b4a3ef8bee1`) — PostgreSQL connection pooling via Cloudflare network; Hyperdrive handles TLS, so `pg` Pool must NOT use SSL when connecting via Hyperdrive
- `web/src/lib/prisma.ts` — lazy proxy; uses `getCloudflareContext().env.HYPERDRIVE.connectionString` (no SSL) if available, else falls back to `process.env.DATABASE_URL` (with SSL)
- Deployed to `dogs.maker-hub.net` (zone: `maker-hub.net`, Worker route)
- Images: `unoptimized: true`

### Database
- **Production**: Supabase (project `lydlizttxgovhtzflvgi`, region `ap-southeast-1`)
  - Session pooler: `postgresql://postgres.lydlizttxgovhtzflvgi:...@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres`
  - Transaction pooler (port 6543) does NOT work with `pg` in Workers — use session pooler or Hyperdrive
- **Local dev**: Docker Compose on port **5433** (5432 is taken by another service)
  - `DATABASE_URL="postgresql://pawhome:password@localhost:5433/pawhome"`
- Two Prisma generators in `prisma/schema.prisma`: one for scripts, one for web (with `driverAdapters`)

### Web App Routes
- `/` — landing + featured dogs + stats
- `/dogs` — gallery grid with filters
- `/dogs/[id]` — dog profile + photo + updates timeline
- `/updates` — public update feed
- `/about`, `/adopt` — static info pages
- `/api/*` — read-only JSON endpoints (`/api/dogs`, `/api/dogs/[id]`, `/api/updates`, `/api/stats`)
- `/api/webhooks/openclaw` — POST webhook from OpenClaw (triggers ISR revalidation)

All CTAs on the web link to `https://t.me/PawHomeBot?start=ACTION_ID`.

---

## Key Conventions

- **Language**: Bot replies in Thai (`ค่ะ/คะ`), code comments in English
- **Scripts**: TypeScript strict + Zod validation on all script I/O
- **Telegram UX**: Always use inline keyboards; send multiple photos as album
- **Photos**: Telegram `file_id` → download → upload to Cloudflare R2 → save R2 URL to DB
- **Errors**: Bot returns friendly Thai messages — never expose raw errors to users
- **Web**: No authentication, no forms — all interactive actions redirect to Telegram Bot
- **Sessions**: OpenClaw manages per-user conversation context automatically

---

## Environment Variables

```env
# Local dev (dogai/.env)
DATABASE_URL="postgresql://pawhome:password@localhost:5433/pawhome"
OPENCLAW_GATEWAY_URL="ws://127.0.0.1:18789"
OPENCLAW_GATEWAY_TOKEN=""
TELEGRAM_BOT_TOKEN=""
TELEGRAM_BOT_USERNAME="PawHomeBot"
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="pawhome-photos"
R2_PUBLIC_URL="https://photos.maker-hub.net"
NEXT_PUBLIC_SITE_URL="https://dogs.maker-hub.net"
NEXT_PUBLIC_TELEGRAM_BOT_URL="https://t.me/PawHomeBot"
REDIS_URL="redis://localhost:6379"
```

Cloudflare Worker secrets (set via `wrangler secret put`):
- `DATABASE_URL` — Supabase session pooler URL (fallback when Hyperdrive not available)
