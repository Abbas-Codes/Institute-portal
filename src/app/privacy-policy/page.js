import LegalPage from "../legal-page";

export const metadata = {
  title: "Privacy Policy | Abbas Codes LMS",
  description: "Learn how Abbas Codes LMS handles personal and educational information.",
};

const sections = [
  {
    heading: "Information handled by the portal",
    paragraphs: [
      "The portal may handle information provided by users or entered by institute staff, including names, email addresses, phone numbers, addresses, CNIC or other identification details, profile photos, and account roles.",
      "Depending on your role and the features enabled by your institute, this may also include class and subject information, student or teacher identifiers, attendance, assignments, applications, fees, and academic records.",
    ],
  },
  {
    heading: "How information is used",
    bullets: [
      "To create and manage accounts and provide role-appropriate portal features.",
      "To display and maintain institute, class, attendance, assignment, application, fee, and academic records.",
      "To communicate about accounts, institute services, and support requests.",
      "To protect the portal, investigate misuse, and meet applicable legal obligations.",
    ],
  },
  {
    heading: "Service providers and sharing",
    paragraphs: [
      "The portal uses Firebase services for authentication and database functions, and profile-photo uploads may be processed by Cloudinary. These providers process information to support the portal under their own terms and privacy notices.",
      "Institute administrators and authorized staff may access records needed for their duties. Information may also be disclosed when required by law or when necessary to protect users, the institute, or the service. The institute should not make information public unless the feature and applicable permissions allow it.",
    ],
  },
  {
    heading: "Retention and security",
    paragraphs: [
      "Information is kept for as long as needed to operate the portal, maintain institute records, resolve issues, and meet legal or institutional obligations. Retention and deletion of educational records may be controlled by the institute.",
      "Reasonable technical and organizational safeguards should be used, but no online service can guarantee absolute security. Use a strong password, keep account credentials private, and report suspected unauthorized access to your institute administrator.",
    ],
  },
  {
    heading: "Your choices and requests",
    paragraphs: [
      "You may ask your institute to review or correct your account information, or to explain how your information is used. The ability to access, correct, delete, or restrict information depends on your role, the institute's recordkeeping duties, and applicable law.",
      "If you are a student who is a minor, requests may need to be made by a parent or guardian as required by the institute and applicable law.",
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      "This policy may be updated when portal features, service providers, or legal requirements change. The latest version will be published on this page.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="This policy explains how personal and educational information may be handled when you use Abbas Codes LMS. Your institute operates the portal and determines which features and records are enabled."
      sections={sections}
    />
  );
}
