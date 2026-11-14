import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext.jsx";
import "../styles/login.css";

function UserIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" />
            <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
        </svg>
    );
}

function MailIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
            <path d="m5 7 7 5 7-5" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="10.5" width="14" height="10" rx="2" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        </svg>
    );
}

function EyeIcon({ open }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
            <circle cx="12" cy="12" r="3" />
            {!open && <path d="M4 4l16 16" />}
        </svg>
    );
}

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [registered, setRegistered] = useState(false);

    const { signUpNewUser } = UserAuth();
    const navigate = useNavigate();

    // same sign-up logic as before
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
        <main className="auth-page">
            <div className="auth-frame">
                <section className="auth-card" aria-labelledby="auth-title">
                    <div className="auth-brand" aria-hidden="true">
                        <img src="/favicon.png" alt="" className="auth-logo" />
                        <span className="auth-wordmark">
                            MOD<span>PUNCH</span><sup>®</sup>
                        </span>
                    </div>

                    <h1 id="auth-title" className="auth-title">
                        Create your account
                    </h1>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <label htmlFor="name" className="auth-sr-only">Username</label>
                        <div className="auth-field">
                            <UserIcon />
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Username"
                                autoComplete="username"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <label htmlFor="signup-email" className="auth-sr-only">Email</label>
                        <div className="auth-field">
                            <MailIcon />
                            <input
                                id="signup-email"
                                name="email"
                                type="email"
                                placeholder="Email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <label htmlFor="password" className="auth-sr-only">Password</label>
                        <div className="auth-field">
                            <LockIcon />
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password (8+ characters)"
                                autoComplete="new-password"
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="auth-eye"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                aria-pressed={showPassword}
                            >
                                <EyeIcon open={showPassword} />
                            </button>
                        </div>

                        {error && <p className="auth-error" role="alert">{error}</p>}

                        <button
                            className="auth-submit"
                            type="submit"
                            disabled={loading || registered}
                        >
                            {loading
                                ? "Creating account..."
                                : registered
                                    ? "Account created"
                                    : "Create account"}
                        </button>

                        {registered ? (
                            <p className="auth-success" role="status">
                                You&apos;re all set. Check your email to verify your account.
                            </p>
                        ) : (
                            <p className="auth-terms">
                                By creating an account, you agree to our Terms and Privacy Policy.
                            </p>
                        )}
                    </form>
                </section>
            </div>

            <p className="auth-signup">
                Already have an account? <Link to="/signin">Log in</Link>
            </p>
        </main>
    );
}