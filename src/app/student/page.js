"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import {
  BookOpen,
  CalendarDays,
  Clock3,
  GraduationCap,
  UserRound,
} from "lucide-react";
import { auth, db } from "../../../firebaseconfig";
import { LoadingIndicator } from "../../components/ui/loading-indicator";

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatTime(value) {
  if (!value) return "";

  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;

  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

export default function StudentPage() {
  const [timetable, setTimetable] = useState([]);
  const [className, setClassName] = useState("");
  const [activeDay, setActiveDay] = useState("Monday");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = new Date().getDay();
    setActiveDay(weekdays[today >= 1 && today <= 6 ? today - 1 : 0]);

    let isActive = true;
    let requestId = 0;
    let unsubscribeTimetable;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      const currentRequestId = ++requestId;
      unsubscribeTimetable?.();
      unsubscribeTimetable = undefined;
      setTimetable([]);
      setClassName("");
      setError("");

      if (!user) {
        setError("Sign in to view your class timetable.");
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const userSnapshot = await getDoc(doc(db, "users", user.uid));
        if (!isActive || currentRequestId !== requestId) return;

        if (!userSnapshot.exists()) {
          setError("We couldn't find your student profile.");
          setLoading(false);
          return;
        }

        const studentClassName = userSnapshot.data().className;
        if (!studentClassName) {
          setError(
            "Your profile isn't linked to a class yet. Please contact your administrator."
          );
          setLoading(false);
          return;
        }

        setClassName(studentClassName);
        const timetableQuery = query(
          collection(db, "timetables"),
          where("className", "==", studentClassName)
        );

        unsubscribeTimetable = onSnapshot(
          timetableQuery,
          (snapshot) => {
            if (!isActive || currentRequestId !== requestId) return;
            setTimetable(
              snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
            );
            setLoading(false);
          },
          (snapshotError) => {
            console.error("Error loading student timetable:", snapshotError);
            if (!isActive || currentRequestId !== requestId) return;
            setError("We couldn't load your timetable. Please try again later.");
            setLoading(false);
          }
        );
      } catch (profileError) {
        console.error("Error loading student profile:", profileError);
        if (!isActive || currentRequestId !== requestId) return;
        setError("We couldn't load your student profile. Please try again later.");
        setLoading(false);
      }
    });

    return () => {
      isActive = false;
      unsubscribeAuth();
      unsubscribeTimetable?.();
    };
  }, []);

  const dayEntries = timetable
    .filter((entry) => entry.day === activeDay)
    .sort((first, second) =>
      (first.startTime || "").localeCompare(second.startTime || "")
    );
  const activeDays = weekdays.filter((day) =>
    timetable.some((entry) => entry.day === day)
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto w-full max-w-6xl space-y-7">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-700">
              <CalendarDays aria-hidden="true" className="size-4" />
              Student portal
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              My timetable
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Plan your week and see what class is coming up each day.
            </p>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <GraduationCap aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Your class
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {className || (
                  loading ? (
                    <LoadingIndicator label="Loading class" size="small" />
                  ) : (
                    "Not assigned"
                  )
                )}
              </p>
            </div>
          </div>
        </header>

        <section aria-label="Weekly timetable summary" className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <BookOpen aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-sm text-slate-600">Classes this week</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-950">
                {loading ? (
                  <LoadingIndicator label="" size="small" />
                ) : (
                  timetable.length
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CalendarDays aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-sm text-slate-600">Days with classes</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-950">
                {loading ? (
                  <LoadingIndicator label="" size="small" />
                ) : (
                  activeDays
                )}
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="schedule-heading"
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-1">
              <h2 id="schedule-heading" className="text-lg font-semibold text-slate-950">
                Weekly schedule
              </h2>
              <p className="text-sm text-slate-500">
                Select a day to view your classes and times.
              </p>
            </div>

            <nav
              aria-label="Days of the week"
              className="mt-5 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
            >
              {weekdays.map((day) => {
                const count = timetable.filter((entry) => entry.day === day).length;
                const isSelected = day === activeDay;

                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setActiveDay(day)}
                    className={`flex min-w-[92px] flex-1 flex-col items-center gap-1 rounded-xl border px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-600 font-semibold text-white shadow-sm"
                        : "border-slate-200 bg-white font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                    }`}
                  >
                    <span>{day.slice(0, 3)}</span>
                    <span
                      className={`text-xs ${
                        isSelected ? "text-indigo-100" : "text-slate-500"
                      }`}
                    >
                      {loading ? (
                        <LoadingIndicator label="" size="small" />
                      ) : (
                        `${count} ${count === 1 ? "class" : "classes"}`
                      )}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-5 sm:p-7">
            {loading ? (
              <LoadingIndicator label="Loading timetable" />
            ) : error ? (
              <div
                role="status"
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-5 text-sm leading-6 text-amber-900"
              >
                {error}
              </div>
            ) : dayEntries.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                  <CalendarDays aria-hidden="true" className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">No classes on {activeDay}</h3>
                <p className="mt-1 max-w-sm text-sm leading-6 text-slate-600">
                  {timetable.length
                    ? "Enjoy the extra time. Choose another day to see your schedule."
                    : "Your class schedule hasn't been added yet. Check back later or contact your administrator."}
                </p>
              </div>
            ) : (
              <ol className="space-y-3">
                {dayEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm sm:grid-cols-[150px_1fr] sm:items-center sm:p-5"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold tabular-nums text-indigo-700 sm:flex-col sm:items-start sm:gap-1">
                      <Clock3 aria-hidden="true" className="size-4 shrink-0" />
                      <span>
                        {formatTime(entry.startTime)} – {formatTime(entry.endTime)}
                      </span>
                    </div>
                    <div className="min-w-0 border-t border-slate-100 pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                      <h3 className="truncate font-semibold text-slate-950">
                        {entry.courseTitle || "Class"}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                        {entry.teacherName && (
                          <span className="inline-flex items-center gap-1.5">
                            <UserRound aria-hidden="true" className="size-4 text-slate-400" />
                            {entry.teacherName}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <GraduationCap aria-hidden="true" className="size-4 text-slate-400" />
                          {className}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
