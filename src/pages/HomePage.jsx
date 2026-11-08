import "../styles/home.css"
import { useEffect, useState } from "react"
import TopBar from "../components/home/TopBar"
import CategoryChips from "../components/home/CategoryChips"
import ModGrid from "../components/home/ModGrid"
import { loadModIndex, getAllVersions, getModsForVersion } from "../services/modQueries"

export default function HomePage() {
    const [ready, setReady] = useState(false)
    const [error, setError] = useState("")
    const [category, setCategory] = useState("All")

    useEffect(() => {
        loadModIndex()
        .then(() => setReady(true))
        .catch((err) => setError(err.message))
    }, [])

    if (error) return <div className="home"><main><p>{error}</p></main></div>
    if (!ready) return <div className="home"><main><p>Loading mods…</p></main></div>

    const version = getAllVersions()[0]
    const { results, total } = getModsForVersion(version, { category })

    return (
        <div className="home">
            <TopBar />
            <main>
            <header className="home-heading">
                <div className="home-eyebrow">
                    <span/>
                    MOD BROWSER
                </div>

                <div className="home-title-row">
                    <h1>Mods for {version}</h1>
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