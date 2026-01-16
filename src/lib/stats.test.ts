import { describe, expect, it } from 'vitest'

import { median, percentile } from './stats'

describe('median', () => {
	it('returns 0 for empty array', () => {
		expect(median([])).toBe(0)
	})

	it('returns the single value for array of length 1', () => {
		expect(median([42])).toBe(42)
	})

	it('returns middle value for odd-length array', () => {
		expect(median([1, 3, 5])).toBe(3)
		expect(median([10, 20, 30, 40, 50])).toBe(30)
	})

	it('returns rounded average of two middle values for even-length array', () => {
		expect(median([1, 2, 3, 4])).toBe(3) // (2+3)/2 = 2.5, rounds to 3
		expect(median([10, 20, 30, 40])).toBe(25) // (20+30)/2 = 25
	})

	it('handles unsorted input', () => {
		expect(median([5, 1, 3])).toBe(3)
		expect(median([40, 10, 30, 20])).toBe(25)
	})

	it('does not mutate input array', () => {
		const input = [5, 1, 3]
		median(input)
		expect(input).toEqual([5, 1, 3])
	})

	it('handles duplicate values', () => {
		expect(median([5, 5, 5])).toBe(5)
		expect(median([1, 5, 5, 10])).toBe(5)
	})
})

describe('percentile', () => {
	it('returns 0 for empty array', () => {
		expect(percentile([], 50)).toBe(0)
	})

	it('returns the value for array of length 1', () => {
		expect(percentile([42], 0)).toBe(42)
		expect(percentile([42], 50)).toBe(42)
		expect(percentile([42], 100)).toBe(42)
	})

	it('returns min for 0th percentile', () => {
		expect(percentile([10, 20, 30, 40, 50], 0)).toBe(10)
	})

	it('returns max for 100th percentile', () => {
		expect(percentile([10, 20, 30, 40, 50], 100)).toBe(50)
	})

	it('returns median for 50th percentile', () => {
		expect(percentile([10, 20, 30, 40, 50], 50)).toBe(30)
	})

	it('calculates 25th percentile (Q1)', () => {
		expect(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 25)).toBe(3)
	})

	it('calculates 75th percentile (Q3)', () => {
		expect(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 75)).toBe(8)
	})

	it('handles unsorted input', () => {
		expect(percentile([50, 10, 40, 20, 30], 50)).toBe(30)
	})

	it('does not mutate input array', () => {
		const input = [50, 10, 40, 20, 30]
		percentile(input, 50)
		expect(input).toEqual([50, 10, 40, 20, 30])
	})

	it('interpolates between values', () => {
		expect(percentile([0, 100], 25)).toBe(25)
		expect(percentile([0, 100], 75)).toBe(75)
	})
})
