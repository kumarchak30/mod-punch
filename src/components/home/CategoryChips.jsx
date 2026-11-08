const categories = [
    "All",
    "Optimization",
    "Utility",
    "Adventure",
    "Decoration",
    "Game Mechanics",
    "Worldgen",
    "Technology",
    "Mobs",
    "Magic",
]
// takes mod categories and then changes when user clicks other category
export default function CategoryChips({ activeCategory, onChange }) {
    return (
        <div className="category-chips" aria-label="Mod categories">
        {categories.map((category) => (
            <button
                key={category}
                type="button"
                className={activeCategory === category ? "active" : ""}
                onClick={() => onChange(category)}
                aria-pressed={activeCategory === category}
                >
                {category}
            </button>
        ))}
        </div>
    )
}

