import LegalPage from "../legal-page";

export const metadata = {
  title: "Cookie Policy | Abbas Codes LMS",
  description: "Information about cookies and browser storage used by Abbas Codes LMS.",
};

const sections = [
  {
    heading: "Cookies and browser storage",
    paragraphs: [
      "Cookies are small files saved by a website in your browser. Similar technologies, such as local storage, can also keep information on your device. They are not the same thing, although both may help a website remember a session or preference.",
    ],
  },
  {
    heading: "What the portal may use",
    bullets: [
      "Authentication-related storage used by Firebase to maintain or verify your signed-in session.",
      "Essential technical storage needed for security and to make the portal work.",
      "Additional storage or cookies set by third-party services, if those services or optional features are enabled in your institute's deployment.",
    ],
    paragraphs: [
      "The exact cookies and storage keys can vary with browser, Firebase configuration, and enabled integrations. This portal policy does not claim that every deployment uses the same set.",
    ],
  },
  {
    heading: "Managing cookies and storage",
    paragraphs: [
      "Your browser settings can usually block or remove cookies and site storage. Blocking essential storage may prevent sign-in or other portal features from working; clearing it may sign you out or reset saved preferences.",
      "For controls over cookies set by a third-party provider, review that provider's own information and settings. Your institute administrator can tell you which optional integrations are enabled for this portal.",
    ],
  },
  {
    heading: "Policy updates",
    paragraphs: [
      "This policy may be revised if the portal's configuration or service providers change. The current version will be available on this page.",
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro="This page describes cookies and similar browser storage that may be used to support sign-in, security, and portal features."
      sections={sections}
    />
  );
}
