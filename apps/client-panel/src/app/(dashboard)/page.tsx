"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ebraz/ui";
import { useAuth } from "@ebraz/web";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>سلام {user?.name}</CardTitle>
        <CardDescription>پنل مراجع — متصل به API جدید</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-zinc-600">
        صفحات بیشتر در مهاجرت بعدی اضافه می‌شوند.
      </CardContent>
    </Card>
  );
}
