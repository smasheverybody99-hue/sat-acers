export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>
          © {new Date().getFullYear()} SAT Acers · Ace it. Every day. ·{" "}
          <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a>
        </span>
        <span>
          SAT® is a trademark registered by the College Board, which is not affiliated with, and does not endorse, this
          website.
        </span>
      </div>
    </footer>
  );
}
