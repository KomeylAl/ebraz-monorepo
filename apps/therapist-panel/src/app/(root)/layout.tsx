import { Toaster } from "react-hot-toast";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      <Toaster />
      <Sidebar />
      <main className="flex-1 lg:mr-80 overflow-y-auto h-screen">
        <SidebarProvider>{children}</SidebarProvider>
      </main>
    </div>
  );
}
