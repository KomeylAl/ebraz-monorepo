export class BackupRestoreError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "BackupRestoreError";
  }
}
