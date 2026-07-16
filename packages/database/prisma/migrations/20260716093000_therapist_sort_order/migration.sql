-- AlterTable
ALTER TABLE "therapists" ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing therapists by name (matches previous public list order)
WITH ranked AS (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY name ASC) - 1) AS rn
  FROM "therapists"
  WHERE "deleted_at" IS NULL
)
UPDATE "therapists" AS t
SET "sort_order" = ranked.rn
FROM ranked
WHERE t.id = ranked.id;
