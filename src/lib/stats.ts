export function median(values: number[]): number {
	if (values.length === 0) return 0
	const sorted = [...values].sort((a, b) => a - b)
	const mid = Math.floor(sorted.length / 2)
	return sorted.length % 2 !== 0
		? sorted[mid]
		: Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

export function percentile(values: number[], p: number): number {
	if (values.length === 0) return 0
	const sorted = [...values].sort((a, b) => a - b)
	const index = (p / 100) * (sorted.length - 1)
	const lower = Math.floor(index)
	const upper = Math.ceil(index)
	if (lower === upper) return sorted[lower]
	const fraction = index - lower
	return Math.round(sorted[lower] + fraction * (sorted[upper] - sorted[lower]))
}
