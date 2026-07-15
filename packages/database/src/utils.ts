export function softDeleteData(deletedBy?: string): {
  deletedAt: Date;
  deletedBy: string | null;
} {
  return {
    deletedAt: new Date(),
    deletedBy: deletedBy ?? null,
  };
}

export function activeOnly<T extends { deletedAt?: Date | null }>(): {
  deletedAt: null;
} {
  return { deletedAt: null };
}

export function auditCreateData(createdBy?: string): { createdBy?: string } {
  return { createdBy };
}

export function auditUpdateData(updatedBy?: string): { updatedBy?: string } {
  return { updatedBy };
}
