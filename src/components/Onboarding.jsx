import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext.jsx";

function MonitorIcon() {
  return (
    <svg aria-hidden="true" className="monitor-icon" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
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

export default function Onboarding() {
  const { session, savePcSpecs } = UserAuth();
  const navigate = useNavigate();

  const [specs, setSpecs] = useState({
    os: "",
    graphicsCard: "",
    processor: "",
    memory: "",
    storage: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // session is undefined while Supabase is still checking, null if signed out
  if (session === null) {
    return <Navigate to="/signin" replace />;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setSpecs((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await savePcSpecs(specs);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.error?.message ?? "Could not save your setup");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="setup-page">
      <section className="setup-wrap" aria-labelledby="setup-title">
        <header className="setup-heading">
          <h1 id="setup-title">Tell us about your PC</h1>
          <p>Get compatibility results tailored to your setup.</p>
        </header>

        <div className="setup-icon">
          <MonitorIcon />
        </div>

        <p className="setup-intro">
          Your specs help ModPunch show accurate compatibility
          <br className="desktop-break" />
          details for every mod. You can update them anytime in
          <br className="desktop-break" />
          settings.
        </p>

        <form className="setup-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="os">Operating system</label>
            <select
              id="os"
              name="os"
              value={specs.os}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select your operating system
              </option>
              <option value="windows-11">Windows 11</option>
              <option value="windows-10">Windows 10</option>
              <option value="macos">macOS</option>
              <option value="linux">Linux</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="graphics-card">Graphics card</label>
            <input
              id="graphics-card"
              name="graphicsCard"
              type="text"
              placeholder="e.g. NVIDIA GeForce RTX 4060"
              value={specs.graphicsCard}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="processor">Processor</label>
            <input
              id="processor"
              name="processor"
              type="text"
              placeholder="e.g. Intel Core i7-13700K"
              value={specs.processor}
              onChange={handleChange}
            />
          </div>

          <div className="setup-row">
            <div className="field">
              <label htmlFor="memory">Memory (RAM)</label>
              <input
                id="memory"
                name="memory"
                type="text"
                placeholder="e.g. 16 GB"
                value={specs.memory}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label htmlFor="storage">Available storage</label>
              <input
                id="storage"
                name="storage"
                type="text"
                placeholder="e.g. 250 GB"
                value={specs.storage}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <p role="alert">{error}</p>}

          <button
            className="primary-button setup-submit"
            type="submit"
            disabled={loading}
          >
            <span>{loading ? "Saving..." : "Save and continue"}</span>
            <ArrowIcon />
          </button>

          <button
            className="skip-button"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            Skip for now
          </button>
        </form>
      </section>
    </main>
  );
}
