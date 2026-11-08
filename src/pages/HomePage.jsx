import "../styles/home.css"
import { useEffect, useState } from "react"
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
            <main>
                <h1>Mods for {version}</h1>
                <p>{total} results</p>
                <CategoryChips activeCategory={category} onChange={setCategory} />
                <ModGrid mods={results} />
            </main>
        </div>
    )
}