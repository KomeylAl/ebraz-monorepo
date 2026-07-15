export function mapLegacyQuery(searchParams: URLSearchParams): URLSearchParams {
  const mapped = new URLSearchParams();

  for (const [key, value] of searchParams.entries()) {
    // Legacy UIs often send empty query params (`date=`, `search=`); drop them
    // so Zod optional/coerce fields don't treat "" as an invalid date/number.
    if (value.trim() === "") continue;

    if (key === "per_page" || key === "size") {
      mapped.set("pageSize", value);
      continue;
    }
    if (key === "sort_direction") {
      mapped.set("sortDirection", value);
      continue;
    }
    if (key === "page") {
      const pageNum = Number(value);
      mapped.set("page", String(pageNum <= 0 ? 1 : pageNum));
      continue;
    }
    mapped.set(key, value);
  }

  return mapped;
}
