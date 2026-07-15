import { AppProviders } from "@/components/providers/AppProviders";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa">
      <body className="">
        <Toaster />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
