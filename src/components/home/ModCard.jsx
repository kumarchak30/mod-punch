
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