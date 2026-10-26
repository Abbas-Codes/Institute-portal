"use client";

import { memo, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth, db } from "../../../firebaseconfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { LoadingIndicator } from "./loading-indicator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../ui/sidebar";
import {
  LayoutDashboard,
  Users,
  FileText,
  User,
  CalendarDays,
  ClipboardCheck,
  Wallet,
  GraduationCap,
  BriefcaseBusiness,
  LogOut,
} from "lucide-react";

export const AdminSidebar = memo(() => {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState("");
  const [links, setLinks] = useState([]);

  const navLinks = {
    admin: [
      { name: "Dashboard", path: "/", icon: LayoutDashboard },
      { name: "Timetable", path: "/timetable", icon: CalendarDays },
      { name: "Create Class", path: "/createclass", icon: Users },
      { name: "Create User", path: "/signup", icon: User },
      { name: "Attendance", path: "/attandance", icon: ClipboardCheck },
      { name: "Assignments", path: "/uploadassigment", icon: FileText },
      { name: "Fee", path: "/fee", icon: Wallet },
      { name: "Student Attendance", path: "/student-attend", icon: GraduationCap },
      { name: "Application", path: "/application", icon: FileText },
      { name: "Members", path: "/users", icon: BriefcaseBusiness },
    ],
    teacher: [
      { name: "Attendance", path: "/attandance", icon: FileText },
      { name: "Assignments", path: "/uploadassigment", icon: Users },
    ],
    student: [
      { name: "Fee", path: "/fee", icon: Users },
      { name: "Attendance", path: "/attendance", icon: Users },
      { name: "Application", path: "/application", icon: FileText },
    ],
  };

  // ✅ Fetch user role from Firestore or LocalStorage
  useEffect(() => {
    const fetchUserRole = async (uid) => {
      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setRole(userData.role);
          setLinks(navLinks[userData.role] || []);
          localStorage.setItem("userRole", userData.role);
        } else {
          console.warn("No such user found in Firestore");
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserRole(user.uid);
      } else {
        const savedRole = localStorage.getItem("userRole");
        if (savedRole) {
          // 🔹 If user already logged in before, use saved role
          setRole(savedRole);
          setLinks(navLinks[savedRole] || []);
        } else {
          setRole("");
          setLinks([]);
        }
      }
    });

    // 🔹 Extra fallback for when Firebase takes time to initialize
    const savedRole = localStorage.getItem("userRole");
    if (savedRole && !role) {
      setRole(savedRole);
      setLinks(navLinks[savedRole] || []);
    }

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userRole");
      localStorage.removeItem("userUID");
      setRole("");
      setLinks([]);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Abbas Codes LMS</span>
                  <span className="truncate text-xs">
                    {role ? (
                      `${role.toUpperCase()} Panel`
                    ) : (
                      <LoadingIndicator label="Loading role" size="small" />
                    )}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {role ? "Navigation" : <LoadingIndicator label="Loading navigation" size="small" />}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={pathname === item.path}>
                      <Link href={item.path}>
                        <Icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <LogOut />
              Sign Out
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/profile">
                <User />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
});

AdminSidebar.displayName = "AdminSidebar";
