import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import "./not-found.css";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-icon"><Compass size={26} aria-hidden="true" /></div>
        <p className="not-found-code">404 — PAGE NOT FOUND</p>
        <h1>We can’t find that page</h1>
        <p className="not-found-description">
          The page may have moved, or the address may be incorrect. Check the URL or return to the portal home page.
        </p>
        <Link className="not-found-link" href="/">
          <ArrowLeft size={17} aria-hidden="true" /> Back to home
        </Link>
      </div>
    </main>
  );
}
