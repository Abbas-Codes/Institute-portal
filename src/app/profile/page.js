"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { auth, db } from "../../../firebaseconfig";
import { LoadingIndicator } from "../../components/ui/loading-indicator";
import "./profile.css";

const displayValue = (value) => {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Not provided";
  if (value === null || value === undefined || value === "") return "Not provided";
  return String(value);
};

const ProfileField = ({ icon: Icon, label, value }) => (
  <div className="profile-field">
    <span className="profile-field-icon"><Icon size={17} aria-hidden="true" /></span>
    <div>
      <p>{label}</p>
      <strong>{displayValue(value)}</strong>
    </div>
  </div>
);

const ProfilePage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [classSubjects, setClassSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const uid = user?.uid || window.localStorage.getItem("userUID");
      if (!uid) {
        router.replace("/login");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const userSnapshot = await getDoc(doc(db, "users", uid));
        if (!userSnapshot.exists()) {
          throw new Error("Your profile record could not be found. Please contact your administrator.");
        }

        const userData = userSnapshot.data();
        let subjects = [];
        if (userData.className) {
          const classSnapshot = await getDocs(
            query(collection(db, "classes"), where("className", "==", userData.className))
          );
          subjects = classSnapshot.docs.flatMap((classDoc) => {
            const classSubjectsData = classDoc.data().subjects;
            return Array.isArray(classSubjectsData) ? classSubjectsData : [];
          });
        }

        if (isCurrent) {
          setProfile({ ...userData, uid });
          setClassSubjects(subjects);
        }
      } catch (fetchError) {
        console.error("Error loading profile:", fetchError);
        if (isCurrent) setError(fetchError.message || "Unable to load your profile.");
      } finally {
        if (isCurrent) setLoading(false);
      }
    });

    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, [router]);

  const role = (profile?.role || "user").toLowerCase();
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const storedSubjects = Array.isArray(profile?.subjects)
    ? profile.subjects
    : typeof profile?.subjects === "string"
      ? profile.subjects.split(",").map((subject) => subject.trim()).filter(Boolean)
      : [];
  const subjects = storedSubjects.length ? storedSubjects : classSubjects;

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Choose an image smaller than 5 MB.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "portal");
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dmndspodq/image/upload",
        { method: "POST", body: formData }
      );
      const result = await response.json();
      if (!response.ok || !result.secure_url) {
        throw new Error(result.error?.message || "Photo upload failed.");
      }

      await updateDoc(doc(db, "users", profile.uid), { photoURL: result.secure_url });
      setProfile((current) => ({ ...current, photoURL: result.secure_url }));
    } catch (uploadError) {
      console.error("Error uploading profile photo:", uploadError);
      setError(uploadError.message || "Photo upload failed. Please try again.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.localStorage.removeItem("userUID");
      window.localStorage.removeItem("userRole");
      router.replace("/login");
    } catch (signOutError) {
      console.error("Error signing out:", signOutError);
      setError("Unable to sign out. Please try again.");
    }
  };

  if (loading) return <LoadingIndicator label="Loading profile" fullScreen />;

  if (error && !profile) {
    return (
      <main className="profile-page">
        <div className="profile-error" role="alert">{error}</div>
      </main>
    );
  }

  if (!profile) return null;

  const previousResult =
    profile.previousResult || profile.previousGPA || profile.previousPercentage || profile.gpa;
  const suggestion = role === "student"
    ? previousResult
      ? "Keep building on your previous result: review your class subjects each week and ask your teacher for feedback on difficult topics."
      : "Your previous result has not been added yet. Ask your administrator to update your academic record so you can track your progress."
    : role === "teacher"
      ? subjects.length
        ? "Keep your subject list and teaching schedule up to date so students can find the right academic support."
        : "Add your assigned subjects to your profile so students and administrators can quickly see your teaching areas."
      : role === "admin"
        ? "Review user contact details and role assignments regularly to keep institute records accurate."
        : "Keep your contact information current so your institute can reach you when needed.";

  return (
    <main className="profile-page">
      <header className="profile-heading">
        <div>
          <p className="profile-eyebrow">ACCOUNT</p>
          <h1>My profile</h1>
          <p className="profile-subtitle">Your personal details and {role === "student" ? "academic" : role === "teacher" ? "teaching" : "account"} information.</p>
        </div>
        <button className="profile-signout" type="button" onClick={handleSignOut}>
          Sign out <ArrowRight size={16} aria-hidden="true" />
        </button>
      </header>

      {error && <div className="profile-error" role="alert">{error}</div>}

      <section className="profile-hero">
        <div className="profile-avatar-wrap">
          {profile.photoURL ? (
            <img className="profile-avatar" src={profile.photoURL} alt={`${profile.name || "User"} profile`} />
          ) : (
            <div className="profile-avatar profile-avatar-placeholder" aria-hidden="true">
              {(profile.name || profile.email || "U").trim().charAt(0).toUpperCase()}
            </div>
          )}
          <label className="profile-photo-action">
            {uploading ? "Uploading..." : "Update photo"}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
          </label>
        </div>
        <div className="profile-identity">
          <span className={`profile-role-badge profile-role-${role}`}>
            <ShieldCheck size={14} aria-hidden="true" /> {roleLabel}
          </span>
          <h2>{displayValue(profile.name)}</h2>
          <p>{displayValue(profile.email)}</p>
          <span className="profile-uid">User ID: {profile.uid}</span>
        </div>
      </section>

      <div className="profile-content-grid">
        <section className="profile-card">
          <div className="profile-card-heading">
            <span className="profile-section-icon"><UserRound size={18} aria-hidden="true" /></span>
            <div><h3>Personal information</h3><p>Contact and account details</p></div>
          </div>
          <div className="profile-fields">
            <ProfileField icon={Mail} label="Email address" value={profile.email} />
            <ProfileField icon={Phone} label="Phone" value={profile.phone} />
            <ProfileField icon={MapPin} label="Address" value={profile.address} />
            <ProfileField icon={ShieldCheck} label="CNIC" value={profile.cnic} />
            <ProfileField icon={CalendarDays} label="Member since" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : null} />
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-card-heading">
            <span className="profile-section-icon"><GraduationCap size={18} aria-hidden="true" /></span>
            <div>
              <h3>{role === "student" ? "Academic information" : role === "teacher" ? "Teaching information" : "Role information"}</h3>
              <p>Details associated with your {role} account</p>
            </div>
          </div>
          <div className="profile-fields">
            {role === "student" && (
              <>
                <ProfileField icon={BookOpen} label="Class / Program" value={profile.className} />
                <ProfileField icon={UserRound} label="Student ID" value={profile.studentId} />
                <ProfileField icon={GraduationCap} label="Previous discipline" value={profile.previousDiscipline || profile.discipline} />
                <ProfileField icon={CalendarDays} label="Shift" value={profile.shift} />
                <ProfileField icon={CalendarDays} label="Semester" value={profile.semester} />
                <ProfileField icon={BookOpen} label="Subjects" value={subjects} />
                <ProfileField icon={GraduationCap} label="Previous result" value={previousResult} />
              </>
            )}
            {role === "teacher" && (
              <>
                <ProfileField icon={BriefcaseBusiness} label="Department" value={profile.department} />
                <ProfileField icon={UserRound} label="Teacher ID" value={profile.teacherId} />
                <ProfileField icon={BookOpen} label="Subjects" value={subjects} />
                <ProfileField icon={CalendarDays} label="Assigned class" value={profile.className || profile.assignedClass} />
                <ProfileField icon={CalendarDays} label="Shift" value={profile.shift} />
                <ProfileField icon={BriefcaseBusiness} label="Experience" value={profile.experience ? `${profile.experience} years` : null} />
              </>
            )}
            {role === "admin" && (
              <>
                <ProfileField icon={ShieldCheck} label="Role" value={roleLabel} />
                <ProfileField icon={BriefcaseBusiness} label="Department" value={profile.department} />
                <ProfileField icon={UserRound} label="Admin ID" value={profile.adminId} />
                <ProfileField icon={CalendarDays} label="Account status" value={profile.active === false || profile.activity === "stuckoff" ? "Inactive" : "Active"} />
              </>
            )}
            {!["student", "teacher", "admin"].includes(role) && (
              <ProfileField icon={ShieldCheck} label="Role" value={roleLabel} />
            )}
          </div>
        </section>

        <section className="profile-suggestion">
          <div className="profile-suggestion-icon"><BookOpen size={19} aria-hidden="true" /></div>
          <div>
            <span>PROFILE TIP</span>
            <h3>A suggestion for you</h3>
            <p>{suggestion}</p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;
