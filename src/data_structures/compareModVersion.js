export function compareVersions(a, b) {
    const partsA = a.split(".").map(Number);
    const partsB = b.split(".").map(Number);
    const len = Math.max(partsA.length, partsB.length);

    for (let i = 0; i < len; i++) {
        const x = partsA[i] ?? 0;
        const y = partsB[i] ?? 0;
        if (x !== y) return x - y;
    }
    return 0;
}