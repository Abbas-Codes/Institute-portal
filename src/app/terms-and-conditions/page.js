import LegalPage from "../legal-page";

export const metadata = {
  title: "Terms and Conditions | Abbas Codes LMS",
  description: "Terms for using Abbas Codes LMS.",
};

const sections = [
  {
    heading: "Using the portal",
    paragraphs: [
      "Abbas Codes LMS provides account-based tools for institute administration, teaching, and learning. Your use of the portal is also subject to the rules and policies of your institute.",
      "Use the portal only for lawful, authorized institute purposes. You must not attempt to access another person's account or records, interfere with the service, bypass access controls, or upload unlawful, harmful, or malicious content.",
    ],
  },
  {
    heading: "Accounts and information",
    bullets: [
      "Provide accurate information when creating or updating an account.",
      "Keep your login credentials confidential and notify your institute administrator if you suspect your account has been compromised.",
      "You are responsible for activity carried out through your account, except where applicable law provides otherwise.",
      "Do not share personal or educational records with people who are not authorized to receive them.",
    ],
  },
  {
    heading: "Institute records and responsibilities",
    paragraphs: [
      "The institute and its authorized staff manage the records and permissions in the portal. Contact the institute to request corrections or help with records, account access, or role assignments.",
      "Users must use academic, attendance, fee, and other institutional information responsibly. Do not rely on the portal as a substitute for official confirmation when an institute requires another process or record.",
    ],
  },
  {
    heading: "Availability and third-party services",
    paragraphs: [
      "Features may change, be temporarily unavailable, or depend on third-party services such as Firebase and Cloudinary. The institute may suspend or restrict access when needed for maintenance, security, policy enforcement, or legal obligations.",
      "Third-party services are governed by their own terms. To the extent permitted by law, the portal is provided without a guarantee that it will always be available, error-free, or suitable for every purpose.",
    ],
  },
  {
    heading: "Suspension and termination",
    paragraphs: [
      "Access may be suspended or ended by the institute if an account is no longer authorized, these terms are violated, or access must be restricted for security or legal reasons. Ending access does not necessarily delete institute records that must be retained.",
    ],
  },
  {
    heading: "Changes to these terms",
    paragraphs: [
      "These terms may be updated as the portal or institute requirements change. Continued use after updated terms are published is subject to the revised terms, to the extent permitted by applicable law.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      title="Terms and Conditions"
      intro="These terms apply to your use of Abbas Codes LMS. By accessing the portal, you agree to use it responsibly and follow your institute's applicable rules."
      sections={sections}
    />
  );
}
