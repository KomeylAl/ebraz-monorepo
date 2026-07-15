-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('system', 'reminder', 'appointment', 'message');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "type" "NotificationType" NOT NULL DEFAULT 'system',
    "target_role" "UserRole",
    "target_id" TEXT,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'medium',
    "delivery_channels" JSONB,
    "status" "NotificationStatus" NOT NULL DEFAULT 'sent',
    "meta" JSONB,
    "scheduled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_reads" (
    "id" TEXT NOT NULL,
    "notification_id" TEXT NOT NULL,
    "receiver_role" "UserRole" NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_reads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_target_role_target_id_idx" ON "notifications"("target_role", "target_id");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "notification_reads_receiver_role_receiver_id_idx" ON "notification_reads"("receiver_role", "receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_reads_notification_id_receiver_role_receiver_id_key" ON "notification_reads"("notification_id", "receiver_role", "receiver_id");

-- AddForeignKey
ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
