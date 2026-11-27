import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms of Service — SAT Acers" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="November 27, 2026">
      <p>By using SAT Acers, you agree to the following terms.</p>

      <h2>The service</h2>
      <p>
        SAT Acers is a free practice site for the Digital SAT. Its questions, mock tests and score estimates are for
        practice only and do not predict your official SAT score.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Don&apos;t share access to your account with others.</li>
        <li>Don&apos;t try to break the site, access other users&apos; data, or overload it.</li>
        <li>We may disable accounts that break these terms.</li>
      </ul>

      <h2>Content</h2>
      <p>
        The questions and explanations on this site were written by the SAT Acers team. You&apos;re welcome to use
        them for your own prep, but don&apos;t copy them to other sites or sell them without permission.
      </p>
      <p>
        SAT® is a trademark registered by the College Board, which is not affiliated with, and does not endorse, this
        website.
      </p>

      <h2>No warranty</h2>
      <p>
        The site is provided &quot;as is.&quot; We can&apos;t guarantee it will always be available or error-free, but
        we work to fix problems quickly.
      </p>

      <h2>Changes</h2>
      <p>
        If these terms change, we&apos;ll update this page. Questions:{" "}
        <a href="mailto:inomovhusan5@gmail.com">inomovhusan5@gmail.com</a>
      </p>
    </LegalPage>
  );
}
