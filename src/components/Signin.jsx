import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext.jsx";

function LayersIcon({ small = false }) {
  return (
    <svg
      aria-hidden="true"
      className={small ? "icon icon-small" : "icon"}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
      <path d="m4 12 8 4.5 8-4.5M4 16.5l8 4.5 8-4.5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" className="tab-icon" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m5 7 7 5 7-5" />
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

function MicrosoftIcon() {
  return (
    <span className="microsoft-icon" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

function Tab({ active, onClick, children, icon }) {
  return (
    <button
      className={`tab ${active ? "tab-active" : ""}`}
      onClick={onClick}
      type="button"
      role="tab"
      aria-selected={active}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export default function Signin() {
  const [method, setMethod] = useState("minecraft");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signInUser } = UserAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signInUser(email, password);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.error?.message ?? "Sign in failed");
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
          <a className="brand" href="#" aria-label="ModPunch Organizer home">
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
            <h2 id="login-title">Welcome back</h2>
            <p>Choose how you&apos;d like to continue.</p>
          </header>

          <div className="tabs" role="tablist" aria-label="Sign in method">
            <Tab
              active={method === "minecraft"}
              onClick={() => setMethod("minecraft")}
              icon={<LayersIcon small />}
            >
              Minecraft
            </Tab>
            <Tab
              active={method === "email"}
              onClick={() => setMethod("email")}
              icon={<MailIcon />}
            >
              Email
            </Tab>
          </div>

          {method === "minecraft" ? (
            <>
              <div className="signin-card" role="tabpanel">
                <div className="signin-details">
                  <MicrosoftIcon />
                  <div>
                    <h3>Use your Minecraft account</h3>
                    <p>
                      Continue securely with the Microsoft
                      <br className="desktop-break" />
                      account connected to Minecraft.
                    </p>
                  </div>
                </div>
                <button className="primary-button" type="button">
                  <span>Continue with Microsoft</span>
                  <ArrowIcon />
                </button>
              </div>
              <p className="security-note">
                Minecraft accounts are managed securely through Microsoft.
              </p>
            </>
          ) : (
            <>
              <form
                className="signin-card email-card"
                role="tabpanel"
                onSubmit={handleSubmit}
              >
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {error && <p role="alert">{error}</p>}

                <button className="primary-button" type="submit">
                  <span>Sign in</span>
                  <ArrowIcon />
                </button>
              </form>
              <p className="security-note">
                Sign in with the email and password you registered with.
              </p>
            </>
          )}

          <div className="divider" />
          <p className="signup">
            New to ModPunch? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
