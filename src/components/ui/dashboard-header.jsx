"use client";
import { memo, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { SidebarTrigger } from "../ui/sidebar";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
export const DashboardHeader = memo(
  ({ pathname = "/" }) => {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    const pageTitles = {
      "/": "Overview",
      "/attandance": "Attendance",
      "/createclass": "Create class",
      "/student-attend": "Student attendance",
      "/uploadassigment": "Assignments",
    };
    const routeName = pathname.split("/").filter(Boolean).at(-1) || "";
    const pageName =
      pageTitles[pathname] ||
      routeName
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

    return (
      <header
        data-slot="dashboard-header"
        className="sticky top-0 z-40 flex h-[68px] w-full shrink-0 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur-md sm:px-6"
      >
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger className="size-9 rounded-lg" />
          <div className="hidden h-8 w-px bg-border sm:block" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">{pageName}</p>
            <p className="hidden text-xs text-muted-foreground sm:block">Institute Portal</p>
          </div>
        </div>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-lg"
            aria-label={
              mounted && resolvedTheme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            title={
              mounted && resolvedTheme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            disabled={!mounted}
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun aria-hidden="true" className="size-4" />
            ) : (
              <Moon aria-hidden="true" className="size-4" />
            )}
          </Button>
        </div>
      </header>
    );
  },
);
DashboardHeader.displayName = "DashboardHeader";