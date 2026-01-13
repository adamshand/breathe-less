import { describe, expect, it } from 'vitest'

import type { BreathingSession } from './index'

import {
	convertSessionsToCSV,
	EXPECTED_CSV_HEADERS,
	localTimeToUTC,
	parseCSV,
	parseCSVRow,
	validateAndParseCSV,
	validateCSVHeaders,
} from './index'

describe('parseCSV', () => {
	it('parses simple CSV without quotes', () => {
		const csv = 'a,b,c\n1,2,3'
		const result = parseCSV(csv)
		expect(result).toEqual([
			['a', 'b', 'c'],
			['1', '2', '3'],
		])
	})

	it('handles quoted fields with commas', () => {
		const csv = 'name,note\nJohn,"hello, world"'
		const result = parseCSV(csv)
		expect(result).toEqual([
			['name', 'note'],
			['John', 'hello, world'],
		])
	})

	it('handles escaped quotes within quoted fields', () => {
		const csv = 'name,note\nJohn,"He said ""hello"""'
		const result = parseCSV(csv)
		expect(result).toEqual([
			['name', 'note'],
			['John', 'He said "hello"'],
		])
	})

	it('handles empty fields', () => {
		const csv = 'a,b,c\n1,,3'
		const result = parseCSV(csv)
		expect(result).toEqual([
			['a', 'b', 'c'],
			['1', '', '3'],
		])
	})

	it('handles empty input', () => {
		const result = parseCSV('')
		expect(result).toEqual([])
	})

	it('skips blank lines', () => {
		const csv = 'a,b\n\n1,2\n\n'
		const result = parseCSV(csv)
		expect(result).toEqual([
			['a', 'b'],
			['1', '2'],
		])
	})

	it('handles single column', () => {
		const csv = 'value\n1\n2'
		const result = parseCSV(csv)
		expect(result).toEqual([['value'], ['1'], ['2']])
	})
})

describe('localTimeToUTC', () => {
	it('converts local time in browser timezone', () => {
		const result = localTimeToUTC('2026-01-13', '08:30')
		expect(result).toBeInstanceOf(Date)
		expect(result.getTime()).not.toBeNaN()
	})

	it('handles midnight correctly', () => {
		const result = localTimeToUTC('2026-01-13', '00:00')
		expect(result).toBeInstanceOf(Date)
		expect(result.getTime()).not.toBeNaN()
	})

	it('handles end of day correctly', () => {
		const result = localTimeToUTC('2026-01-13', '23:59')
		expect(result).toBeInstanceOf(Date)
		expect(result.getTime()).not.toBeNaN()
	})
})

describe('parseCSVRow', () => {
	const headers = EXPECTED_CSV_HEADERS.join(',')

	it('parses row with UTC datetime (ignores local fields)', () => {
		const csvText = `${headers}
2026-01-08T18:16:19.548Z,2026-01-08,18:16,UTC,mcp,0,0,18,0,0,0,0,`

		const rows = parseCSV(csvText)
		const result = parseCSVRow(rows[1], 0)

		expect(result.error).toBeNull()
		expect(result.session?.exerciseType).toBe('mcp')
		expect(result.session?.controlPause1).toBe(18)
		expect(result.session?.date.toISOString()).toBe('2026-01-08T18:16:19.548Z')
	})

	it('parses row with local date/time when UTC is empty', () => {
		const csvText = `${headers}
,2026-01-08,08:30,Pacific/Auckland,classical,60,58,20,25,30,35,40,test note`

		const rows = parseCSV(csvText)
		const result = parseCSVRow(rows[1], 0)

		expect(result.error).toBeNull()
		expect(result.session?.exerciseType).toBe('classical')
		expect(result.session?.controlPause1).toBe(20)
		expect(result.session?.localDate).toBe('2026-01-08')
		expect(result.session?.localTime).toBe('08:30')
		expect(result.session?.timezone).toBe('Pacific/Auckland')
	})

	it('uses browser timezone when timezone column is empty', () => {
		const csvText = `${headers}
,2026-01-08,08:30,,classical,60,58,20,25,30,35,40,`

		const rows = parseCSV(csvText)
		const result = parseCSVRow(rows[1], 0)

		expect(result.error).toBeNull()
		expect(result.session?.localDate).toBe('2026-01-08')
		expect(result.session?.localTime).toBe('08:30')
		// Timezone should be set to browser's timezone
		expect(result.session?.timezone).toBeTruthy()
	})

	it('returns error when both UTC and local date/time are empty', () => {
		const csvText = `${headers}
,,,,classical,60,58,20,25,30,35,40,test`

		const rows = parseCSV(csvText)
		const result = parseCSVRow(rows[1], 0)

		expect(result.error).toContain('Missing both UTC and LocalDate/LocalTime')
		expect(result.session).toBeNull()
	})

	it('returns error for invalid UTC datetime', () => {
		const csvText = `${headers}
invalid-date,2026-01-08,08:30,UTC,classical,60,58,20,25,30,35,40,`

		const rows = parseCSV(csvText)
		const result = parseCSVRow(rows[1], 0)

		expect(result.error).toContain('Invalid UTC datetime')
		expect(result.session).toBeNull()
	})

	it('parses all exercise types correctly', () => {
		const types = ['classical', 'diminished', 'mcp'] as const
		for (const type of types) {
			const csvText = `${headers}
2026-01-08T18:16:19.548Z,2026-01-08,18:16,UTC,${type},0,0,20,25,30,35,40,`

			const rows = parseCSV(csvText)
			const result = parseCSVRow(rows[1], 0)

			expect(result.error).toBeNull()
			expect(result.session?.exerciseType).toBe(type)
		}
	})

	it('handles case-insensitive exercise types', () => {
		const csvText = `${headers}
2026-01-08T18:16:19.548Z,2026-01-08,18:16,UTC,CLASSICAL,60,58,20,25,30,35,40,`

		const rows = parseCSV(csvText)
		const result = parseCSVRow(rows[1], 0)

		expect(result.error).toBeNull()
		expect(result.session?.exerciseType).toBe('classical')
	})

	it('returns error for incorrect column count', () => {
		const row = ['only', 'three', 'columns']
		const result = parseCSVRow(row, 5)

		expect(result.error).toContain('Row 6')
		expect(result.error).toContain(
			`Expected ${EXPECTED_CSV_HEADERS.length} columns`,
		)
		expect(result.session).toBeNull()
	})

	it('handles non-numeric values as 0', () => {
		const csvText = `${headers}
2026-01-08T18:16:19.548Z,2026-01-08,18:16,UTC,classical,abc,58,abc,25,30,35,40,`

		const rows = parseCSV(csvText)
		const result = parseCSVRow(rows[1], 0)

		expect(result.error).toBeNull()
		expect(result.session?.pulse1).toBe(0)
		expect(result.session?.controlPause1).toBe(0)
	})

	it('handles empty numeric values as 0', () => {
		const csvText = `${headers}
2026-01-08T18:16:19.548Z,2026-01-08,18:16,UTC,classical,,,,,,,,`

		const rows = parseCSV(csvText)
		const result = parseCSVRow(rows[1], 0)

		expect(result.error).toBeNull()
		expect(result.session?.pulse1).toBe(0)
		expect(result.session?.controlPause1).toBe(0)
	})

	it('parses note correctly', () => {
		const csvText = `${headers}
2026-01-08T18:16:19.548Z,2026-01-08,18:16,UTC,classical,60,58,20,25,30,35,40,my test note`

		const rows = parseCSV(csvText)
		const result = parseCSVRow(rows[1], 0)

		expect(result.error).toBeNull()
		expect(result.session?.note).toBe('my test note')
	})
})

describe('validateCSVHeaders', () => {
	it('validates correct headers', () => {
		expect(validateCSVHeaders(EXPECTED_CSV_HEADERS)).toBe(true)
	})

	it('rejects invalid headers', () => {
		expect(validateCSVHeaders(['wrong', 'headers'])).toBe(false)
	})

	it('rejects empty headers', () => {
		expect(validateCSVHeaders([])).toBe(false)
	})

	it('rejects headers with wrong column count', () => {
		const wrongCount = ['UTC', 'LocalDate', 'LocalTime']
		expect(validateCSVHeaders(wrongCount)).toBe(false)
	})

	it('rejects legacy format headers', () => {
		const legacyHeaders = [
			'DateTime',
			'Exercise Type',
			'Control Pause 1',
			'Max Pause 1',
			'Max Pause 2',
			'Max Pause 3',
			'Control Pause 2',
			'Note',
			'Pulse 1',
			'Pulse 2',
		]
		expect(validateCSVHeaders(legacyHeaders)).toBe(false)
	})
})

describe('validateAndParseCSV', () => {
	const headers = EXPECTED_CSV_HEADERS.join(',')

	it('parses valid CSV with UTC datetime', () => {
		const csv = `${headers}
2026-01-08T18:16:19.548Z,2026-01-08,18:16,UTC,classical,60,58,20,25,30,35,40,test
2026-01-09T10:00:00.000Z,2026-01-09,10:00,UTC,mcp,0,0,18,0,0,0,0,`

		const result = validateAndParseCSV(csv)

		expect(result.isValid).toBe(true)
		expect(result.sessions).toHaveLength(2)
		expect(result.errors).toHaveLength(0)
		expect(result.skippedRows).toBe(0)
	})

	it('parses valid CSV with local date/time only', () => {
		const csv = `${headers}
,2026-01-08,08:30,Pacific/Auckland,classical,60,58,20,25,30,35,40,test`

		const result = validateAndParseCSV(csv)

		expect(result.isValid).toBe(true)
		expect(result.sessions).toHaveLength(1)
		expect(result.sessions[0].localDate).toBe('2026-01-08')
		expect(result.sessions[0].localTime).toBe('08:30')
	})

	it('returns error for empty CSV', () => {
		const result = validateAndParseCSV('')

		expect(result.isValid).toBe(false)
		expect(result.errors).toContain('CSV file is empty')
	})

	it('returns error for invalid headers', () => {
		const csv = 'wrong,headers\n1,2'

		const result = validateAndParseCSV(csv)

		expect(result.isValid).toBe(false)
		expect(result.errors[0]).toContain('headers do not match')
	})

	it('handles mixed valid and invalid rows', () => {
		const csv = `${headers}
2026-01-08T18:16:19.548Z,2026-01-08,18:16,UTC,classical,60,58,20,25,30,35,40,test
bad,row
2026-01-09T10:00:00.000Z,2026-01-09,10:00,UTC,mcp,0,0,18,0,0,0,0,`

		const result = validateAndParseCSV(csv)

		expect(result.isValid).toBe(true)
		expect(result.sessions).toHaveLength(2)
		expect(result.errors).toHaveLength(1)
		expect(result.skippedRows).toBe(1)
	})

	it('is valid with headers only (no data rows)', () => {
		const csv = headers

		const result = validateAndParseCSV(csv)

		expect(result.isValid).toBe(true)
		expect(result.sessions).toHaveLength(0)
	})
})

describe('convertSessionsToCSV', () => {
	it('converts sessions to CSV format', () => {
		const sessions: BreathingSession[] = [
			{
				controlPause1: 20,
				controlPause2: 25,
				date: new Date('2026-01-08T18:16:19.548Z'),
				exerciseType: 'classical',
				id: '123',
				localDate: '2026-01-08',
				localTime: '18:16',
				maxPause1: 30,
				maxPause2: 35,
				maxPause3: 40,
				note: 'test note',
				pulse1: 60,
				pulse2: 58,
				timezone: 'UTC',
			},
		]

		const csv = convertSessionsToCSV(sessions)
		const lines = csv.split('\n')

		expect(lines[0]).toBe(EXPECTED_CSV_HEADERS.join(','))
		expect(lines[1]).toContain('2026-01-08T18:16:19.548Z')
		expect(lines[1]).toContain('2026-01-08')
		expect(lines[1]).toContain('18:16')
		expect(lines[1]).toContain('UTC')
		expect(lines[1]).toContain('classical')
		expect(lines[1]).toContain('test note')
	})

	it('exports columns in correct order', () => {
		const sessions: BreathingSession[] = [
			{
				controlPause1: 20,
				controlPause2: 25,
				date: new Date('2026-01-08T18:16:19.548Z'),
				exerciseType: 'classical',
				id: '123',
				localDate: '2026-01-08',
				localTime: '18:16',
				maxPause1: 30,
				maxPause2: 35,
				maxPause3: 40,
				note: 'test note',
				pulse1: 60,
				pulse2: 58,
				timezone: 'Pacific/Auckland',
			},
		]

		const csv = convertSessionsToCSV(sessions)
		const lines = csv.split('\n')
		const values = lines[1].split(',')

		// UTC,LocalDate,LocalTime,Timezone,Exercise Type,Pulse 1,Pulse 2,Control Pause 1,Control Pause 2,Max Pause 1,Max Pause 2,Max Pause 3,Note
		expect(values[0]).toBe('2026-01-08T18:16:19.548Z')
		expect(values[1]).toBe('2026-01-08')
		expect(values[2]).toBe('18:16')
		expect(values[3]).toBe('Pacific/Auckland')
		expect(values[4]).toBe('classical')
		expect(values[5]).toBe('60') // Pulse 1
		expect(values[6]).toBe('58') // Pulse 2
		expect(values[7]).toBe('20') // CP1
		expect(values[8]).toBe('25') // CP2
		expect(values[9]).toBe('30') // MP1
		expect(values[10]).toBe('35') // MP2
		expect(values[11]).toBe('40') // MP3
		expect(values[12]).toBe('test note')
	})

	it('escapes values with commas', () => {
		const sessions: BreathingSession[] = [
			{
				controlPause1: 20,
				controlPause2: 25,
				date: new Date('2026-01-08T18:16:19.548Z'),
				exerciseType: 'classical',
				id: '123',
				localDate: '2026-01-08',
				localTime: '18:16',
				maxPause1: 30,
				maxPause2: 35,
				maxPause3: 40,
				note: 'hello, world',
				pulse1: 60,
				pulse2: 58,
				timezone: 'UTC',
			},
		]

		const csv = convertSessionsToCSV(sessions)

		expect(csv).toContain('"hello, world"')
	})

	it('handles empty sessions array', () => {
		const csv = convertSessionsToCSV([])
		const lines = csv.split('\n')

		expect(lines).toHaveLength(1)
		expect(lines[0]).toBe(EXPECTED_CSV_HEADERS.join(','))
	})

	it('round-trips through parse and convert', () => {
		const originalSessions: BreathingSession[] = [
			{
				controlPause1: 20,
				controlPause2: 25,
				date: new Date('2026-01-08T18:16:19.548Z'),
				exerciseType: 'classical',
				id: '123',
				localDate: '2026-01-08',
				localTime: '18:16',
				maxPause1: 30,
				maxPause2: 35,
				maxPause3: 40,
				note: 'test',
				pulse1: 60,
				pulse2: 58,
				timezone: 'UTC',
			},
			{
				controlPause1: 18,
				controlPause2: 0,
				date: new Date('2026-01-09T07:00:00.000Z'),
				exerciseType: 'mcp',
				id: '456',
				localDate: '2026-01-09',
				localTime: '07:00',
				maxPause1: 0,
				maxPause2: 0,
				maxPause3: 0,
				note: '',
				pulse1: 0,
				pulse2: 0,
				timezone: 'UTC',
			},
		]

		const csv = convertSessionsToCSV(originalSessions)
		const result = validateAndParseCSV(csv)

		expect(result.isValid).toBe(true)
		expect(result.sessions).toHaveLength(2)
		expect(result.sessions[0].controlPause1).toBe(20)
		expect(result.sessions[0].exerciseType).toBe('classical')
		expect(result.sessions[0].date.toISOString()).toBe(
			'2026-01-08T18:16:19.548Z',
		)
		expect(result.sessions[1].controlPause1).toBe(18)
		expect(result.sessions[1].exerciseType).toBe('mcp')
	})
})
