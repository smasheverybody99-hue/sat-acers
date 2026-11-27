"use client";

import { useState } from "react";
import { Icon } from "./Icons";
import { useAuth } from "./AuthProvider";
import { googleEnabled } from "@/lib/supabase";

export function Login() {
  const { user, status, ready, signInEmail, signInGoogle, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "off") {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <h1>Kirish hozircha yoqilmagan</h1>
          <p className="muted-s">Progressingiz shu brauzerda saqlanmoqda. Bulutda saqlash tez orada ishga tushadi.</p>
          <a className="btn btn-navy" href="/dashboard">Bosh panelga</a>
        </div>
      </div>
    );
  }

  if (!ready) return null;

  if (user) {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <span className="avatar xl">{(user.name || user.email || "?")[0].toUpperCase()}</span>
          <h1>{user.name || "Xush kelibsiz!"}</h1>
          <p className="muted-s">{user.email}</p>
          <div className={`sync-pill ${status}`}>
            <i /> {status === "synced" ? "Progress bulutda saqlangan" : status === "syncing" ? "Sinxronlanmoqda…" : "Sinxronlashda xato — keyinroq qayta urinadi"}
          </div>
          <a className="btn btn-primary" href="/dashboard">Bosh panelga o'tish</a>
          <button className="btn btn-light" onClick={signOut}>Chiqish</button>
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Email manzilini to'g'ri kiriting.");
      return;
    }
    setBusy(true);
    const err = await signInEmail(email.trim());
    setBusy(false);
    if (err) setError(err);
    else setSent(true);
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-badge"><Icon name="sparkle" size={22} /></div>
        <h1>Progressingizni saqlang</h1>
        <p className="muted-s">
          Kirsangiz, yechgan savollaringiz, Xatonoma, streak va mock natijalaringiz bulutda saqlanadi — telefon va
          kompyuterda bir xil bo'ladi. Shu paytgacha qilgan ishingiz ham yo'qolmaydi.
        </p>

        {sent ? (
          <div className="login-sent">
            <b>📬 Emailingizni tekshiring</b>
            <p>
              <b>{email}</b> manziliga kirish havolasi yuborildi. Havolani shu qurilmada oching. Xat ko'rinmasa,
              "Spam" papkasini tekshiring.
            </p>
            <button className="link-btn" onClick={() => setSent(false)}>Boshqa email kiritish</button>
          </div>
        ) : (
          <>
            {googleEnabled && (
              <>
                <button
                  className="btn btn-light google-btn"
                  onClick={async () => {
                    setError(null);
                    const err = await signInGoogle();
                    if (err) setError(err);
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
                  </svg>
                  Google orqali kirish
                </button>
                <div className="login-or"><span>yoki</span></div>
              </>
            )}
            <form onSubmit={submit} className="login-form">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="siz@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn btn-primary" disabled={busy}>
                {busy ? "Yuborilmoqda…" : "Kirish havolasini yuborish"}
              </button>
            </form>
            <p className="login-note">
              Parol kerak emas: emailingizga bir martalik havola keladi. Kirish orqali{" "}
              <a href="/terms">shartlar</a> va <a href="/privacy">maxfiylik siyosati</a>ga rozilik bildirasiz.
            </p>
          </>
        )}
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}
