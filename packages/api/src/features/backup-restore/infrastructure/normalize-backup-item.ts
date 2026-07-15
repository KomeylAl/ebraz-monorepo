type JsonRecord = Record<string, unknown>;

const LEGACY_NULL_STRINGS = new Set(["null", "NULL", "undefined", "Undefined"]);

const LEGACY_KEY_ALIASES: Record<string, string> = {
  doctor_id: "therapistId",
  doctorId: "therapistId",
};

function toCamelKey(key: string): string {
  return (
    LEGACY_KEY_ALIASES[key] ??
    key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase())
  );
}

function normalizeScalar(value: unknown): unknown {
  if (typeof value === "string" && LEGACY_NULL_STRINGS.has(value)) return null;
  return value;
}

/** Convert legacy Laravel/MySQL backup rows (snake_case, numeric ids) to Prisma-shaped records. */
export function normalizeLegacyBackupRecord(raw: JsonRecord): JsonRecord {
  const out: JsonRecord = {};

  for (const [key, value] of Object.entries(raw)) {
    const camelKey = toCamelKey(key);
    let next = normalizeScalar(value);

    if (Array.isArray(next)) {
      next = next.map((entry) =>
        entry !== null && typeof entry === "object" && !Array.isArray(entry)
          ? normalizeLegacyBackupRecord(entry as JsonRecord)
          : normalizeScalar(entry),
      );
    } else if (next !== null && typeof next === "object" && !(next instanceof Date)) {
      next = normalizeLegacyBackupRecord(next as JsonRecord);
    }

    if (camelKey === "id" && (typeof next === "number" || typeof next === "string")) {
      next = String(next);
    }

    out[camelKey] = next;
  }

  return out;
}

export function pickKnownFields(item: JsonRecord, allowed: readonly string[]): JsonRecord {
  const out: JsonRecord = {};
  for (const key of allowed) {
    if (key in item) out[key] = item[key];
  }
  return out;
}

/** Legacy MySQL autoincrement ids are short numeric strings; Prisma uses cuid/uuid strings. */
export function isLegacyNumericId(id: unknown): boolean {
  return typeof id === "string" ? /^\d+$/.test(id) : typeof id === "number";
}
