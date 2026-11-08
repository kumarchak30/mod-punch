import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext.jsx";
import { useSplayHistory } from "../hooks/useSplayHistory.js";
import "./Profile.css";

/*
    User profile page (Figma Make: "Design ModShelf Game Launcher" → /profile).

    Data:
    - searches + saved mods come from two SplayTrees (useSplayHistory), so the
      lists are ordered by what the user touched most recently / most often
    - interests + library preferences are plain settings saved per user in localStorage
*/

const INTEREST_OPTIONS = [
    "Performance", "Visual", "World generation", "Quality of life", "Technology",
    "Adventure", "Building", "Multiplayer", "Audio",
];

const PREFERENCE_FIELDS = [
    { id: "defaultCategory", label: "Default category", hint: "The category selected when you start browsing",
      options: ["All", "Optimization", "Adventure", "Technology"] },
    { id: "sortBy", label: "Sort results by", hint: "How mods are ordered in search results",
      options: ["Downloads", "Recently updated", "Name"] },
    { id: "loader", label: "Preferred loader", hint: "Highlight mods that support your usual loader",
      options: ["Fabric", "NeoForge", "Forge", "Quilt"] },
];

const DEFAULT_PREFS = { defaultCategory: "All", sortBy: "Downloads", loader: "Fabric" };

function readJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function writeJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // storage blocked: setting just won't persist
    }
}

// "Alex K." -> "AK", "sodium" -> "SO"
function initials(text) {
    const words = String(text).trim().split(/[\s._-]+/).filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return String(text).slice(0, 2).toUpperCase();
}

const ShieldIcon = () => (
    <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 3 5 6v5c0 4.8 2.8 8 7 10 4.2-2 7-5.2 7-10V6z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

const BackIcon = () => (
    <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m15 18-6-6 6-6" />
    </svg>
);

const Profile = () => {
    const { session } = UserAuth();
    const navigate = useNavigate();

    const user = session?.user;
    const userId = user?.id ?? "guest";
    const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Player";
    const handle = user?.email ?? "guest.local";

    // splay-tree backed lists
    const searches = useSplayHistory(`modpunch:${userId}:searches`, { limit: 5, order: "recent" });
    const mods = useSplayHistory(`modpunch:${userId}:mods`, { limit: 5, order: "mostAccessed" });

    // settings
    const interestsKey = `modpunch:${userId}:interests`;
    const prefsKey = `modpunch:${userId}:prefs`;
    const [savedInterests, setSavedInterests] = useState(() => readJSON(interestsKey, []));
    const [interests, setInterests] = useState(savedInterests);
    const [prefs, setPrefs] = useState(() => ({ ...DEFAULT_PREFS, ...readJSON(prefsKey, {}) }));

    const interestsDirty =
        interests.length !== savedInterests.length || interests.some((i) => !savedInterests.includes(i));

    const toggleInterest = (name) => {
        setInterests((cur) => (cur.includes(name) ? cur.filter((i) => i !== name) : [...cur, name]));
    };

    const saveInterests = () => {
        writeJSON(interestsKey, interests);
        setSavedInterests(interests);
    };

    const updatePref = (id, value) => {
        const next = { ...prefs, [id]: value };
        setPrefs(next);
        writeJSON(prefsKey, next);
    };

    // category affinity = share of mod visits per category (uses every node's accessCount)
    const affinity = (() => {
        const totals = new Map();
        let sum = 0;
        for (const m of mods.all) {
            const cat = m.value?.category;
            if (!cat) continue;
            totals.set(cat, (totals.get(cat) ?? 0) + m.accessCount);
            sum += m.accessCount;
        }
        return [...totals]
            .map(([name, count]) => ({ name, pct: Math.round((count / sum) * 100) }))
            .sort((a, b) => b.pct - a.pct)
            .slice(0, 5);
    })();

    return (
        <div className="profile-shell">
            <main className="profile-page">
                <div className="profile-page-head">
                    <div>
                        <div className="eyebrow">
                            <span />
                            LOCAL PROFILE
                        </div>
                        <h1>Player profile</h1>
                        <p>Personalize the categories and mods ModPunch surfaces for you.</p>
                    </div>
                    <button type="button" className="back-button" onClick={() => navigate("/dashboard")}>
                        <BackIcon />
                        Back to browser
                    </button>
                </div>

                <section className="profile-banner">
                    <div className="profile-avatar-large">
                        {initials(displayName)}
                        <span />
                    </div>
                    <div className="profile-identity">
                        <span>PRIMARY PLAYER</span>
                        <h2>{displayName}</h2>
                        <code>
                            {handle} · {prefs.loader} player
                        </code>
                    </div>
                    <div className="profile-banner-stats">
                        <div>
                            <strong>{mods.size}</strong>
                            <span>Saved mods</span>
                        </div>
                        <div>
                            <strong>{savedInterests.length}</strong>
                            <span>Interest groups</span>
                        </div>
                        <div>
                            <strong>{searches.size}</strong>
                            <span>Recent searches</span>
                        </div>
                    </div>
                    <span className="local-badge">
                        <ShieldIcon />
                        Stored locally
                    </span>
                </section>

                <div className="profile-columns">
                    <div className="profile-primary">
                        <section className="profile-card">
                            <div className="profile-card-title">
                                <div>
                                    <span>DISCOVERY PROFILE</span>
                                    <h2>Interest categories</h2>
                                    <p>Choose what you want to see more often while browsing.</p>
                                </div>
                                <span className="selection-count">{interests.length} selected</span>
                            </div>
                            <div className="interest-grid">
                                {INTEREST_OPTIONS.map((name) => {
                                    const selected = interests.includes(name);
                                    return (
                                        <button
                                            key={name}
                                            type="button"
                                            className={selected ? "selected" : undefined}
                                            aria-pressed={selected}
                                            onClick={() => toggleInterest(name)}
                                        >
                                            <span className="interest-check">{selected ? "✓" : ""}</span>
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="profile-card-footer">
                                <span>
                                    <ShieldIcon />
                                    Interests never leave this device.
                                </span>
                                <button
                                    type="button"
                                    className="save-button"
                                    onClick={saveInterests}
                                    disabled={!interestsDirty}
                                >
                                    {interestsDirty ? "Save interests" : "Saved"}
                                </button>
                            </div>
                        </section>

                        <section className="profile-card">
                            <div className="profile-card-title">
                                <div>
                                    <span>BROWSING</span>
                                    <h2>Library preferences</h2>
                                    <p>Set your default discovery and sorting preferences.</p>
                                </div>
                            </div>
                            <div className="preference-list">
                                {PREFERENCE_FIELDS.map((field) => (
                                    <label key={field.id}>
                                        <div>
                                            <strong>{field.label}</strong>
                                            <span>{field.hint}</span>
                                        </div>
                                        <select
                                            value={prefs[field.id]}
                                            onChange={(e) => updatePref(field.id, e.target.value)}
                                        >
                                            {field.options.map((opt) => (
                                                <option key={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </label>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="profile-secondary">
                        <section className="profile-card">
                            <div className="profile-card-title">
                                <div>
                                    <span>YOUR TASTE</span>
                                    <h2>Category affinity</h2>
                                </div>
                            </div>
                            {affinity.length === 0 ? (
                                <p className="profile-empty">Open a few mods and your top categories show up here.</p>
                            ) : (
                                <div className="affinity-list">
                                    {affinity.map((a) => (
                                        <div className="affinity" key={a.name}>
                                            <div>
                                                <span>{a.name}</span>
                                                <code>{a.pct}%</code>
                                            </div>
                                            <div className="affinity-track">
                                                <i style={{ width: `${a.pct}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="profile-note">Based on how often you open mods in each category.</p>
                        </section>

                        <section className="profile-card local-data-card">
                            <div className="local-data-icon">
                                <ShieldIcon />
                            </div>
                            <div>
                                <span>LOCAL-FIRST DATA</span>
                                <h3>Your profile stays yours</h3>
                                <p>
                                    Profile settings and discovery preferences are stored in this browser
                                    and never shared.
                                </p>
                            </div>
                        </section>

                        <section className="profile-card favorite-card">
                            <div className="profile-card-title">
                                <div>
                                    <span>MOST ACCESSED MODS</span>
                                    <h2>Your essentials</h2>
                                </div>
                            </div>
                            {mods.items.length === 0 ? (
                                <p className="profile-empty">Mods you save will show up here.</p>
                            ) : (
                                mods.items.map((m) => (
                                    <button
                                        type="button"
                                        className="favorite-row"
                                        key={m.key}
                                        onClick={() => mods.access(m.key)}
                                    >
                                        <div className="favorite-mark">{initials(m.value?.title ?? m.key)}</div>
                                        <div>
                                            <strong>{m.value?.title ?? m.key}</strong>
                                            <span>{m.value?.category ?? "mod"}</span>
                                        </div>
                                        <span className="access-count">{m.accessCount}×</span>
                                    </button>
                                ))
                            )}
                        </section>

                        <section className="profile-card favorite-card">
                            <div className="profile-card-title">
                                <div>
                                    <span>SEARCH HISTORY</span>
                                    <h2>Recent searches</h2>
                                </div>
                            </div>
                            {searches.items.length === 0 ? (
                                <p className="profile-empty">Your mod searches will show up here.</p>
                            ) : (
                                searches.items.map((s) => (
                                    <div className="favorite-row" key={s.key}>
                                        <button
                                            type="button"
                                            className="search-row-main"
                                            onClick={() => searches.access(s.key)}
                                        >
                                            <div className="favorite-mark search-mark">/</div>
                                            <div>
                                                <strong>{s.value?.query ?? s.key}</strong>
                                                <span>searched {s.accessCount}×</span>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            className="row-remove"
                                            aria-label={`Remove "${s.key}" from history`}
                                            onClick={() => searches.remove(s.key)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            )}
                        </section>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default Profile;
