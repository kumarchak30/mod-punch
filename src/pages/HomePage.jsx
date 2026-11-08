import "../styles/home.css"
import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import { UserAuth } from "../context/AuthContext.jsx"
import TopBar from "../components/home/TopBar"
import CategoryChips from "../components/home/CategoryChips"
import ModGrid from "../components/home/ModGrid"
import { loadModIndex, getAllVersions, getModsForVersion } from "../services/modQueries"
import { useSplayHistory } from "../hooks/useSplayHistory.js"

export default function HomePage() {
    const [ready, setReady] = useState(false)
    const [error, setError] = useState("")
    const [version, setVersion] = useState("")
    const [category, setCategory] = useState("All")
    const [limit, setLimit] = useState(20) // how many cards to show
    const { session } = UserAuth()

    // saved mods live in a splay tree shared with the profile page ("Your essentials")
    const savedMods = useSplayHistory(`modpunch:${session?.user?.id ?? "guest"}:mods`)

    function toggleSave(mod) {
        if (savedMods.has(mod.project_id)) savedMods.remove(mod.project_id)
        else savedMods.touch(mod.project_id, { title: mod.title, category: mod.tags?.[0] ?? "mod" })
    }

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
    const { results, total } = getModsForVersion(currentVersion, { category, limit }) // added limit

    async function handleVersionChange(v) {
        setVersion(v)
        setCategory("All") // start fresh for the new version
        setLimit(20)       // back to the first 20

        const { error } = await supabase.auth.updateUser({
            data: { preferred_version: v },
        })
        if (error) console.error("Could not save version:", error)
    }

    // changing category also goes back to the first 20
    function handleCategoryChange(c) {
        setCategory(c)
        setLimit(20)
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
                        <div className="home-eyebrow">MOD BROWSER</div>
                    </div>
                    <div className="home-title-row">
                        <h1>Mods for {currentVersion}</h1>
                        <span className="home-result-count">{total.toLocaleString()} results</span>
                    </div>
                    <p>Most downloaded first. Pick a category to narrow it down.</p>
                </header>
                <CategoryChips activeCategory={category} onChange={handleCategoryChange} />
                <ModGrid mods={results} isSaved={savedMods.has} onToggleSave={toggleSave} />

                {results.length < total && (
                    <button
                        type="button"
                        className="home-load-more"
                        onClick={() => setLimit(limit + 20)}
                    >
                        Load more
                        <span>{(total - results.length).toLocaleString()} left</span>
                    </button>
                )}
            </main>
        </div>
    )
}