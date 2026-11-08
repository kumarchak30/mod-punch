import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext.jsx";

function LayersIcon() {
  return (
    <svg aria-hidden="true" className="icon" viewBox="0 0 24 24" fill="none">
      <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
      <path d="m4 12 8 4.5 8-4.5M4 16.5l8 4.5 8-4.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="arrow-icon" viewBox="0 0 24 24" fill="none">
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const { signUpNewUser } = UserAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signUpNewUser(name, email, password);

      if (result.success) {
        if (result.data?.session) {
          // Email confirmation is off, so the user is already signed in
          navigate("/onboarding");
        } else {
          // Email confirmation is on, so they must verify first
          setRegistered(true);
        }
      } else {
        setError(result.error?.message ?? "Sign up failed");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="intro-panel" aria-labelledby="intro-title">
        <div className="decorative-squares" aria-hidden="true" />

        <div className="intro-content">
          <a className="brand" href="/" aria-label="ModPunch Organizer home">
            <span className="brand-mark">
              <LayersIcon />
            </span>
            <span className="wordmark">
              <strong>
                MOD<span>PUNCH</span><sup>®</sup>
              </strong>
              <small>ORGANIZER</small>
            </span>
          </a>

          <div className="intro-copy">
            <p className="eyebrow">KNOW BEFORE YOU INSTALL</p>
            <h1 id="intro-title">
              Find the right
              <br />
              mods for your
              <br />
              setup.
            </h1>
            <p className="description">
              Check compatibility with your operating
              <br className="desktop-break" />
              system and PC, then review known issues
              <br className="desktop-break" />
              and a mod&apos;s history before you install.
            </p>
          </div>

          <p className="tagline">Clear compatibility. Fewer surprises.</p>
        </div>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-wrap">
          <header className="login-heading">
            <p className="form-eyebrow">GET STARTED</p>
            <h2 id="login-title">Create your account</h2>
            <p>Use your personal email to join ModPunch.</p>
          </header>

          <form className="signup-card" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Username</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Alex Morgan"
                autoComplete="username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="signup-email">Personal email</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                placeholder="alex@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p role="alert">{error}</p>}

            <button
              className="primary-button signup-button"
              type="submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Creating account..."
                  : registered
                    ? "Account created"
                    : "Create account"}
              </span>
              <ArrowIcon />
            </button>

            {registered ? (
              <p className="success-message" role="status">
                You&apos;re all set. Check your email to verify your account.
              </p>
            ) : (
              <p className="terms">
                By creating an account, you agree to our{" "}
                <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
              </p>
            )}
          </form>

          <div className="divider signup-divider" />
          <p className="signup">
            Already have an account?{" "}
            {/* Change "/signin" to whatever path your router.jsx uses */}
            <Link className="text-button" to="/signin">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
