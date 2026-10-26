"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebaseconfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Users,
  UserCheck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LoadingIndicator } from "../ui/loading-indicator";

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDate = (value) => {
  if (!value) return null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getLessonDay = (date = new Date()) =>
  date.toLocaleDateString("en-US", { weekday: "long" });

const getAttendanceEntries = (records, studentId) =>
  records.flatMap((record) => {
    if (studentId && !record.records?.[studentId]) return [];
    const students = studentId
      ? [[studentId, record.records[studentId]]]
      : Object.entries(record.records || {});
    return students
      .filter(([, student]) => ["P", "A", "L"].includes(student?.status))
      .map(([id, student]) => ({
        id,
        date: record.date,
        subject: record.subject || "Unspecified",
        status: student.status,
      }));
  });

const formatDate = (value) => {
  const date = getDate(value);
  return date
    ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Date not set";
};

const getDeadline = (assignment) =>
  getDate(assignment.deadline || assignment.lastDate);

function SectionCard({ title, description, icon: Icon, action, children }) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-semibold tracking-tight">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MetricCard({ label, value, detail, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  };
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={`rounded-xl p-2 ${tones[tone]}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function EmptyMessage({ children }) {
  return (
    <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function LessonList({ lessons }) {
  if (!lessons.length) {
    return <EmptyMessage>No classes are scheduled for today.</EmptyMessage>;
  }
  return (
    <div className="space-y-3">
      {lessons.map((lesson) => (
        <div
          key={lesson.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/50 p-4"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{lesson.courseTitle || "Class"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {lesson.className || "Class not specified"}
              {lesson.teacherName ? ` · ${lesson.teacherName}` : ""}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground">
            <Clock3 className="size-4" aria-hidden="true" />
            {lesson.startTime || "Time not set"}
            {lesson.endTime ? `–${lesson.endTime}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

function AssignmentList({ assignments }) {
  if (!assignments.length) {
    return <EmptyMessage>No assignments match these filters.</EmptyMessage>;
  }
  return (
    <div className="space-y-3">
      {assignments.map((assignment) => {
        const deadline = getDeadline(assignment);
        const overdue = deadline && deadline < new Date();
        return (
          <div
            key={assignment.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/50 p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{assignment.title || "Assignment"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {assignment.className || "Class not specified"}
                {assignment.subject ? ` · ${assignment.subject}` : ""}
                {assignment.teacherName ? ` · ${assignment.teacherName}` : ""}
              </p>
            </div>
            <span
              className={`whitespace-nowrap text-sm font-medium ${
                overdue ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {overdue ? "Past due" : `Due ${formatDate(assignment.deadline || assignment.lastDate)}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("month");
  const [subject, setSubject] = useState("all");
  const [assignmentSubject, setAssignmentSubject] = useState("all");
  const [assignmentPeriod, setAssignmentPeriod] = useState("all");

  useEffect(() => {
    let active = true;
    let unsubscribe;

    const loadDashboard = async (user) => {
      setLoading(true);
      setError("");
      const uid = user?.uid || localStorage.getItem("userUID");
      if (!uid) {
        if (active) {
          setProfile(null);
          setData(null);
          setLoading(false);
        }
        return;
      }

      try {
        const profileSnapshot = await getDoc(doc(db, "users", uid));

        if (!profileSnapshot.exists()) {
          throw new Error("Your profile could not be found. Please contact an administrator.");
        }
        const userProfile = profileSnapshot.data();
        let dashboardData = {
          users: [],
          classes: [],
          lessons: [],
          assignments: [],
          attendance: [],
          teacherAttendance: [],
        };

        if (userProfile.role === "admin") {
          const [usersSnapshot, classesSnapshot, timetableSnapshot, assignmentsSnapshot, attendanceSnapshot] =
            await Promise.all([
              getDocs(collection(db, "users")),
              getDocs(collection(db, "classes")),
              getDocs(collection(db, "timetables")),
              getDocs(collection(db, "assignments")),
              getDocs(collection(db, "attendance_teacher")),
            ]);
          dashboardData = {
            users: usersSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
            classes: classesSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
            lessons: timetableSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
            assignments: assignmentsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
            attendance: attendanceSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
          };
        } else if (userProfile.role === "student") {
          const [classesSnapshot, timetableSnapshot, assignmentsSnapshot, attendanceSnapshot] =
            await Promise.all([
              getDocs(query(collection(db, "classes"), where("className", "==", userProfile.className))),
              getDocs(query(collection(db, "timetables"), where("className", "==", userProfile.className))),
              getDocs(query(collection(db, "assignments"), where("className", "==", userProfile.className))),
              getDocs(query(collection(db, "attendance_teacher"), where("className", "==", userProfile.className))),
            ]);
          dashboardData = {
            ...dashboardData,
            classes: classesSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
            lessons: timetableSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
            assignments: assignmentsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
            attendance: attendanceSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
          };
        } else if (userProfile.role === "teacher") {
          const [timetableSnapshot, assignmentsSnapshot, attendanceSnapshot] =
            await Promise.all([
              getDocs(query(collection(db, "timetables"), where("teacherId", "==", uid))),
              getDocs(query(collection(db, "assignments"), where("teacherEmail", "==", userProfile.email))),
              getDocs(query(collection(db, "attendance_teacher"), where("teacherEmail", "==", userProfile.email))),
            ]);
          dashboardData = {
            ...dashboardData,
            lessons: timetableSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
            assignments: assignmentsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
            attendance: attendanceSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
          };
        } else {
          throw new Error("Your account does not have a recognized dashboard role.");
        }

        if (!active) return;

        setProfile({ id: profileSnapshot.id, ...profileSnapshot.data() });
        setData(dashboardData);
      } catch (loadError) {
        console.error("Unable to load dashboard data:", loadError);
        if (active) setError(loadError.message || "Dashboard data could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    };

    unsubscribe = onAuthStateChanged(auth, loadDashboard, (authError) => {
      console.error("Unable to check dashboard sign-in:", authError);
      if (active) {
        setError("Unable to verify your sign-in. Please refresh and try again.");
        setLoading(false);
      }
    });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const today = getDateKey();
  const role = profile?.role;
  const users = data?.users || [];
  const students = users.filter((user) => user.role === "student");
  const teachers = users.filter((user) => user.role === "teacher");
  const studentId = role === "student" ? profile?.id : null;

  const ownLessons = useMemo(() => {
    if (!data || !profile) return [];
    let lessons = data.lessons;
    if (role === "student") {
      const classIds = new Set(
        data.classes.filter((item) => item.className === profile.className).map((item) => item.id),
      );
      lessons = lessons.filter(
        (item) => item.className === profile.className || classIds.has(item.classId),
      );
    } else if (role === "teacher") {
      lessons = lessons.filter(
        (item) => item.teacherId === profile.id || item.teacherName === profile.name,
      );
    }
    return lessons
      .filter((item) => item.day === getLessonDay())
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  }, [data, profile, role]);

  const ownAssignments = useMemo(() => {
    if (!data || !profile) return [];
    let assignments = data.assignments;
    if (role === "student") {
      assignments = assignments.filter((item) => item.className === profile.className);
    } else if (role === "teacher") {
      assignments = assignments.filter((item) => item.teacherEmail === profile.email);
    }
    return assignments.sort((a, b) => {
      const aTime = getDeadline(a)?.getTime() || Number.MAX_SAFE_INTEGER;
      const bTime = getDeadline(b)?.getTime() || Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
  }, [data, profile, role]);

  const attendanceEntries = useMemo(
    () => getAttendanceEntries(data?.attendance || [], studentId),
    [data, studentId],
  );
  const attendanceSubjects = useMemo(
    () => [...new Set(attendanceEntries.map((entry) => entry.subject))].sort(),
    [attendanceEntries],
  );

  const filteredAttendance = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (period === "week") {
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    } else if (period === "month") {
      start.setDate(1);
      start.setMonth(now.getMonth() - 5);
      start.setHours(0, 0, 0, 0);
    } else {
      start.setFullYear(2000, 0, 1);
    }
    return attendanceEntries.filter((entry) => {
      const entryDate = getDate(entry.date);
      return (
        entryDate &&
        entryDate >= start &&
        entryDate <= now &&
        (subject === "all" || entry.subject === subject)
      );
    });
  }, [attendanceEntries, period, subject]);

  const attendanceSummary = useMemo(() => {
    const present = filteredAttendance.filter((entry) => entry.status === "P").length;
    const absent = filteredAttendance.filter((entry) => entry.status === "A").length;
    const leave = filteredAttendance.filter((entry) => entry.status === "L").length;
    const total = present + absent + leave;
    return { present, absent, leave, total, percentage: total ? Math.round((present / total) * 100) : 0 };
  }, [filteredAttendance]);

  const attendanceChart = useMemo(() => {
    const now = new Date();
    const buckets = period === "month" ? 6 : period === "week" ? 7 : 6;
    return Array.from({ length: buckets }, (_, index) => {
      const date = new Date(now);
      if (period === "week") {
        date.setDate(now.getDate() - (buckets - index - 1));
      } else {
        date.setDate(1);
        date.setMonth(now.getMonth() - (buckets - index - 1));
      }
      const key = period === "week" ? getDateKey(date) : `${date.getFullYear()}-${date.getMonth()}`;
      const entries = filteredAttendance.filter((entry) => {
        const entryDate = getDate(entry.date);
        if (!entryDate) return false;
        return period === "week"
          ? getDateKey(entryDate) === key
          : `${entryDate.getFullYear()}-${entryDate.getMonth()}` === key;
      });
      const present = entries.filter((entry) => entry.status === "P").length;
      const total = entries.length;
      return {
        label: period === "week"
          ? date.toLocaleDateString("en-US", { weekday: "short" })
          : date.toLocaleDateString("en-US", { month: "short" }),
        attendance: total ? Math.round((present / total) * 100) : 0,
      };
    });
  }, [filteredAttendance, period]);

  const assignmentSubjects = useMemo(
    () => [...new Set(ownAssignments.map((item) => item.subject).filter(Boolean))].sort(),
    [ownAssignments],
  );
  const filteredAssignments = useMemo(() => {
    const now = new Date();
    return ownAssignments.filter((assignment) => {
      const deadline = getDeadline(assignment);
      const matchesSubject =
        assignmentSubject === "all" || assignment.subject === assignmentSubject;
      const matchesPeriod =
        assignmentPeriod === "all" ||
        (assignmentPeriod === "upcoming" && deadline && deadline >= now) ||
        (assignmentPeriod === "overdue" && deadline && deadline < now);
      return matchesSubject && matchesPeriod;
    });
  }, [ownAssignments, assignmentSubject, assignmentPeriod]);

  const isLoading = loading;
  if (isLoading) {
    return <LoadingIndicator label="Loading your dashboard..." fullScreen />;
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <p className="font-semibold">Dashboard unavailable</p>
            <p className="mt-1 text-muted-foreground">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <GraduationCap className="mx-auto size-9 text-primary" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-semibold">Sign in to view your dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your classes, attendance, and assignments will appear here.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Sign in <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </main>
    );
  }

  const todaysAttendance = (data?.attendance || []).filter((entry) => entry.date === today);
  const todaysStudentStatuses = todaysAttendance.flatMap((entry) =>
    Object.values(entry.records || {}).map((record) => record?.status),
  );
  const studentsMarkedToday = todaysStudentStatuses.filter((status) =>
    ["P", "A", "L"].includes(status),
  );
  const teacherAttendanceToday = (data?.teacherAttendance || []).filter(
    (entry) => entry.date === today,
  );
  const teacherPresentToday = teacherAttendanceToday.filter(
    (entry) => entry.status === "P" || entry.status === "present",
  ).length;
  const teacherAbsentToday = teacherAttendanceToday.filter(
    (entry) => entry.status === "A" || entry.status === "absent",
  ).length;
  const greetingName = profile.name || profile.fullName || profile.email || "there";
  const heading = role === "admin" ? "Institute overview" : role === "teacher" ? "Teaching overview" : "Student overview";

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {heading}
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome, {greetingName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {profile.className ? ` · ${profile.className}` : ""}
          </p>
        </div>
        <span className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium capitalize text-muted-foreground">
          {role || "Member"} account
        </span>
      </div>

      {role === "student" && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Overall attendance" value={`${attendanceSummary.percentage}%`} detail={`${attendanceSummary.present} present out of ${attendanceSummary.total} marked`} icon={Activity} />
            <MetricCard label="Present classes" value={attendanceSummary.present} detail="For the selected attendance period" icon={CheckCircle2} tone="green" />
            <MetricCard label="Assignments" value={ownAssignments.length} detail="Posted for your class" icon={FileText} tone="violet" />
            <MetricCard label="Classes today" value={ownLessons.length} detail="Your class timetable for today" icon={CalendarDays} tone="amber" />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <SectionCard
              title="Attendance overview"
              description="Explore your actual marked attendance by period and subject."
              icon={ClipboardCheck}
              action={
                <div className="flex flex-wrap gap-2">
                  <select aria-label="Attendance period" className="h-9 rounded-lg border bg-background px-2 text-sm" value={period} onChange={(event) => setPeriod(event.target.value)}>
                    <option value="all">Overall</option>
                    <option value="week">Last 7 days</option>
                    <option value="month">Last 6 months</option>
                  </select>
                  <select aria-label="Attendance subject" className="h-9 max-w-40 rounded-lg border bg-background px-2 text-sm" value={subject} onChange={(event) => setSubject(event.target.value)}>
                    <option value="all">All subjects</option>
                    {attendanceSubjects.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
              }
            >
              {filteredAttendance.length ? (
                <>
                  <div className="mb-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-emerald-500/10 p-3"><p className="text-lg font-bold text-emerald-600">{attendanceSummary.present}</p><p className="text-xs text-muted-foreground">Present</p></div>
                    <div className="rounded-xl bg-destructive/10 p-3"><p className="text-lg font-bold text-destructive">{attendanceSummary.absent}</p><p className="text-xs text-muted-foreground">Absent</p></div>
                    <div className="rounded-xl bg-amber-500/10 p-3"><p className="text-lg font-bold text-amber-600">{attendanceSummary.leave}</p><p className="text-xs text-muted-foreground">Leave</p></div>
                  </div>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceChart} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                        <Tooltip formatter={(value) => [`${value}%`, "Attendance"]} contentStyle={{ background: "var(--popover)", borderColor: "var(--border)", borderRadius: 10 }} />
                        <Bar dataKey="attendance" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <EmptyMessage>No attendance has been recorded for these filters yet.</EmptyMessage>
              )}
            </SectionCard>

            <SectionCard title="Today&apos;s classes" description="Classes and teachers scheduled for your class today." icon={CalendarDays}>
              <LessonList lessons={ownLessons} />
            </SectionCard>
          </div>

          <SectionCard
            title="Assignments"
            description="Assignments posted to your class, ordered by due date."
            icon={BookOpen}
            action={
              <div className="flex flex-wrap gap-2">
                <select aria-label="Assignment status" className="h-9 rounded-lg border bg-background px-2 text-sm" value={assignmentPeriod} onChange={(event) => setAssignmentPeriod(event.target.value)}>
                  <option value="all">All assignments</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="overdue">Past due</option>
                </select>
                <select aria-label="Assignment subject" className="h-9 max-w-40 rounded-lg border bg-background px-2 text-sm" value={assignmentSubject} onChange={(event) => setAssignmentSubject(event.target.value)}>
                  <option value="all">All subjects</option>
                  {assignmentSubjects.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
            }
          >
            <AssignmentList assignments={filteredAssignments.slice(0, 8)} />
          </SectionCard>
        </>
      )}

      {role === "teacher" && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Classes today" value={ownLessons.length} detail="Lessons on your timetable today" icon={CalendarDays} />
            <MetricCard label="Your assignments" value={ownAssignments.length} detail="Assignments created by you" icon={FileText} tone="violet" />
            <MetricCard label="Student attendance records" value={attendanceEntries.length} detail="Attendance marked by you" icon={ClipboardCheck} tone="green" />
            <MetricCard label="Assigned classes" value={(profile.classes || []).length} detail="Classes linked to your account" icon={Users} tone="amber" />
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <SectionCard title="Today&apos;s classes" description="Your scheduled lessons, with class and time." icon={CalendarDays}>
              <LessonList lessons={ownLessons} />
            </SectionCard>
            <SectionCard title="Your assignments" description="The next due assignments you have posted." icon={BookOpen}>
              <AssignmentList assignments={ownAssignments.slice(0, 6)} />
            </SectionCard>
          </div>
          <SectionCard title="Attendance snapshot" description="Counts from your recorded attendance, not sample data." icon={ClipboardCheck}>
            {attendanceEntries.length ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MetricCard label="Present" value={attendanceEntries.filter((entry) => entry.status === "P").length} detail="Recorded student entries" icon={CheckCircle2} tone="green" />
                <MetricCard label="Absent" value={attendanceEntries.filter((entry) => entry.status === "A").length} detail="Recorded student entries" icon={AlertCircle} tone="amber" />
                <MetricCard label="Leave" value={attendanceEntries.filter((entry) => entry.status === "L").length} detail="Recorded student entries" icon={UserCheck} tone="violet" />
              </div>
            ) : <EmptyMessage>No student attendance has been recorded under your account.</EmptyMessage>}
          </SectionCard>
        </>
      )}

      {role === "admin" && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Students" value={students.length} detail="Student accounts in the portal" icon={GraduationCap} />
            <MetricCard label="Teachers" value={teachers.length} detail="Teacher accounts in the portal" icon={Users} tone="violet" />
            <MetricCard label="Present today" value={studentsMarkedToday.filter((status) => status === "P").length} detail={`${studentsMarkedToday.length} student attendance entries recorded`} icon={CheckCircle2} tone="green" />
            <MetricCard label="Absent today" value={studentsMarkedToday.filter((status) => status === "A").length} detail={`${studentsMarkedToday.filter((status) => status === "L").length} on leave`} icon={AlertCircle} tone="amber" />
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <SectionCard title="Today&apos;s student attendance" description="Live totals from attendance records for today." icon={ClipboardCheck}>
              {studentsMarkedToday.length ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <MetricCard label="Present" value={studentsMarkedToday.filter((status) => status === "P").length} detail="Students marked present" icon={CheckCircle2} tone="green" />
                  <MetricCard label="Absent" value={studentsMarkedToday.filter((status) => status === "A").length} detail="Students marked absent" icon={AlertCircle} tone="amber" />
                  <MetricCard label="On leave" value={studentsMarkedToday.filter((status) => status === "L").length} detail="Students marked on leave" icon={UserCheck} tone="violet" />
                </div>
              ) : <EmptyMessage>No student attendance has been submitted today.</EmptyMessage>}
            </SectionCard>
            <SectionCard title="Today&apos;s teacher attendance" description="Teacher attendance entries recorded for today." icon={UserCheck}>
              {teacherAttendanceToday.length ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <MetricCard label="Present" value={teacherPresentToday} detail={`Of ${teacherAttendanceToday.length} recorded teachers`} icon={CheckCircle2} tone="green" />
                  <MetricCard label="Absent" value={teacherAbsentToday} detail="Teacher records marked absent" icon={AlertCircle} tone="amber" />
                </div>
              ) : (
                <EmptyMessage>
                  Teacher attendance is not currently tracked by a portal workflow, so there are no daily records to report.
                </EmptyMessage>
              )}
            </SectionCard>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <SectionCard title="Today&apos;s schedule" description="All classes and teachers scheduled for today." icon={CalendarDays}>
              <LessonList lessons={(data?.lessons || []).filter((lesson) => lesson.day === getLessonDay()).sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))} />
            </SectionCard>
            <SectionCard title="Institute at a glance" description="Current academic activity." icon={Activity}>
              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Classes" value={data?.classes.length || 0} detail="Configured classes" icon={Users} />
                <MetricCard label="Assignments" value={data?.assignments.length || 0} detail="All posted assignments" icon={FileText} tone="violet" />
                <MetricCard label="Attendance records today" value={todaysAttendance.length} detail="Class and subject registers submitted" icon={ClipboardCheck} tone="green" />
                <MetricCard label="Scheduled lessons today" value={(data?.lessons || []).filter((lesson) => lesson.day === getLessonDay()).length} detail="Across the institute" icon={CalendarDays} tone="amber" />
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </main>
  );
}
