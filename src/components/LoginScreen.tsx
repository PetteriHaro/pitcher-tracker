import { useState } from "react";
import { useForm, isEmail, isNotEmpty, hasLength } from "@mantine/form";
import { TextInput, PasswordInput, Button, PinInput, Stack, Text, Paper } from "@mantine/core";
import { supabase } from "../utils/supabase";

type Mode = "signin" | "signup" | "code";

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>("signin");
  const [emailForCode, setEmailForCode] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const signInForm = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: isEmail("Invalid email"),
      password: isNotEmpty("Enter your password"),
    },
  });

  const signUpForm = useForm({
    initialValues: { name: "", email: "", password: "" },
    validate: {
      name: isNotEmpty("Name is required"),
      email: isEmail("Invalid email"),
      password: hasLength({ min: 8 }, "At least 8 characters"),
    },
  });

  function reset(next: Mode) {
    setMode(next);
    setCode("");
    setError("");
    setInfo("");
  }

  async function onSignIn(values: typeof signInForm.values) {
    setLoading(true); setError(""); setInfo("");
    const { error: err } = await supabase.auth.signInWithPassword({
      email: values.email.trim(),
      password: values.password,
    });
    setLoading(false);
    if (err) setError(err.message);
  }

  async function onSignUp(values: typeof signUpForm.values) {
    setLoading(true); setError(""); setInfo("");
    const { error: err } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: { data: { name: values.name.trim() } },
    });
    setLoading(false);
    if (err) setError(err.message);
  }

  async function sendCode() {
    const email = signInForm.values.email.trim();
    if (!email) { setError("Enter your email first."); return; }
    setLoading(true); setError(""); setInfo("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (err) setError(err.message);
    else { setEmailForCode(email); reset("code"); }
  }

  async function verifyCode() {
    if (code.length < 6) return;
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.verifyOtp({
      email: emailForCode,
      token: code,
      type: "email",
    });
    setLoading(false);
    if (err) setError(err.message);
  }

  if (mode === "code") {
    return (
      <div className="login-screen">
        <Paper className="login-card" p="xl" radius="md" withBorder>
          <Button
            variant="subtle"
            size="xs"
            onClick={() => reset("signin")}
            style={{ alignSelf: "flex-start" }}
          >
            ← Back
          </Button>
          <div className="login-icon">✉️</div>
          <h2 className="login-title">Enter code</h2>
          <Text size="sm" c="dimmed" ta="center" mb="sm">
            We sent a code to <strong>{emailForCode}</strong>.
          </Text>
          <Stack gap="sm">
            <PinInput
              length={6}
              value={code}
              onChange={(v) => setCode(v.replace(/\D/g, ""))}
              oneTimeCode
              type="number"
              size="lg"
              autoFocus
              style={{ justifyContent: "center" }}
            />
            <Button
              color="accent"
              loading={loading}
              disabled={code.length < 6}
              onClick={verifyCode}
              fullWidth
            >
              Verify & sign in
            </Button>
          </Stack>
          {error && <Text size="sm" c="red" ta="center" mt="sm">{error}</Text>}
        </Paper>
      </div>
    );
  }

  if (mode === "signup") {
    return (
      <div className="login-screen">
        <Paper className="login-card" p="xl" radius="md" withBorder>
          <Button
            variant="subtle"
            size="xs"
            onClick={() => reset("signin")}
            style={{ alignSelf: "flex-start" }}
          >
            ← Back
          </Button>
          <div className="login-icon">⚾</div>
          <h1 className="login-title">Create account</h1>
          <Text size="sm" c="dimmed" ta="center" mb="sm">
            Enter your details — we'll set up your schedule next.
          </Text>
          <form onSubmit={signUpForm.onSubmit(onSignUp)}>
            <Stack gap="sm">
              <TextInput
                label="Name"
                placeholder="Your name"
                autoComplete="name"
                autoFocus
                {...signUpForm.getInputProps("name")}
              />
              <TextInput
                label="Email"
                placeholder="your@email.com"
                type="email"
                autoComplete="email"
                {...signUpForm.getInputProps("email")}
              />
              <PasswordInput
                label="Password"
                placeholder="Min 8 characters"
                autoComplete="new-password"
                {...signUpForm.getInputProps("password")}
              />
              <Button type="submit" color="accent" loading={loading} fullWidth>
                Create account
              </Button>
            </Stack>
          </form>
          {error && <Text size="sm" c="red" ta="center" mt="sm">{error}</Text>}
          {info && <Text size="sm" c="green" ta="center" mt="sm">{info}</Text>}
        </Paper>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <Paper className="login-card" p="xl" radius="md" withBorder>
        <div className="login-icon">⚾</div>
        <h1 className="login-title">Pitcher Tracker</h1>
        <Text size="sm" c="dimmed" ta="center" mb="sm">
          Sign in to sync your training data.
        </Text>
        <form onSubmit={signInForm.onSubmit(onSignIn)}>
          <Stack gap="sm">
            <TextInput
              label="Email"
              placeholder="your@email.com"
              type="email"
              autoComplete="email"
              {...signInForm.getInputProps("email")}
            />
            <PasswordInput
              label="Password"
              autoComplete="current-password"
              {...signInForm.getInputProps("password")}
            />
            <Button type="submit" color="accent" loading={loading} fullWidth>
              Sign in
            </Button>
          </Stack>
        </form>
        {error && <Text size="sm" c="red" ta="center" mt="sm">{error}</Text>}
        {info && <Text size="sm" c="green" ta="center" mt="sm">{info}</Text>}
        <Button variant="default" onClick={() => reset("signup")} fullWidth mt="md">
          Create account
        </Button>
        <Button
          variant="subtle"
          size="sm"
          onClick={sendCode}
          disabled={loading}
          fullWidth
          mt="xs"
        >
          Email me a code instead
        </Button>
      </Paper>
    </div>
  );
}
