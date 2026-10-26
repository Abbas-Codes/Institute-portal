"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { ArrowLeft, Mail, RotateCcw } from "lucide-react";
import { auth } from "../../../firebaseconfig";
import { Alert } from "../../components/ui/alert";
import { LoadingIndicator } from "../../components/ui/loading-indicator";
import "../login/login.css";
import "./reset.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSent(false);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (resetError) {
      console.error("Error sending password reset email:", resetError);
      setError(
        resetError.code === "auth/user-not-found"
          ? "No account was found with that email address."
          : resetError.code === "auth/invalid-email"
            ? "Enter a valid email address."
            : resetError.message || "Could not send the reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-body reset-body">
      <div className="login-sheet" />
      <section className="login reset-card">
        <div className="reset-icon"><RotateCcw size={22} aria-hidden="true" /></div>
        <h1>Forgot your password?</h1>
        <p className="reset-description">
          Enter the email address linked to your account. We will send you a password reset link.
        </p>

        {sent ? (
          <div className="reset-success" role="status">
            If an account exists for <strong>{email.trim()}</strong>, a password reset link has been sent. Check your inbox and spam folder.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="reset-label" htmlFor="reset-email">Email address</label>
            <div className="input-box">
              <Mail size={17} aria-hidden="true" />
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive" role="alert">
                <p>{error}</p>
              </Alert>
            )}

            <button className="reset-submit" type="submit" disabled={loading}>
              {loading ? <LoadingIndicator label="Sending reset link..." size="small" /> : "Send reset link"}
            </button>
          </form>
        )}

        <Link className="reset-back-link" href="/login">
          <ArrowLeft size={16} aria-hidden="true" /> Back to login
        </Link>
      </section>
    </main>
  );
};

export default ResetPassword;
