-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PUBLIC', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "DogStatus" AS ENUM ('AVAILABLE', 'ADOPTED', 'IN_CARE', 'PENDING_ADOPTION');

-- CreateEnum
CREATE TYPE "DogSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "DogGender" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "telegramHandle" TEXT,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PUBLIC',
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dogs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameOrigin" TEXT,
    "breed" TEXT,
    "estimatedAge" TEXT,
    "gender" "DogGender" NOT NULL DEFAULT 'UNKNOWN',
    "size" "DogSize" NOT NULL DEFAULT 'MEDIUM',
    "color" TEXT,
    "weight" DOUBLE PRECISION,
    "status" "DogStatus" NOT NULL DEFAULT 'AVAILABLE',
    "description" TEXT NOT NULL,
    "personality" TEXT,
    "healthNotes" TEXT,
    "location" TEXT,
    "registeredBy" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dog_photos" (
    "id" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "telegramFileId" TEXT,
    "caption" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'telegram',
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dog_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "notifyTelegram" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dog_updates" (
    "id" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "photoUrl" TEXT,
    "narrative" TEXT NOT NULL,
    "mood" TEXT,
    "source" TEXT NOT NULL DEFAULT 'ai_camera',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dog_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adoptions" (
    "id" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "adminNotes" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "adoptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dog_tags" (
    "id" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "dog_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telegramId_key" ON "users"("telegramId");

-- CreateIndex
CREATE INDEX "dogs_status_idx" ON "dogs"("status");

-- CreateIndex
CREATE INDEX "dog_photos_dogId_idx" ON "dog_photos"("dogId");

-- CreateIndex
CREATE UNIQUE INDEX "follows_userId_dogId_key" ON "follows"("userId", "dogId");

-- CreateIndex
CREATE INDEX "dog_updates_dogId_idx" ON "dog_updates"("dogId");

-- CreateIndex
CREATE INDEX "dog_updates_createdAt_idx" ON "dog_updates"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "dog_tags_dogId_tag_key" ON "dog_tags"("dogId", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- AddForeignKey
ALTER TABLE "dog_photos" ADD CONSTRAINT "dog_photos_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dog_updates" ADD CONSTRAINT "dog_updates_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoptions" ADD CONSTRAINT "adoptions_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "dogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoptions" ADD CONSTRAINT "adoptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dog_tags" ADD CONSTRAINT "dog_tags_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
