-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('pending', 'done');

-- CreateTable
CREATE TABLE "init_assessments" (
    "id" TEXT NOT NULL,
    "date" DATE,
    "time" TEXT,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'pending',
    "file_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "init_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_user" (
    "id" TEXT NOT NULL,
    "init_assessment_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "therapist_id" TEXT,

    CONSTRAINT "assessment_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "init_assessments_status_idx" ON "init_assessments"("status");

-- CreateIndex
CREATE INDEX "init_assessments_date_idx" ON "init_assessments"("date");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_user_init_assessment_id_key" ON "assessment_user"("init_assessment_id");

-- CreateIndex
CREATE INDEX "assessment_user_client_id_idx" ON "assessment_user"("client_id");

-- CreateIndex
CREATE INDEX "assessment_user_therapist_id_idx" ON "assessment_user"("therapist_id");

-- AddForeignKey
ALTER TABLE "assessment_user" ADD CONSTRAINT "assessment_user_init_assessment_id_fkey" FOREIGN KEY ("init_assessment_id") REFERENCES "init_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_user" ADD CONSTRAINT "assessment_user_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_user" ADD CONSTRAINT "assessment_user_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "therapists"("id") ON DELETE SET NULL ON UPDATE CASCADE;
