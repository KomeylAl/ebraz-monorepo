export const metadata = {
  title: "Ebraz Clinic API",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa">
      <body>{children}</body>
    </html>
  );
}
