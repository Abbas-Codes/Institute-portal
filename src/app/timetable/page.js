"use client";
import { useEffect, useState } from "react";
import { db } from "../../../firebaseconfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import TimetableForm from "./timetableform";
import TimetableTable from "./table";
import ClassSelect from "../components/selectclass/classSelect";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import "./AdminTimetablePage.css";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { CalendarDays, Plus } from "lucide-react";

export default function AdminTimetablePage() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  // 🔹 Fetch Classes
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "classes"), (snap) => {
      setClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // 🔹 Fetch Teachers (role === teacher)
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "teacher"));
    const unsub = onSnapshot(q, (snap) => {
      setTeachers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // 🔹 Fetch Timetable for selected class
  useEffect(() => {
    if (!selectedClass) return setTimetable([]);
    const q = query(
      collection(db, "timetables"),
      where("classId", "==", selectedClass)
    );
    const unsub = onSnapshot(q, (snap) => {
      setTimetable(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [selectedClass]);

  return (
    <main className="portal-page timetable-page">
      <div className="portal-page-heading">
        <div>
          <p className="portal-eyebrow">Academic planning</p>
          <h1>Timetable</h1>
          <p>Manage class schedules and keep weekly lessons organized.</p>
        </div>
        <Dialog className="Create-class-btn">
          <DialogTrigger asChild>
            <Button className="create-class-btn">
              <Plus aria-hidden="true" />
              Add timetable entry
            </Button>
          </DialogTrigger>
          <DialogContent className="form-dialog">
            <DialogHeader className="form-dialog-header" >
              <Card className="form-dialog-card">
                <CardHeader>
                  <CardTitle className="form-title" >Add Timetable Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <TimetableForm
                    teachers={teachers}
                    selectedClass={selectedClass}
                  />
                </CardContent>
              </Card>
            </DialogHeader>

            <DialogFooter>
              <DialogClose asChild></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <section className="timetable-toolbar" aria-label="Timetable filters">
        <div className="timetable-filter-copy">
          <CalendarDays aria-hidden="true" />
          <div>
            <h2>Weekly schedule</h2>
            <p>Choose a class to view its schedule.</p>
          </div>
        </div>
        <ClassSelect
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          triggerClass="table-trigger"
          contentClass="table-content"
          itemClass="table-item"
        />
      </section>

      {selectedClass && timetable.length > 0 ? (
        <TimetableTable
          timetable={timetable}
          selectedClass={selectedClass}
          classes={classes}
        />
      ) : selectedClass ? (
        <div className="timetable-empty">
          <CalendarDays aria-hidden="true" />
          <h2>No timetable yet</h2>
          <p>Add the first lesson to build this class&apos;s weekly schedule.</p>
        </div>
      ) : (
        <div className="timetable-empty">
          <CalendarDays aria-hidden="true" />
          <h2>Select a class</h2>
          <p>Choose a class above to view its weekly schedule.</p>
        </div>
      )}
    </main>
  );
}
