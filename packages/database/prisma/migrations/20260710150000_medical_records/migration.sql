-- CreateTable
CREATE TABLE "companions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "birth_date" DATE,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "companions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL,
    "record_number" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "therapist_id" TEXT,
    "supervisor_id" TEXT,
    "admin_id" TEXT,
    "companion_id" TEXT,
    "reference_source" TEXT,
    "admission_date" DATE NOT NULL,
    "visit_date" DATE NOT NULL,
    "chief_complaints" TEXT,
    "present_illness" TEXT,
    "past_history" TEXT,
    "family_history" TEXT,
    "personal_history" TEXT,
    "mse" TEXT,
    "diagnosis" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "record_images" (
    "id" TEXT NOT NULL,
    "medical_record_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "record_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companions_phone_key" ON "companions"("phone");
CREATE UNIQUE INDEX "medical_records_record_number_key" ON "medical_records"("record_number");
CREATE UNIQUE INDEX "medical_records_client_id_key" ON "medical_records"("client_id");
CREATE UNIQUE INDEX "medical_records_companion_id_key" ON "medical_records"("companion_id");
CREATE INDEX "record_images_medical_record_id_idx" ON "record_images"("medical_record_id");

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "therapists"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "therapists"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_companion_id_fkey" FOREIGN KEY ("companion_id") REFERENCES "companions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "record_images" ADD CONSTRAINT "record_images_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
