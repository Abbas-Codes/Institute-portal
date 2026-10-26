import "./legal-page.css";

export default function LegalPage({ title, intro, sections }) {
  return (
    <main className="legal-page">
      <header className="legal-page-header">
        <p className="legal-eyebrow">LMS PORTAL</p>
        <h1>{title}</h1>
        <p className="legal-intro">{intro}</p>
        <p className="legal-updated">Last updated: October 25, 2026</p>
      </header>

      <div className="legal-content">
        {sections.map((section) => (
          <section className="legal-section" key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets?.length > 0 && (
              <ul>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
        <p className="legal-contact">
          For questions or requests about these policies, contact your institute
          administrator through the contact channel provided by your institute.
        </p>
      </div>
    </main>
  );
}
