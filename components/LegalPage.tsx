export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <section className="container legal">
      <h1>{title}</h1>
      <p className="legal-updated">Last updated: {updated}</p>
      {children}
    </section>
  );
}
