"use client";

import { useState } from "react";
import {
  Activity,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  User,
  Users,
  Wallet,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    description: "A high-level view of institute activity.",
    stats: [["Students", "248"], ["Teachers", "18"], ["Classes", "12"], ["Attendance today", "92%"]],
    columns: ["Activity", "Status", "Updated"],
    rows: [
      ["Morning attendance", "Complete", "Today"],
      ["Assignment review", "In progress", "Today"],
      ["Fee overview", "Ready", "Yesterday"],
    ],
  },
  {
    name: "Timetable",
    icon: CalendarDays,
    description: "Browse a sample weekly class schedule.",
    columns: ["Day", "Class", "Subject", "Time"],
    rows: [
      ["Monday", "BSCS - 4", "Web Engineering", "09:00 AM"],
      ["Tuesday", "BSIT - 2", "Database Systems", "11:00 AM"],
      ["Wednesday", "BSCS - 6", "Software Design", "01:00 PM"],
    ],
  },
  {
    name: "Create Class",
    icon: Users,
    description: "Preview the class setup form and sample classes.",
    fields: ["Class name", "Subjects"],
    columns: ["Class", "Subjects", "Status"],
    rows: [
      ["BSCS - 4", "Web Engineering, Networks", "Active"],
      ["BSIT - 2", "Database Systems, Programming", "Active"],
    ],
  },
  {
    name: "Create User",
    icon: User,
    description: "Preview the user onboarding form. No accounts can be created here.",
    fields: ["Full name", "Email address", "Role"],
    columns: ["Example", "Role", "Status"],
    rows: [
      ["Ayesha Khan", "Student", "Sample only"],
      ["Bilal Ahmed", "Teacher", "Sample only"],
    ],
  },
  {
    name: "Attendance",
    icon: ClipboardCheck,
    description: "Review sample class attendance records.",
    columns: ["Student", "Class", "Attendance", "Date"],
    rows: [
      ["Ayesha Khan", "BSCS - 4", "Present", "Today"],
      ["Bilal Ahmed", "BSIT - 2", "Late", "Today"],
      ["Sara Noor", "BSCS - 4", "Present", "Today"],
    ],
  },
  {
    name: "Assignments",
    icon: FileText,
    description: "Browse example assignments and their deadlines.",
    columns: ["Assignment", "Class", "Deadline", "Status"],
    rows: [
      ["Responsive website", "BSCS - 4", "Nov 08", "Open"],
      ["SQL practice", "BSIT - 2", "Nov 12", "Open"],
      ["Design patterns", "BSCS - 6", "Nov 15", "Draft"],
    ],
  },
  {
    name: "Fee",
    icon: Wallet,
    description: "View sample fee summaries and payment activity.",
    stats: [["Total fees", "Rs. 50,000"], ["Paid", "Rs. 34,500"], ["Remaining", "Rs. 15,500"]],
    columns: ["Month", "Paid", "Status"],
    rows: [
      ["September", "Rs. 4,500", "Paid"],
      ["October", "Rs. 5,000", "Paid"],
      ["November", "Rs. 0", "Pending"],
    ],
  },
  {
    name: "Student Attendance",
    icon: GraduationCap,
    description: "See a sample student attendance summary.",
    columns: ["Student", "Present", "Absent", "Rate"],
    rows: [
      ["Ayesha Khan", "18", "2", "90%"],
      ["Bilal Ahmed", "19", "1", "95%"],
      ["Sara Noor", "17", "3", "85%"],
    ],
  },
  {
    name: "Application",
    icon: BookOpen,
    description: "Preview example student applications.",
    columns: ["Applicant", "Program", "Submitted", "Status"],
    rows: [
      ["Hina Malik", "BSCS", "Oct 20", "Under review"],
      ["Usman Ali", "BSIT", "Oct 22", "Received"],
    ],
  },
  {
    name: "Members",
    icon: BriefcaseBusiness,
    description: "Browse fictional members. No real user records are shown.",
    columns: ["Name", "Email", "Role", "Status"],
    rows: [
      ["Ayesha Khan", "ayesha@example.test", "Student", "Active"],
      ["Bilal Ahmed", "bilal@example.test", "Teacher", "Active"],
      ["Sara Noor", "sara@example.test", "Student", "Active"],
    ],
  },
  {
    name: "Profile",
    icon: User,
    description: "A sample administrator profile screen.",
    fields: ["Name", "Email address", "Role"],
  },
];

function PreviewTable({ columns, rows }) {
  if (!rows) return null;

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-muted/70 text-muted-foreground">
          <tr>
            {columns.map((column) => (
              <th className="px-4 py-3 font-medium" key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-t" key={row[0]}>
              {row.map((cell, index) => (
                <td className="px-4 py-3" key={`${row[0]}-${index}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DemoPortal() {
  const [selectedName, setSelectedName] = useState("Dashboard");
  const selected = navigation.find((item) => item.name === selectedName) || navigation[0];
  const SelectedIcon = selected.icon;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-5 py-4 sm:px-8">
        <div>
          <p className="font-semibold">Abbas Codes LMS</p>
          <p className="text-xs text-muted-foreground">Public feature preview</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Read-only demo
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 p-4 sm:p-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label="Demo navigation" className="h-fit rounded-2xl border bg-card p-3 lg:sticky lg:top-6">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Admin navigation preview
          </p>
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = item.name === selected.name;
              return (
                <li key={item.name}>
                  <button
                    aria-current={active ? "page" : undefined}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedName(item.name)}
                    type="button"
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span>{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <section className="min-w-0 space-y-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            This preview uses fictional sample data only. It is not connected to Firebase, and changes cannot be saved.
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <SelectedIcon className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{selected.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{selected.description}</p>
            </div>
          </div>

          {selected.stats && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {selected.stats.map(([label, value]) => (
                <div className="rounded-2xl border bg-card p-5" key={label}>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-2 text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
          )}

          {selected.fields && (
            <div className="rounded-2xl border bg-card p-5 sm:p-6">
              <h2 className="mb-4 font-semibold">Form preview</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {selected.fields.map((field) => (
                  <label className="space-y-2 text-sm" key={field}>
                    <span className="font-medium">{field}</span>
                    <input
                      aria-label={field}
                      className="w-full rounded-lg border bg-muted/40 px-3 py-2.5 text-muted-foreground"
                      disabled
                      placeholder={`${field} preview`}
                    />
                  </label>
                ))}
              </div>
              <button
                className="mt-4 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground"
                disabled
                type="button"
              >
                <Activity className="mr-2 inline size-4" aria-hidden="true" />
                Demo actions are disabled
              </button>
            </div>
          )}

          {selected.rows && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
                <h2 className="font-semibold">Sample records</h2>
              </div>
              <PreviewTable columns={selected.columns} rows={selected.rows} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
