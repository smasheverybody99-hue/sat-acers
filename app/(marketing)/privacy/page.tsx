import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy — SAT Acers" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 27, 2026">
      <p>
        SAT Acers is a free website for Digital SAT prep. This page explains what data we store and what we do with
        it.
      </p>

      <h2>What we store</h2>
      <ul>
        <li>
          <b>If you use the site without an account:</b> your answers, Mistake Log, vocabulary reviews, streak and mock results are stored
          only in your browser (localStorage). They are never sent to us.
        </li>
        <li>
          <b>If you sign in with email or Google:</b> your email address, the name on your Google account, and the
          practice data above are stored in the cloud so they stay the same on all your devices.
        </li>
      </ul>
      <p>
        <b>Leaderboard:</b> if you&apos;re signed in, the leaderboard shows a name you choose (by default
        &quot;Acer&quot; plus a short code, never your email) with how many questions you answered this week, your
        streak and your total answered. You can change the name or turn off &quot;Show me on the leaderboard&quot; at
        any time, which removes your row.
      </p>
      <p>
        When you sign in with Google, we only receive your name, email address and profile picture. We never access
        your Google Drive, contacts or any other data.
      </p>

      <h2>Where your data is kept</h2>
      <p>
        Account and practice data are stored with Supabase. The site is hosted on Vercel. Each user can only access
        their own data.
      </p>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We don&apos;t sell your data or share it with advertisers.</li>
        <li>We don&apos;t use advertising or tracking cookies.</li>
        <li>We don&apos;t send marketing emails. The only email you get is the sign-in link you ask for.</li>
      </ul>

      <h2>Deleting your data</h2>
      <p>
        To delete your account and all its data, email{" "}
        <a href="mailto:inomovhusan5@gmail.com">inomovhusan5@gmail.com</a>. We&apos;ll delete it within 7 days. You
        can remove the data stored in your browser yourself by clearing this site&apos;s data.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email <a href="mailto:inomovhusan5@gmail.com">inomovhusan5@gmail.com</a>
      </p>
    </LegalPage>
  );
}
