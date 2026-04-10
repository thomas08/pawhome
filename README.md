# PawHome v2

Platform หาบ้านให้สุนัขจรจัด แบบ **Bot-First** — UX ทั้งหมดผ่าน Telegram Bot, เว็บเป็น read-only gallery

```
Telegram Bot → OpenClaw Gateway → Skills/Scripts → PostgreSQL + R2
                                                        ↓ (read-only)
                                                    Next.js Web App
```

**Live:** https://dogs.maker-hub.net | **Bot:** https://t.me/PawHomeBot

---

## Tech Stack

| Layer | Technology |
|---|---|
| Primary UX | Telegram Bot (OpenClaw Gateway + grammY) |
| AI Backend | OpenClaw Gateway — agent runtime, skills, cron, sessions |
| AI Model | `anthropic/claude-sonnet-4-20250514` |
| Web Display | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | PostgreSQL 16 + Prisma ORM |
| File Storage | Cloudflare R2 (photos) |
| Cache | Redis 7 |
| Deploy | Cloudflare Workers (web) + systemd (OpenClaw) |

---

## Repository Structure

```
dog/
├── CLAUDE.md                    # Claude Code instructions (read this first)
├── AGENT.md                     # Full architecture + schema spec
├── dogai/                       # Main backend package
│   ├── docker-compose.yml       # PostgreSQL 5433 + Redis 6379
│   ├── package.json             # Scripts: db:up, db:migrate, dev, etc.
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma        # DB schema (2 generators: scripts + web)
│   │   └── migrations/          # Migration history
│   ├── lib/                     # Shared utilities
│   │   ├── prisma.ts            # Prisma client (scripts)
│   │   ├── r2.ts                # Cloudflare R2 upload
│   │   ├── telegram.ts          # Telegram file download
│   │   └── stdin.ts             # JSON stdin helper
│   ├── scripts/                 # OpenClaw helper scripts (JSON in → JSON out)
│   │   ├── db-register-dog.ts
│   │   ├── db-get-dog.ts
│   │   ├── db-list-dogs.ts
│   │   ├── db-update-dog.ts
│   │   ├── db-follow.ts
│   │   ├── db-get-followers.ts
│   │   ├── db-create-update.ts
│   │   ├── db-create-adoption.ts
│   │   ├── db-update-adoption.ts
│   │   ├── db-get-user.ts
│   │   ├── db-list-users.ts
│   │   ├── db-set-role.ts
│   │   ├── db-stats.ts
│   │   ├── upload-photo.ts
│   │   └── notify-followers.ts
│   ├── openclaw/                # OpenClaw config (deploy → ~/.openclaw/)
│   │   ├── openclaw.json        # Agent config (model, channels, cron, tools)
│   │   ├── AGENTS.md            # Bot system prompt (Thai)
│   │   └── skills/              # 6 skill files
│   │       ├── dog-register.md
│   │       ├── photo-describe.md
│   │       ├── dog-namer.md
│   │       ├── update-narrator.md
│   │       ├── dog-matcher.md
│   │       └── adoption-handler.md
│   └── web/                     # Next.js web app
│       ├── src/app/             # App Router pages + API routes
│       ├── src/components/      # UI components (shadcn/ui)
│       ├── src/lib/prisma.ts    # Web Prisma client (Hyperdrive aware)
│       ├── wrangler.toml        # Cloudflare Worker config
│       └── open-next.config.ts
└── .gitignore
```

---

## Fresh Installation Guide

> **For Claude Code:** อ่านส่วนนี้ให้ครบก่อนเริ่ม แล้วทำตามลำดับ ห้ามข้ามขั้นตอน

### Prerequisites

ติดตั้งบนเครื่องใหม่ก่อน:

```bash
# Node.js 20+
node --version   # ต้องได้ v20 ขึ้นไป

# Docker + Docker Compose
docker --version
docker compose version

# OpenClaw Gateway (ติดตั้งตาม docs ของ OpenClaw)
openclaw --version

# Cloudflare CLI (สำหรับ deploy web)
npm install -g wrangler
```

---

### Step 1 — Clone

```bash
git clone https://github.com/thomas08/pawhome dog
cd dog
```

---

### Step 2 — Environment Variables

```bash
cd dogai
cp .env.example .env
```

แก้ไข `dogai/.env` ใส่ค่าจริง:

```env
# ─── Database (local dev) ──────────────────────────────────────
DATABASE_URL="postgresql://pawhome:password@localhost:5433/pawhome"

# ─── OpenClaw Gateway ──────────────────────────────────────────
OPENCLAW_GATEWAY_URL="ws://127.0.0.1:18789"
OPENCLAW_GATEWAY_TOKEN=""          # ดูจาก openclaw config

# ─── Telegram Bot ──────────────────────────────────────────────
TELEGRAM_BOT_TOKEN=""              # จาก @BotFather
TELEGRAM_BOT_USERNAME="PawHomeBot"

# ─── Cloudflare R2 (photo storage) ────────────────────────────
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="pawhome-photos"
R2_PUBLIC_URL="https://photos.maker-hub.net"

# ─── Web ───────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL="https://dogs.maker-hub.net"
NEXT_PUBLIC_TELEGRAM_BOT_URL="https://t.me/PawHomeBot"

# ─── Redis ────────────────────────────────────────────────────
REDIS_URL="redis://localhost:6379"
```

> **Production (Supabase):** เปลี่ยน `DATABASE_URL` เป็น session pooler URL:
> `postgresql://postgres.lydlizttxgovhtzflvgi:<password>@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres`
> ใช้ port 5432 (session pooler) เท่านั้น — port 6543 (transaction pooler) ใช้กับ `pg` ใน Workers ไม่ได้

---

### Step 3 — Start Database

```bash
# จาก dogai/
npm run db:up        # เริ่ม PostgreSQL (port 5433) + Redis (port 6379) via Docker
```

ตรวจสอบว่า containers ขึ้นแล้ว:
```bash
docker ps            # ควรเห็น pawhome-postgres และ pawhome-redis
```

---

### Step 4 — Install Dependencies + Migrate DB

```bash
# จาก dogai/
npm install
npm run db:migrate   # สร้าง tables ตาม schema.prisma
npm run db:generate  # generate Prisma client (ทั้ง scripts + web)
```

> **Note:** `db:generate` สร้าง client 2 ชุด — หนึ่งสำหรับ scripts (`dogai/node_modules/.prisma/client`) และหนึ่งสำหรับ web (`dogai/web/node_modules/.prisma/client`) เพราะ web ต้องใช้ `driverAdapters` สำหรับ Cloudflare Workers

---

### Step 5 — Install Web Dependencies

```bash
# จาก dogai/web/
npm install
```

---

### Step 6 — Setup OpenClaw Gateway

#### 6a. Deploy config ไปยัง ~/.openclaw/

```bash
# สร้าง workspace
mkdir -p ~/.openclaw/workspace/pawhome/scripts
mkdir -p ~/.openclaw/workspace/pawhome/skills

# Copy config
cp dogai/openclaw/openclaw.json ~/.openclaw/
cp dogai/openclaw/AGENTS.md ~/.openclaw/workspace/pawhome/
cp dogai/openclaw/skills/*.md ~/.openclaw/workspace/pawhome/skills/

# Copy scripts + shared files ไปยัง workspace
cp dogai/scripts/*.ts ~/.openclaw/workspace/pawhome/scripts/
cp -r dogai/lib ~/.openclaw/workspace/pawhome/
cp -r dogai/prisma ~/.openclaw/workspace/pawhome/
cp dogai/package.json ~/.openclaw/workspace/pawhome/
cp dogai/tsconfig.json ~/.openclaw/workspace/pawhome/
cp dogai/.env ~/.openclaw/workspace/pawhome/.env

# Install dependencies ใน workspace
cd ~/.openclaw/workspace/pawhome && npm install
```

#### 6b. แก้ไข openclaw.json

ไฟล์ `~/.openclaw/openclaw.json` ใส่ `TELEGRAM_BOT_TOKEN` จริง:
```json
{
  "channels": {
    "telegram": {
      "botToken": "YOUR_ACTUAL_BOT_TOKEN"
    }
  }
}
```

#### 6c. Start OpenClaw Gateway

```bash
# ถ้าใช้ systemd
systemctl --user start openclaw-gateway.service
systemctl --user status openclaw-gateway.service

# หรือรัน manual
openclaw start &

# ตรวจสอบ health
openclaw health
```

---

### Step 7 — Set Super Admin

```bash
# จาก dogai/
# แทน YOUR_TELEGRAM_ID ด้วย Telegram user ID ของตัวเอง
# (หา ID ได้จาก @userinfobot หรือดูจาก logs ตอนส่ง message ให้ bot)
printf '{"telegramId":"YOUR_TELEGRAM_ID","role":"SUPER_ADMIN"}' | \
  npx tsx scripts/db-set-role.ts
```

---

### Step 8 — Run Dev Server

```bash
# จาก dogai/
npm run dev          # db:generate + Next.js dev server (http://localhost:3000)
```

เปิด http://localhost:3000 ดูว่าเว็บทำงาน  
ส่ง message ให้ @PawHomeBot บน Telegram ทดสอบ

---

### Step 9 — Test Scripts (Optional)

```bash
# จาก dogai/ ทดสอบ scripts แต่ละตัว
printf '{}' | npx tsx scripts/db-stats.ts
printf '{"status":"AVAILABLE"}' | npx tsx scripts/db-list-dogs.ts
```

---

## Development Workflow

```bash
# ─── Daily dev ───────────────────────────────────────────────
cd dogai
npm run db:up        # เริ่ม DB (ถ้ายังไม่ได้เริ่ม)
npm run dev          # Next.js dev server

# ─── Schema changes ──────────────────────────────────────────
# แก้ dogai/prisma/schema.prisma แล้ว:
npm run db:migrate   # สร้าง migration + apply
npm run db:generate  # regenerate Prisma client

# ─── Script changes ──────────────────────────────────────────
# แก้ dogai/scripts/*.ts แล้ว sync ไปยัง workspace:
cp dogai/scripts/*.ts ~/.openclaw/workspace/pawhome/scripts/
systemctl --user restart openclaw-gateway.service  # หรือ restart gateway

# ─── Skill changes ───────────────────────────────────────────
# แก้ dogai/openclaw/skills/*.md แล้ว:
cp dogai/openclaw/skills/*.md ~/.openclaw/workspace/pawhome/skills/
systemctl --user restart openclaw-gateway.service

# ─── Prisma Studio (DB GUI) ──────────────────────────────────
npm run db:studio    # http://localhost:5555

# ─── Run script manually ─────────────────────────────────────
npx tsx scripts/db-stats.ts <<< '{}'
npx tsx scripts/db-get-dog.ts <<< '{"name":"ส้มจี๊ด"}'
```

> **Critical:** ทุกครั้งที่แก้ไข scripts หรือ skills ใน `dogai/` ต้อง **sync ไปยัง workspace แล้ว restart gateway** — OpenClaw อ่านจาก `~/.openclaw/workspace/` ไม่ใช่จาก repo โดยตรง

---

## Cloudflare Workers Deployment (Web)

### Prerequisites

- Cloudflare account ที่มี zone `maker-hub.net`
- Hyperdrive binding ID: `b651caaca6d8434799ae2b4a3ef8bee1` (config: `pawhome-pg`)
- Cloudflare API token ที่มีสิทธิ์ Workers + Hyperdrive

### Deploy

```bash
cd dogai/web

# Set secrets (ทำครั้งแรกครั้งเดียว)
CLOUDFLARE_API_TOKEN=<token> npx wrangler secret put DATABASE_URL
# ใส่ Supabase session pooler URL เมื่อ prompt

# Build + Deploy
export CLOUDFLARE_API_TOKEN=<token>
export CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE="postgresql://pawhome:password@localhost:5433/pawhome"
npm run cf:deploy    # opennextjs-cloudflare build + wrangler deploy

# ตรวจสอบ
curl -s https://dogs.maker-hub.net/api/stats
```

### Hyperdrive — Critical Note

`dogai/web/src/lib/prisma.ts` ตรวจสอบ Hyperdrive context อัตโนมัติ:
- **Cloudflare Workers (production):** ใช้ `HYPERDRIVE.connectionString` **ไม่ใช้ SSL** (Hyperdrive จัดการ TLS เอง)
- **Local dev:** ใช้ `DATABASE_URL` จาก `.env` **พร้อม SSL**

อย่าแก้ไข logic นี้ — ถ้า enable SSL ผ่าน Hyperdrive จะ error

---

## Production Database — Supabase

| Property | Value |
|---|---|
| Project ID | `lydlizttxgovhtzflvgi` |
| Region | `ap-southeast-1` (Singapore) |
| Session pooler host | `aws-1-ap-southeast-1.pooler.supabase.com` |
| Session pooler port | `5432` |
| Transaction pooler port | `6543` (อย่าใช้กับ Workers) |

**Connection string format:**
```
postgresql://postgres.lydlizttxgovhtzflvgi:<DB_PASSWORD>@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

---

## OpenClaw Skills Reference

| Skill | เมื่อไหร่ |
|---|---|
| `dog-register` | Admin ส่งรูปหมา → vision AI + ตั้งชื่อ + save |
| `photo-describe` | สร้าง caption ภาษาไทยสำหรับรูปใหม่ |
| `dog-namer` | สร้างชื่อไทยน่ารัก 3-5 ชื่อจากลักษณะ |
| `update-narrator` | เขียน narrative update อบอุ่นสำหรับ followers |
| `dog-matcher` | ค้นหาหมาจาก natural language |
| `adoption-handler` | adoption flow แบบ conversational |

### Cron Jobs (อัตโนมัติ)

| Job | Schedule | หน้าที่ |
|---|---|---|
| `dog-morning-update` | 08:00 ทุกวัน | สร้าง morning update ส่งให้ followers |
| `dog-evening-update` | 16:00 ทุกวัน | สร้าง evening update ส่งให้ followers |

---

## Helper Scripts API

ทุก script: รับ JSON จาก stdin → ส่ง JSON ออก stdout

```bash
# Pattern
printf '<JSON_INPUT>' | npx tsx scripts/<script>.ts

# ตัวอย่าง
printf '{}' | npx tsx scripts/db-stats.ts
printf '{"status":"AVAILABLE","size":"SMALL"}' | npx tsx scripts/db-list-dogs.ts
printf '{"telegramId":"123456789","role":"ADMIN"}' | npx tsx scripts/db-set-role.ts
printf '{"name":"ส้มจี๊ด"}' | npx tsx scripts/db-get-dog.ts
```

---

## Web API Endpoints (Read-Only)

```
GET /api/dogs              # รายการหมาทั้งหมด (query: status, size, gender)
GET /api/dogs/[id]         # รายละเอียดหมา
GET /api/updates           # Update feed ล่าสุด
GET /api/stats             # สถิติรวม
POST /api/webhooks/openclaw # OpenClaw webhook → trigger ISR revalidation
```

---

## Database Schema Overview

```
users        — Telegram users (role: PUBLIC/ADMIN/SUPER_ADMIN)
dogs         — Dog profiles (status: AVAILABLE/IN_CARE/PENDING_ADOPTION/ADOPTED)
dog_photos   — Photos with R2 URLs
dog_updates  — AI-generated daily narratives
follows      — User ↔ Dog follow relationships
adoptions    — Adoption requests + status
dog_tags     — Free-form tags per dog
system_config — Key-value system settings
```

---

## Key Conventions

- **Bot language:** ไทยเสมอ ใช้ "ค่ะ/คะ" (ห้าม expose error ดิบให้ user)
- **Scripts:** TypeScript strict + Zod validation ทุก input/output
- **Telegram UX:** inline keyboards เสมอ, ส่งรูปเป็น album
- **Photos flow:** Telegram `file_id` → `upload-photo.ts` → R2 URL → บันทึกใน DB
- **Web:** ไม่มี auth, ไม่มี form — ทุก CTA redirect ไป `t.me/PawHomeBot?start=ACTION_ID`
- **Prisma:** 2 generators — `client` (scripts) และ `clientWeb` (web + driverAdapters)
- **Port:** PostgreSQL local ใช้ **5433** (5432 ถูกใช้โดย service อื่น)

---

## Troubleshooting

### Bot ไม่ตอบ
```bash
# เช็ค OpenClaw gateway
systemctl --user status openclaw-gateway.service
journalctl --user -u openclaw-gateway.service -n 20 --no-pager

# เช็คว่า TELEGRAM_BOT_TOKEN ถูกต้องใน ~/.openclaw/openclaw.json
```

### Script error จาก bot
```bash
# รัน script ตรงๆ เพื่อดู error
printf '<input>' | npx tsx scripts/<name>.ts
```

### Web แสดงข้อมูลเก่า (production)
```bash
# Trigger ISR revalidation
curl -X POST https://dogs.maker-hub.net/api/webhooks/openclaw \
  -H "Content-Type: application/json" \
  -d '{"event":"revalidate","paths":["/","/dogs"]}'
```

### Prisma client ไม่ up-to-date
```bash
cd dogai
npm run db:generate  # regenerate ทั้ง scripts + web client
```

### Worker deploy ล้มเหลว (SSL error)
```bash
# ตรวจสอบว่า web/src/lib/prisma.ts ไม่ได้ใช้ ssl: true ผ่าน Hyperdrive
# Hyperdrive จัดการ TLS เอง — prisma.ts ต้องส่ง ssl: false เมื่อมี HYPERDRIVE context
```
