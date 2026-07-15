-- CreateEnum
CREATE TYPE "BackupType" AS ENUM ('ADMIN', 'THERAPIST', 'THERAPIST_RESUME', 'CLIENT', 'CLIENT_RECORD', 'ASSESSMENT', 'APPOINTMENT', 'PAYMENT', 'DEPARTMENT', 'POST', 'CATEGORY', 'TAG', 'WORKSHOP', 'ABOUT');

-- CreateTable
CREATE TABLE "backups" (
    "id" TEXT NOT NULL,
    "type" "BackupType" NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restores" (
    "id" TEXT NOT NULL,
    "type" "BackupType" NOT NULL,
    "item_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "backups_type_idx" ON "backups"("type");

-- CreateIndex
CREATE INDEX "backups_created_at_idx" ON "backups"("created_at");

-- CreateIndex
CREATE INDEX "restores_type_idx" ON "restores"("type");

-- CreateIndex
CREATE INDEX "restores_created_at_idx" ON "restores"("created_at");
