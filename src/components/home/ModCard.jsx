/* formats downloads for the mods */
function formatDownloads(downloads) {
    if (typeof downloads !== "number") return ""
    if (downloads >= 1000000) {
        const value = downloads / 1000000
        return `${Number.isInteger(value) ? value : value.toFixed(1)}M`
    }
    if (downloads >= 1000) {
        const value = downloads / 1000
        return `${Number.isInteger(value) ? value : value.toFixed(1)}K`
    }
    return String(downloads)
}

export default function ModCard({ mod, saved = false, onToggleSave }) {
    if (!mod) return null
    const mark = mod.title
    ? mod.title
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : ""

    return (
        /* handling the download count mod name and loader list to be put onto the card */
        <article className="mod-card">
            <div className="mod-card-top">
                {mark && (
                <div className="mod-mark">
                    <span>{mark}</span>
                </div>
                )}
                {typeof mod.downloads === "number" && (
                <span className="download-count">
                    {formatDownloads(mod.downloads)} downloads
                </span>
                )}
            </div>

            {mod.title && <h3>{mod.title}</h3>}
            {mod.description && <p>{mod.description}</p>}
            {mod.tags?.length > 0 && (
                <div className="tag-list">
                    {mod.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                    ))}
                </div>
            )}
            <div className="mod-card-footer">
                {mod.loaders?.length > 0 && (
                    <div className="loader-list">{mod.loaders.join(" · ")}</div>
                )}
                {onToggleSave && (
                    <button
                        type="button"
                        className={`mod-save${saved ? " saved" : ""}`}
                        aria-pressed={saved}
                        onClick={() => onToggleSave(mod)}
                    >
                        {saved ? "✓ Saved" : "+ Save"}
                    </button>
                )}
            </div>
        </article>
    )
}
