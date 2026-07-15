export class IdMap {
  private readonly maps = new Map<string, Map<string, string>>();

  set(entity: string, legacyId: string | number, newId: string): void {
    const key = String(legacyId);
    if (!this.maps.has(entity)) {
      this.maps.set(entity, new Map());
    }
    this.maps.get(entity)!.set(key, newId);
  }

  get(entity: string, legacyId: string | number | null | undefined): string | undefined {
    if (legacyId === null || legacyId === undefined) return undefined;
    return this.maps.get(entity)?.get(String(legacyId));
  }

  require(entity: string, legacyId: string | number, context?: string): string {
    const id = this.get(entity, legacyId);
    if (!id) {
      throw new Error(
        `Missing ${entity} mapping for legacy id ${legacyId}${context ? ` (${context})` : ""}`,
      );
    }
    return id;
  }
}
