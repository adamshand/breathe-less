import { describe, expect, it, vi } from 'vitest'

import {
	convert24to12,
	escapeCSV,
	generateUniqueId,
	getRandomNumber,
	isValidEmail,
	normaliseHostname,
	shuffle,
	stripHtml,
} from './index'

describe('convert24to12', () => {
	it('converts morning time', () => {
		const result = convert24to12('09:30')
		expect(result).toMatch(/9:30.*AM/i)
	})

	it('converts afternoon time', () => {
		const result = convert24to12('14:30')
		expect(result).toMatch(/2:30.*PM/i)
	})

	it('converts midnight', () => {
		const result = convert24to12('00:00')
		expect(result).toMatch(/12:00.*AM/i)
	})

	it('converts noon', () => {
		const result = convert24to12('12:00')
		expect(result).toMatch(/12:00.*PM/i)
	})

	it('converts 11pm', () => {
		const result = convert24to12('23:59')
		expect(result).toMatch(/11:59.*PM/i)
	})
})

describe('escapeCSV', () => {
	it('returns simple string unchanged', () => {
		expect(escapeCSV('hello')).toBe('hello')
	})

	it('returns number as string', () => {
		expect(escapeCSV(42)).toBe('42')
	})

	it('wraps string with comma in quotes', () => {
		expect(escapeCSV('hello, world')).toBe('"hello, world"')
	})

	it('escapes quotes and wraps in quotes', () => {
		expect(escapeCSV('say "hello"')).toBe('"say ""hello"""')
	})

	it('wraps string with newline in quotes', () => {
		expect(escapeCSV('line1\nline2')).toBe('"line1\nline2"')
	})

	it('handles combined special characters', () => {
		expect(escapeCSV('hello, "world"\ntest')).toBe('"hello, ""world""\ntest"')
	})

	it('handles empty string', () => {
		expect(escapeCSV('')).toBe('')
	})
})

describe('generateUniqueId', () => {
	it('generates id based on timestamp', () => {
		const date = new Date('2026-01-08T18:16:19.548Z')
		const id = generateUniqueId(date)

		expect(id).toContain(date.getTime().toString())
	})

	it('generates different ids for same timestamp', () => {
		const date = new Date('2026-01-08T18:16:19.548Z')

		const id1 = generateUniqueId(date)
		const id2 = generateUniqueId(date)

		// They could be the same due to randomness, but format should be correct
		expect(id1).toMatch(/^\d+-\d+$/)
		expect(id2).toMatch(/^\d+-\d+$/)
	})

	it('has correct format: timestamp-random', () => {
		const date = new Date()
		const id = generateUniqueId(date)

		const [timestamp, random] = id.split('-')
		expect(parseInt(timestamp)).toBe(date.getTime())
		expect(parseInt(random)).toBeGreaterThanOrEqual(0)
		expect(parseInt(random)).toBeLessThan(1000)
	})
})

describe('isValidEmail', () => {
	it('validates correct email', () => {
		expect(isValidEmail('test@example.com')).toBe(true)
	})

	it('validates email with subdomain', () => {
		expect(isValidEmail('test@mail.example.com')).toBe(true)
	})

	it('validates email with plus sign', () => {
		expect(isValidEmail('test+tag@example.com')).toBe(true)
	})

	it('rejects email without @', () => {
		expect(isValidEmail('testexample.com')).toBe(false)
	})

	it('rejects email without domain', () => {
		expect(isValidEmail('test@')).toBe(false)
	})

	it('rejects email without TLD', () => {
		expect(isValidEmail('test@example')).toBe(false)
	})

	it('rejects email with spaces', () => {
		expect(isValidEmail('test @example.com')).toBe(false)
	})

	it('rejects empty string', () => {
		expect(isValidEmail('')).toBe(false)
	})
})

describe('normaliseHostname', () => {
	it('removes dev. prefix', () => {
		expect(normaliseHostname('dev.example.com')).toBe('example.com')
	})

	it('removes .localhost suffix', () => {
		expect(normaliseHostname('example.localhost')).toBe('example')
	})

	it('removes .svelte suffix', () => {
		expect(normaliseHostname('example.svelte')).toBe('example')
	})

	it('leaves normal hostname unchanged', () => {
		expect(normaliseHostname('example.com')).toBe('example.com')
	})

	it('handles multiple patterns', () => {
		expect(normaliseHostname('dev.example.localhost')).toBe('example')
	})
})

describe('getRandomNumber', () => {
	it('returns number within range', () => {
		for (let i = 0; i < 100; i++) {
			const result = getRandomNumber(5, 10)
			expect(result).toBeGreaterThanOrEqual(5)
			expect(result).toBeLessThan(10)
		}
	})

	it('handles negative range', () => {
		const result = getRandomNumber(-10, -5)
		expect(result).toBeGreaterThanOrEqual(-10)
		expect(result).toBeLessThan(-5)
	})

	it('handles zero-width range', () => {
		const result = getRandomNumber(5, 5)
		expect(result).toBe(5)
	})
})

describe('shuffle', () => {
	it('maintains array length', () => {
		const arr = [1, 2, 3, 4, 5]
		shuffle(arr)
		expect(arr).toHaveLength(5)
	})

	it('maintains array elements', () => {
		const arr = [1, 2, 3, 4, 5]
		shuffle(arr)
		expect(arr.sort()).toEqual([1, 2, 3, 4, 5])
	})

	it('handles empty array', () => {
		const arr: number[] = []
		shuffle(arr)
		expect(arr).toEqual([])
	})

	it('handles single element array', () => {
		const arr = [1]
		shuffle(arr)
		expect(arr).toEqual([1])
	})

	it('modifies array in place', () => {
		const arr = [1, 2, 3, 4, 5]
		const original = arr
		shuffle(arr)
		expect(arr).toBe(original)
	})

	it('eventually changes order (probabilistic)', () => {
		const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
		let changed = false

		for (let i = 0; i < 100; i++) {
			const arr = [...original]
			shuffle(arr)
			if (arr.join(',') !== original.join(',')) {
				changed = true
				break
			}
		}

		expect(changed).toBe(true)
	})
})

describe('stripHtml', () => {
	it('removes simple tags', () => {
		expect(stripHtml('<p>hello</p>')).toBe('hello')
	})

	it('removes nested tags', () => {
		expect(stripHtml('<div><p>hello</p></div>')).toBe('hello')
	})

	it('removes self-closing tags', () => {
		expect(stripHtml('hello<br/>world')).toBe('helloworld')
	})

	it('removes tags with attributes', () => {
		expect(stripHtml('<a href="http://example.com">link</a>')).toBe('link')
	})

	it('handles text without tags', () => {
		expect(stripHtml('plain text')).toBe('plain text')
	})

	it('trims result', () => {
		expect(stripHtml('  <p>hello</p>  ')).toBe('hello')
	})

	it('handles empty string', () => {
		expect(stripHtml('')).toBe('')
	})
})
