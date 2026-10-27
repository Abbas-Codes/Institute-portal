
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeProvider } from "next-themes";
import { SidebarProvider, SidebarInset } from "../components/ui/sidebar";
import { AdminSidebar } from "../components/ui/admin-sidebar";
import { DashboardHeader } from "../components/ui/dashboard-header";

function LegalFooter() {
  return (
    <footer className="legal-footer">
      <span>&copy; {new Date().getFullYear()} Abbas Codes LMS</span>
      <nav aria-label="Legal information">
        <Link href="/privacy-policy">Privacy Policy</Link>
        <Link href="/terms-and-conditions">Terms and Conditions</Link>
        <Link href="/cookie-policy">Cookie Policy</Link>
      </nav>
    </footer>
  );
}

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const noSidebarRoutes = ["/login", "/reset", "/demo"];
  const hideSidebar = noSidebarRoutes.includes(pathname);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {hideSidebar ? (
        <div className="app-shell-no-sidebar">
          {children}
          <LegalFooter />
        </div>
      ) : (
        <SidebarProvider>
          <AdminSidebar />
          <SidebarInset>
            <DashboardHeader pathname={pathname} />
            {children}
            <LegalFooter />
          </SidebarInset>
        </SidebarProvider>
      )}
    </ThemeProvider>
  );
}
