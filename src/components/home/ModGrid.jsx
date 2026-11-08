import ModCard from "./ModCard"

export default function ModGrid({ mods, isSaved, onToggleSave }) {
    if (!mods?.length) {
        return (
        <div className="empty-results">
            <span>&gt;_</span>
            <h2>No mods found</h2>
            <p>Try another search or category.</p>
        </div>
        )
    }
    return (
        <div className="mod-grid">
        {mods.map((mod) => (
            <ModCard
                key={mod.project_id}
                mod={mod}
                saved={isSaved?.(mod.project_id)}
                onToggleSave={onToggleSave}
            />
        ))}
        </div>
    )
}