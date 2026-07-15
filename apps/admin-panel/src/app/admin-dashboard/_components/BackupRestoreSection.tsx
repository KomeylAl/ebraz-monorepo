"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BackupButton from "./BackupButton";

type BackupRestoreSectionProps = {
  title: string;
  onBackup: () => void;
  onRestore: (data: unknown[]) => void;
  isBackingUp: boolean;
  isRestoring: boolean;
};

export default function BackupRestoreSection({
  title,
  onBackup,
  onRestore,
  isBackingUp,
  isRestoring,
}: BackupRestoreSectionProps) {
  const [data, setData] = useState<unknown[]>([]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const parsed = Array.isArray(json) ? json : [json];
      setData(parsed);
    } catch {
      setData([]);
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-lg bg-white dark:bg-gray-800">
      <h3 className="font-bold text-lg">{title}</h3>

      <BackupButton
        text={`تهیه پشتیبان از ${title}`}
        isLoading={isBackingUp}
        backupFn={onBackup}
      />

      <div className="flex items-center justify-between gap-4">
        <Input
          type="file"
          accept="application/json"
          onChange={handleFileUpload}
        />
        <Button
          disabled={!data.length || isRestoring}
          onClick={() => onRestore(data)}
        >
          {isRestoring ? "در حال بازگردانی..." : `بازگردانی ${title}`}
        </Button>
      </div>
    </div>
  );
}
