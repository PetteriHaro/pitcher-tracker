import { useState } from "react";
import { supabase } from "../utils/supabase";

type Step = "email" | "code";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendCode() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setStep("code");
    }
  }

  async function verifyCode() {
    const token = code.trim();
    if (token.length < 6 || token.length > 10) return;
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token,
      type: "email",
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    }
    // on success, onAuthStateChange in App.tsx takes over
  }

  function goBack() {
    setStep("email");
    setCode("");
    setError("");
  }

  if (step === "code") {
    return (
      <div className="login-screen">
        <div className="login-card">
          <button className="login-back" onClick={goBack}>← Back</button>
          <div className="login-icon">✉️</div>
          <h2 className="login-title">Enter code</h2>
          <p className="login-sub">
            We sent a code to <strong>{email}</strong>.
          </p>
          <form
            className="login-form"
            onSubmit={(e) => { e.preventDefault(); verifyCode(); }}
          >
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              className="login-input login-code-input"
              placeholder="········"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
              maxLength={10}
              required
              autoFocus
            />
            <button type="submit" className="btn-primary login-btn" disabled={loading || code.length < 6}>
              {loading ? "Verifying…" : "Verify & sign in"}
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
        <p className="login-sub">Sign in with a code sent to your email.</p>
        <form
          className="login-form"
          onSubmit={(e) => { e.preventDefault(); sendCode(); }}
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
            {loading ? "Sending…" : "Send code"}
          </button>
        </form>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}
