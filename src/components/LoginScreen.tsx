import { useState } from "react";
import { supabase } from "../utils/supabase";
import { readLocalStorageSnapshot } from "../utils/storage";

const MIGRATE_FLAG = "pitcher-migrate";

export function hasPendingMigration(): boolean {
  return sessionStorage.getItem(MIGRATE_FLAG) === "1";
}

export function clearMigrationFlag(): void {
  sessionStorage.removeItem(MIGRATE_FLAG);
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [migrateMode, setMigrateMode] = useState(false);

  const hasLocalData = readLocalStorageSnapshot() !== null;

  async function sendLink(withMigration: boolean) {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    if (withMigration) sessionStorage.setItem(MIGRATE_FLAG, "1");
    const redirectTo =
      window.location.origin + window.location.pathname;
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (err) {
      sessionStorage.removeItem(MIGRATE_FLAG);
      setError(err.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-icon">✉️</div>
          <h2 className="login-title">Check your email</h2>
          <p className="login-sub">
            We sent a magic link to <strong>{email}</strong>.
            {migrateMode && " Your training data will be imported after sign-in."}
          </p>
          <button className="btn-secondary" style={{ marginTop: 16, width: "100%" }} onClick={() => { setSent(false); setMigrateMode(false); }}>
            Back
          </button>
        </div>
      </div>
    );
  }

  if (migrateMode) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <button className="login-back" onClick={() => setMigrateMode(false)}>← Back</button>
          <h2 className="login-title">Import existing data</h2>
          <p className="login-sub">
            Enter your email to sign in. Your training data saved on this device
            will be imported into your account.
          </p>
          <form
            className="login-form"
            onSubmit={(e) => { e.preventDefault(); sendLink(true); }}
          >
            <input
              type="email"
              className="login-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <button type="submit" className="btn-primary login-btn" disabled={loading}>
              {loading ? "Sending…" : "Sign in & import data"}
            </button>
          </form>
          {error && <p className="login-error">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-icon">⚾</div>
        <h1 className="login-title">Pitcher Tracker</h1>
        <p className="login-sub">Sign in with a magic link — no password needed.</p>
        <form
          className="login-form"
          onSubmit={(e) => { e.preventDefault(); sendLink(false); }}
        >
          <input
            type="email"
            className="login-input"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? "Sending…" : "Send magic link"}
          </button>
        </form>
        {error && <p className="login-error">{error}</p>}

        {hasLocalData && (
          <div className="login-migrate-card">
            <p className="login-migrate-label">Training data found on this device</p>
            <button
              className="btn-secondary"
              style={{ width: "100%", marginTop: 8 }}
              onClick={() => setMigrateMode(true)}
            >
              Migrate existing data →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
