import "../styles/home.css"
import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import { UserAuth } from "../context/AuthContext.jsx"
import TopBar from "../components/home/TopBar"
import CategoryChips from "../components/home/CategoryChips"
import ModGrid from "../components/home/ModGrid"
import { loadModIndex, getAllVersions, getModsForVersion } from "../services/modQueries"

export default function HomePage() {
    const [ready, setReady] = useState(false)
    const [error, setError] = useState("")
    const [version, setVersion] = useState("")
    const [category, setCategory] = useState("All")
    const { session } = UserAuth()

    useEffect(() => {
        loadModIndex()
            .then(() => setReady(true))
            .catch((err) => setError(err.message))
    }, [])

    if (error) return <div className="home"><main><p>{error}</p></main></div>
    if (!ready) return <div className="home"><main><p>Loading mods…</p></main></div>

    const versions = getAllVersions()
    const savedVersion = session?.user?.user_metadata?.preferred_version
    const currentVersion =
        version ||                                               // picked during this visit
        (versions.includes(savedVersion) ? savedVersion : "") || // saved in Supabase
        versions[0]                                              // newest
    const { results, total } = getModsForVersion(currentVersion, { category })

    async function handleVersionChange(v) {
        setVersion(v)
        setCategory("All") // start fresh for the new version

        const { error } = await supabase.auth.updateUser({
            data: { preferred_version: v },
        })
        if (error) console.error("Could not save version:", error)
    }

    return (
        <div className="home">
            <TopBar
                versions={versions}
                version={currentVersion}
                onVersionChange={handleVersionChange}
            />
            <main>
                <header className="home-heading">
                    <div className="home-eyebrow">
                        <span />
                        MOD BROWSER
                    </div>
                    <div className="home-title-row">
                        <h1>Mods for {currentVersion}</h1>
                        <span className="home-result-count">{total.toLocaleString()} results</span>
                    </div>
                    <p>Most downloaded first. Pick a category to narrow it down.</p>
                </header>
                <CategoryChips activeCategory={category} onChange={setCategory} />
                <ModGrid mods={results} />
            </main>
        </div>
    )
}