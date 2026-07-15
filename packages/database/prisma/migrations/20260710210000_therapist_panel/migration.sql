-- CreateEnum
CREATE TYPE "TherapistResourceType" AS ENUM ('link', 'file');

-- CreateTable
CREATE TABLE "therapist_resumes" (
    "id" TEXT NOT NULL,
    "therapist_id" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "specialization" TEXT,
    "educations" JSONB,
    "experiences" JSONB,
    "skills" JSONB,
    "certifications" JSONB,
    "content" TEXT,
    "social_links" JSONB,
    "file_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "therapist_resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "therapist_resources" (
    "id" TEXT NOT NULL,
    "therapist_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "TherapistResourceType" NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "file_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "therapist_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "therapist_resumes_therapist_id_key" ON "therapist_resumes"("therapist_id");

-- CreateIndex
CREATE INDEX "therapist_resources_therapist_id_idx" ON "therapist_resources"("therapist_id");

-- AddForeignKey
ALTER TABLE "therapist_resumes" ADD CONSTRAINT "therapist_resumes_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "therapists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapist_resources" ADD CONSTRAINT "therapist_resources_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "therapists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
