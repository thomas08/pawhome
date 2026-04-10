# AGENT.md — PawHome v2: Bot-First Dog Adoption Platform

## Project Overview

**PawHome** คือ platform สำหรับลงทะเบียนสุนัขจรจัดและหาบ้านให้สุนัข

**Paradigm: Bot-First, Web-as-Display**
- **UX (การทำงานทั้งหมด)** → ผ่าน Telegram Bot เป็นหลัก — คุยกับ bot เพื่อลงทะเบียนหมา, ติดตาม, ขอรับเลี้ยง
- **UI (การแสดงผล)** → Web App เป็น read-only gallery สำหรับคนทั่วไปเข้าดู
- **AI Backend** → OpenClaw Gateway จัดการ agent runtime, skills, sessions, cron

ข้อดี: Admin ไม่ต้องเปิด web — แค่ส่งรูปใน Telegram ก็ลงทะเบียนหมาได้เลย, User ติดตามหมาผ่าน Telegram ได้โดยไม่ต้องเข้าเว็บ, Web เป็นแค่ showcase สวยๆ สำหรับ SEO + sharing

---

## Tech Stack

| Layer | Technology |
|---|---|
| Primary UX | Telegram Bot (via OpenClaw built-in grammY channel) |
| Display UI | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| AI Backend | OpenClaw Gateway (Agent Runtime, Skills, Cron, Sessions) |
| Database | PostgreSQL 16 + Prisma ORM |
| File Storage | Cloudflare R2 (S3-compatible) |
| Cache | Redis (session store + rate limiting) |
| AI Model | Anthropic Claude (via OpenClaw agent config) |
| Deployment | Docker Compose |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              Telegram Bot (Primary UX)              │
│  Admin: ส่งรูป → ลงทะเบียน    User: /follow /adopt │
│  Chat-based interactions for ALL operations          │
└──────────────────────┬──────────────────────────────┘
                       │ OpenClaw Telegram channel
                       ▼
┌─────────────────────────────────────────────────────┐
│              OpenClaw Gateway + Agent                │
│  Skills: vision, namer, narrator, matcher           │
│  Sessions: per-user conversations                    │
│  Cron: AI camera auto-updates                        │
│  Tools: exec, browser, db-write                      │
└──────────┬──────────────────────┬───────────────────┘
           │                      │
    ┌──────┴──────┐        ┌──────┴──────┐
    │ PostgreSQL  │        │ R2 Storage  │
    │ Dogs, Users │        │ Photos      │
    │ Follows     │        │             │
    └──────┬──────┘        └─────────────┘
           │ Read-only API
           ▼
┌─────────────────────────────────────────────────────┐
│         Next.js Web App (Read-Only Display)         │
│  Public gallery │ Dog profiles │ Update feed         │
│  No login needed │ SEO-friendly │ Share links        │
└─────────────────────────────────────────────────────┘
```

---

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  PUBLIC
  ADMIN
  SUPER_ADMIN
}

enum DogStatus {
  AVAILABLE
  ADOPTED
  IN_CARE
  PENDING_ADOPTION
}

enum DogSize {
  SMALL
  MEDIUM
  LARGE
}

enum DogGender {
  MALE
  FEMALE
  UNKNOWN
}

model User {
  id             String    @id @default(cuid())
  telegramId     String    @unique
  telegramHandle String?
  name           String?
  role           UserRole  @default(PUBLIC)
  phone          String?
  email          String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  follows        Follow[]
  adoptions      Adoption[]

  @@map("users")
}

model Dog {
  id              String    @id @default(cuid())
  name            String
  nameOrigin      String?
  breed           String?
  estimatedAge    String?
  gender          DogGender @default(UNKNOWN)
  size            DogSize   @default(MEDIUM)
  color           String?
  weight          Float?
  status          DogStatus @default(AVAILABLE)
  description     String    @db.Text
  personality     String?   @db.Text
  healthNotes     String?   @db.Text
  location        String?
  registeredBy    String?
  registeredAt    DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  photos          DogPhoto[]
  follows         Follow[]
  updates         DogUpdate[]
  adoptions       Adoption[]
  tags            DogTag[]

  @@index([status])
  @@map("dogs")
}

model DogPhoto {
  id             String   @id @default(cuid())
  dogId          String
  url            String
  telegramFileId String?
  caption        String?  @db.Text
  isMain         Boolean  @default(false)
  source         String   @default("telegram")
  takenAt        DateTime @default(now())
  createdAt      DateTime @default(now())

  dog            Dog      @relation(fields: [dogId], references: [id], onDelete: Cascade)

  @@index([dogId])
  @@map("dog_photos")
}

model Follow {
  id             String   @id @default(cuid())
  userId         String
  dogId          String
  notifyTelegram Boolean  @default(true)
  createdAt      DateTime @default(now())

  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  dog            Dog      @relation(fields: [dogId], references: [id], onDelete: Cascade)

  @@unique([userId, dogId])
  @@map("follows")
}

model DogUpdate {
  id          String   @id @default(cuid())
  dogId       String
  photoUrl    String?
  narrative   String   @db.Text
  mood        String?
  source      String   @default("ai_camera")
  createdAt   DateTime @default(now())

  dog         Dog      @relation(fields: [dogId], references: [id], onDelete: Cascade)

  @@index([dogId])
  @@index([createdAt])
  @@map("dog_updates")
}

model Adoption {
  id          String   @id @default(cuid())
  dogId       String
  userId      String
  status      String   @default("pending")
  reason      String?  @db.Text
  adminNotes  String?  @db.Text
  appliedAt   DateTime @default(now())
  resolvedAt  DateTime?

  dog         Dog      @relation(fields: [dogId], references: [id])
  user        User     @relation(fields: [userId], references: [id])

  @@map("adoptions")
}

model DogTag {
  id    String @id @default(cuid())
  dogId String
  tag   String

  dog   Dog    @relation(fields: [dogId], references: [id], onDelete: Cascade)

  @@unique([dogId, tag])
  @@map("dog_tags")
}

model SystemConfig {
  id    String @id @default(cuid())
  key   String @unique
  value String @db.Text

  @@map("system_config")
}
```

---

## Telegram Bot Commands & Conversations

### Public User Commands
```
/start                    → Welcome + แนะนำ bot
/dogs                     → แสดงรายการหมา (inline keyboard)
/dog <name>               → ดูรายละเอียดหมา
/follow <name>            → ติดตามหมา
/unfollow <name>          → เลิกติดตาม
/following                → ดูรายการที่ follow
/adopt <name>             → เริ่มขอรับเลี้ยง (conversational)
/status                   → ดูสถานะคำขอรับเลี้ยง
/help                     → คำสั่งทั้งหมด
```

### Admin Commands (role-gated)
```
[ส่งรูปหมา]               → AI analyze → preview → confirm → save
/edit <name>              → แก้ไขข้อมูลหมา (conversational)
/setstatus <name> <status> → เปลี่ยนสถานะหมา
/approve <id>             → อนุมัติรับเลี้ยง
/reject <id>              → ปฏิเสธรับเลี้ยง
/broadcast <message>      → ส่งข้อความถึง followers
/stats                    → สถิติรวม
```

### Super Admin Commands
```
/addadmin <telegram_id>   → เพิ่ม admin
/removeadmin <telegram_id> → ลบ admin
/users                    → ดู users ทั้งหมด
/config <key> <value>     → ตั้งค่า system
/export                   → Export CSV
```

### Natural Language (via OpenClaw Agent)

```
User: "อยากดูหมาตัวเล็กๆ สีน้ำตาล"
Bot:  [แสดงรูปหมาที่ match + inline keyboards]

User: "น้องตัวแรกน่ารักจัง อยากติดตาม"
Bot:  "Follow น้องทองดีเรียบร้อยค่ะ 💕"

Admin: [ส่งรูปหมา 3 รูป]
Bot:   "เจอน้องหมาตัวใหม่! กำลังวิเคราะห์..."
       "น้องเป็นพันธุ์ผสม ขนสีส้มทอง ตัวกลาง ~1.5 ปี
        ขอตั้งชื่อว่า 'ส้มจี๊ด' ค่ะ เพราะสีขนส้มสดใส"
       [Confirm ✓] [เปลี่ยนชื่อ] [เพิ่มข้อมูล] [ยกเลิก]
```

---

## OpenClaw Configuration

```jsonc
// ~/.openclaw/openclaw.json
{
  "agent": {
    "model": "anthropic/claude-sonnet-4-20250514",
    "workspace": "~/.openclaw/workspace/pawhome"
  },
  "agents": {
    "defaults": {
      "skills": [
        "dog-register", "photo-describe", "dog-namer",
        "update-narrator", "dog-matcher", "adoption-handler"
      ]
    }
  },
  "channels": {
    "telegram": {
      "botToken": "${TELEGRAM_BOT_TOKEN}",
      "allowFrom": ["*"],
      "groups": { "*": { "requireMention": true } }
    }
  }
}
```

### AGENTS.md (System Prompt)
```markdown
You are PawHome Bot — a friendly Thai-speaking AI for dog registration and adoption.

Personality: พูดไทย, สุภาพ, อบอุ่น, รักสัตว์, ใช้ "ค่ะ/คะ"
ตั้งชื่อหมาเป็นไทยน่ารักๆ, เล่าเรื่องหมาแบบอบอุ่น

Capabilities:
- รับรูปหมาจาก Admin → วิเคราะห์ + ลงทะเบียนอัตโนมัติ
- ตอบคำถามเกี่ยวกับหมาในระบบ
- จัดการ follow/unfollow + adoption
- สร้าง daily updates
- ค้นหาหมาตามลักษณะ (natural language)

Database: ใช้ exec tool → run scripts ใน /scripts/db-*.ts
Role Check: ตรวจ Telegram user ID กับ DB เพื่อเช็ค role
```

### Skills (6 skills)

1. **dog-register** — Vision AI วิเคราะห์รูปหมา → breed, age, color, personality → ตั้งชื่อไทย → save
2. **photo-describe** — สร้าง caption ภาษาไทยสำหรับรูปหมาใหม่
3. **dog-namer** — สร้างชื่อไทยน่ารัก 3-5 ชื่อจากลักษณะ
4. **update-narrator** — เขียน narrative update อบอุ่นสำหรับ followers
5. **dog-matcher** — ค้นหาหมาจาก natural language query
6. **adoption-handler** — จัดการ adoption flow แบบ conversational

### Cron Jobs
```jsonc
{
  "cron": {
    "dog-morning-update":  { "schedule": "0 8 * * *",  "message": "อัพเดทเช้า..." },
    "dog-evening-update":  { "schedule": "0 16 * * *", "message": "อัพเดทเย็น..." }
  }
}
```

### Helper Scripts
```
~/.openclaw/workspace/pawhome/scripts/
├── db-register-dog.ts       # Create dog + photos + tags
├── db-get-dog.ts            # Get dog by name/ID
├── db-list-dogs.ts          # List with filters
├── db-update-dog.ts         # Update dog fields
├── db-follow.ts             # Follow/unfollow
├── db-get-followers.ts      # Get followers of a dog
├── db-create-update.ts      # Create update + notify
├── db-create-adoption.ts    # Create adoption request
├── db-update-adoption.ts    # Update adoption status
├── db-get-user.ts           # Get/create user by Telegram ID
├── db-list-users.ts         # List users (admin)
├── db-set-role.ts           # Change role (super admin)
├── db-stats.ts              # System statistics
├── upload-photo.ts          # Upload to R2
└── notify-followers.ts      # Send Telegram messages
```

Each script: Prisma client, JSON stdin → JSON stdout, proper error handling.

---

## Web App (Read-Only Display)

### Purpose
เว็บเป็น "หน้าร้าน" — ไม่มี login, ไม่มี form, ทุก CTA → Telegram Bot

### Routes
```
/                           # Landing page + featured dogs + stats
/dogs                       # Gallery grid (filter: breed, size, status)
/dogs/[id]                  # Dog profile + photos + updates timeline
                            # CTA: "ติดตาม → t.me/PawHomeBot?start=follow_ID"
                            # CTA: "รับเลี้ยง → t.me/PawHomeBot?start=adopt_ID"
/updates                    # Public feed (all dog updates)
/about                      # About the project
/adopt                      # How to adopt guide → Telegram link
/api/dogs                   # GET list
/api/dogs/[id]              # GET detail
/api/updates                # GET latest updates
/api/stats                  # GET public stats
/api/webhooks/openclaw      # POST webhook from OpenClaw
```

### Design Principles
1. ทุก CTA → `https://t.me/PawHomeBot?start=ACTION_ID`
2. No auth — static/ISR pages, SEO-friendly
3. OpenClaw webhook → revalidate pages on data change
4. Open Graph meta for rich social sharing

---

## Key User Flows

### Flow 1: Admin ลงทะเบียนหมา
```
Admin ส่งรูป → Bot: "กำลังวิเคราะห์..." → AI สร้าง profile
→ Bot แสดง preview + [Confirm/Edit/Cancel]
→ Admin กด confirm → Save DB + R2 + Web updated
```

### Flow 2: User ติดตามหมา
```
User: /dogs → Bot แสดง album → User เลือกตัว → กด Follow
→ ทุกวัน AI Camera cron → สร้าง update → Bot ส่งให้ followers
```

### Flow 3: User ค้นหาแบบ natural language
```
User: "หมาเล็กเชื่องเหมาะคอนโด" → dog-matcher → Bot แสดง top 3
→ [Follow] [ขอรับเลี้ยง] [ดูเพิ่ม]
```

### Flow 4: Adoption (conversational)
```
User: "อยากรับเลี้ยงน้องส้มจี๊ด" → Bot ถามทีละข้อ
→ สรุป → [Confirm] → Save → Notify admin → Admin approve/reject → Notify user
```

### Flow 5: คนเข้าเว็บ
```
เห็น link บน social → เข้าเว็บ → ดู profile → กด CTA → เปิด Telegram Bot
```

---

## Implementation Phases

1. **Foundation** — Project setup, Prisma, OpenClaw Gateway + Telegram
2. **Dog Registration** — Vision AI + naming + save (core bot flow)
3. **Browse & Follow** — /dogs, inline keyboards, follow system
4. **Daily Updates** — Cron, narrator skill, notify followers
5. **Adoption** — Conversational flow, admin approve/reject
6. **Web Display** — Next.js read-only gallery, SEO, social sharing
7. **Admin Tools** — Stats, editing, user management
8. **Deploy** — Docker Compose, domain, polish

---

## Design Guidelines

### Bot Personality
- ชื่อ: PawHome Bot | ภาษา: ไทย (ค่ะ/คะ)
- Tone: อบอุ่น, เป็นมิตร, รักสัตว์ | ตอบกระชับ
- ใช้ inline keyboards เสมอ | ส่งรูปเป็น album

### Web Visual Style
- Colors: Amber primary, Teal secondary, Coral CTA, Cream bg
- Font: Noto Sans Thai | Layout: Clean gallery, large photos
- ทุกปุ่ม action → Telegram deep link | Mobile-first

---

## Environment Variables

```env
# Local dev (dogai/.env)
DATABASE_URL="postgresql://pawhome:password@localhost:5433/pawhome"
OPENCLAW_GATEWAY_URL="ws://127.0.0.1:18789"
OPENCLAW_GATEWAY_TOKEN="your-gateway-token"
TELEGRAM_BOT_TOKEN="your-bot-token"
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

### Cloudflare Worker Secrets
Set via `wrangler secret put` (not in wrangler.toml):
- `DATABASE_URL` — Supabase session pooler (fallback when Hyperdrive unavailable)

---

## Deployment (Production)

### Database — Supabase
- Project: `lydlizttxgovhtzflvgi` | Region: `ap-southeast-1` (Singapore)
- Session pooler: `aws-1-ap-southeast-1.pooler.supabase.com:5432`
- **Important**: Transaction pooler (port 6543) does NOT work with `pg` in Workers — always use session pooler or Hyperdrive

### Local Database (Docker)
- PostgreSQL runs on port **5433** (5432 is occupied by another local service)
- `docker compose up -d` from `dogai/`

### Cloudflare Workers
- Worker name: `pawhome-web` | Domain: `dogs.maker-hub.net`
- Hyperdrive ID: `b651caaca6d8434799ae2b4a3ef8bee1` (config: `pawhome-pg`)
- Deploy command (from `dogai/web/`):
  ```bash
  export CLOUDFLARE_API_TOKEN=<token>
  export CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE="postgresql://pawhome:password@localhost:5433/pawhome"
  npm run cf:deploy
  ```
- **Critical**: `prisma.ts` disables SSL when using Hyperdrive (Hyperdrive handles TLS internally)

---

## Notes for Claude Code

- **Paradigm**: Bot-first — business logic อยู่ใน OpenClaw skills + scripts
- **Web**: Read-only, no auth, no forms — display + CTA → Telegram
- **ภาษา**: Bot ตอบไทย, code comments อังกฤษ
- **Scripts**: Standalone .ts, Prisma, JSON in/out, proper error handling
- **Telegram**: ใช้ inline keyboards เสมอ, ส่งรูปเป็น album
- **Sessions**: OpenClaw per-user sessions — bot จำ context
- **Photos**: Telegram file_id → download → R2 → save URL
- **Errors**: Bot reply ข้อความเป็นมิตร ไม่แสดง error ดิบ
- **Types**: TypeScript strict, Zod validation ทุก script
- **Tests**: Vitest สำหรับ scripts, OpenClaw agent test สำหรับ skills
