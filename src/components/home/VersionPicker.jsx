import { useEffect, useRef, useState } from "react"

// text box + dropdown for the user to choose a Minecraft version
export default function VersionPicker({ versions, value, onChange }) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState(value)
    const pickerRef = useRef(null)

    // keep the text box in sync if the version changes from outside
    useEffect(() => setQuery(value), [value])

    // close the menu (and undo unfinished typing) when clicking outside
    useEffect(() => {
        function closePicker(event) {
            if (!pickerRef.current?.contains(event.target)) {
                setOpen(false)
                setQuery(value)
            }
        }
        document.addEventListener("mousedown", closePicker)
        return () => document.removeEventListener("mousedown", closePicker)
    }, [value])

    // shows every version until the user specifies one
    const typed = query.trim()
    const matches = typed === value ? versions : versions.filter((v) => v.startsWith(typed))

    function selectVersion(version) {
        onChange(version)
        setQuery(version)
        setOpen(false)
    }

    return (
        <div className="home-version-picker" ref={pickerRef}>
            <label htmlFor="version-search">Minecraft version</label>
            <div className={`home-version-input ${open ? "open" : ""}`}>
                <input
                    id="version-search"
                    value={query}
                    onFocus={(event) => {
                        event.target.select()
                        setOpen(true)
                    }}
                    onClick={() => setOpen(true)}
                    onChange={(event) => {
                        setQuery(event.target.value)
                        setOpen(true)
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            setOpen(false)
                            setQuery(value)
                        }
                        if (event.key === "Enter" && matches.length > 0) {
                            // gets exact match or otherwise newest one
                            selectVersion(matches.includes(typed) ? typed : matches[0])
                        }
                    }}
                    role="combobox"
                    aria-expanded={open}
                    aria-controls="version-options"
                    aria-autocomplete="list"
                    autoComplete="off"
                />
                <svg aria-hidden="true" viewBox="0 0 20 20">
                    <path d="m6 8 4 4 4-4" />
                </svg>
            </div>

            {open && (
                <div className="home-version-menu" id="version-options" role="listbox">
                    {matches.length > 0 ? (
                        matches.map((version) => (
                            <button
                                type="button"
                                key={version}
                                className={version === value ? "selected" : ""}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => selectVersion(version)}
                                role="option"
                                aria-selected={version === value}
                            >
                                <span>{version}</span>
                                {version === value && <span className="check">✓</span>}
                            </button>
                        ))
                    ) : (
                        <p>No matching version</p>
                    )}
                </div>
            )}
        </div>
    )
}