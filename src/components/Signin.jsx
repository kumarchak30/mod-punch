import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext.jsx";
import { supabase } from "../supabaseClient";
import "../styles/login.css";

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

function GoogleIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
    );
}

function MicrosoftIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 23 23">
            <rect x="0" y="0" width="11" height="11" fill="#f25022" />
            <rect x="12" y="0" width="11" height="11" fill="#7fba00" />
            <rect x="0" y="12" width="11" height="11" fill="#00a4ef" />
            <rect x="12" y="12" width="11" height="11" fill="#ffb900" />
        </svg>
    );
}

function AppleIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
    );
}

export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { signInUser } = UserAuth();
    const navigate = useNavigate();

    // same email/password logic as before
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

    // same Microsoft (Azure) OAuth logic as before
    async function handleMicrosoftLogin() {
        setError("");
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "azure",
            options: {
                scopes: "email",
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (error) setError(error.message);
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
                        Log in to ModPunch
                    </h1>
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <label htmlFor="email" className="auth-sr-only">Email</label>
                        <div className="auth-field">
                            <MailIcon />
                            <input
                                id="email"
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
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                autoComplete="current-password"
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

                        <button type="button" className="auth-forgot" disabled title="Coming soon">
                            Forgot password?
                        </button>

                        {error && <p className="auth-error" role="alert">{error}</p>}

                        <button className="auth-submit" type="submit" disabled={loading}>
                            {loading ? "Logging in..." : "Log in"}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>Or log in with</span>
                    </div>

                    <div className="auth-socials">
                        <button type="button" disabled title="Coming soon" aria-label="Log in with Google">
                            <GoogleIcon />
                        </button>
                        <button type="button" onClick={handleMicrosoftLogin} aria-label="Log in with Microsoft">
                            <MicrosoftIcon />
                        </button>
                        <button type="button" disabled title="Coming soon" aria-label="Log in with Apple">
                            <AppleIcon />
                        </button>
                    </div>
                </section>
            </div>

            <p className="auth-signup">
                New to ModPunch? <Link to="/signup">Create an account</Link>
            </p>
        </main>
    );
}