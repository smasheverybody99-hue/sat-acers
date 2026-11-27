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
      <p className="legal-updated">Oxirgi yangilanish: {updated}</p>
      {children}
    </section>
  );
}
