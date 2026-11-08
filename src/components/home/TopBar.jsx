import { Link, useNavigate } from "react-router-dom"
import { UserAuth } from "../../context/AuthContext.jsx"
import VersionPicker from "./VersionPicker"

// same icon as the sign-in page
function LayersIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
            <path d="m4 12 8 4.5 8-4.5M4 16.5l8 4.5 8-4.5" />
        </svg>
    )
}

export default function TopBar({ versions, version, onVersionChange }) {
    const { signOut } = UserAuth()
    const navigate = useNavigate()

    async function handleSignOut() {
        await signOut()
        navigate("/signin")
    }

    return (
        <header className="home-topbar">
            <Link className="home-brand" to="/dashboard" aria-label="ModPunch home">
                <span className="home-brand-mark">
                    <img src="/favicon.png" alt="" />
                </span>
                <span className="home-wordmark">
                    <strong>
                        MOD<span>PUNCH</span><sup>®</sup>
                    </strong>
                    <small>MINECRAFT MODS</small>
                </span>
            </Link>

            <div className="home-topbar-actions">
                <VersionPicker versions={versions} value={version} onChange={onVersionChange} />
                <Link className="home-sign-out home-profile-link" to="/profile">
                    Profile
                </Link>
                <button type="button" className="home-sign-out" onClick={handleSignOut}>
                    Sign out
                </button>
            </div>
        </header>
    )
}