-- Add therapist profile fields (backfill existing rows before NOT NULL)
ALTER TABLE "therapists"
  ADD COLUMN "avatar" TEXT,
  ADD COLUMN "times" TEXT,
  ADD COLUMN "days" TEXT,
  ADD COLUMN "resume" TEXT,
  ADD COLUMN "card_number" TEXT,
  ADD COLUMN "medical_number" TEXT,
  ADD COLUMN "email" TEXT,
  ADD COLUMN "profile_path" TEXT;

UPDATE "therapists"
SET
  "card_number" = COALESCE("card_number", '6037991234567890'),
  "medical_number" = COALESCE("medical_number", 'psy-12345'),
  "email" = COALESCE("email", 'therapist@ebraz.local'),
  "days" = COALESCE("days", 'شنبه,دوشنبه,چهارشنبه'),
  "times" = COALESCE("times", '09:00-17:00')
WHERE "card_number" IS NULL;

ALTER TABLE "therapists" ALTER COLUMN "card_number" SET NOT NULL;

CREATE UNIQUE INDEX "therapists_card_number_key" ON "therapists"("card_number");
CREATE UNIQUE INDEX "therapists_medical_number_key" ON "therapists"("medical_number");
