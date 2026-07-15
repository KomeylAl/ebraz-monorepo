import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import Providers from "./(root)/providers";

export const metadata: Metadata = {
  title: "پنل روان‌درمانگر - ابراز",
  description: "پنل روان‌درمانگر - ابراز",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <ThemeProvider>
          <Providers>
            <UserProvider>{children}</UserProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
