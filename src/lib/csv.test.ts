import { describe, expect, it } from 'vitest'

import {
	convertSessionsToCSV,
	EXPECTED_CSV_HEADERS,
	parseCSV,
	parseCSVRow,
	validateAndParseCSV,
	validateCSVHeaders,
} from './index'
import type { BreathingSession } from './index'

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

describe('parseCSVRow', () => {
	it('parses current format with mcp exercise type', () => {
		const csvText = `DateTime,Exercise Type,Control Pause 1,Max Pause 1,Max Pause 2,Max Pause 3,Control Pause 2,Note,Pulse 1,Pulse 2
2026-01-08T18:16:19.548Z,mcp,18,0,0,0,0,,0,0`

		const rows = parseCSV(csvText)
		const result = parseCSVRow(rows[1], 0)

		expect(result.error).toBeNull()
		expect(result.session?.exerciseType).toBe('mcp')
		expect(result.session?.controlPause1).toBe(18)
	})

	it('parses current format with classical exercise type', () => {
		const csvText = `DateTime,Exercise Type,Control Pause 1,Max Pause 1,Max Pause 2,Max Pause 3,Control Pause 2,Note,Pulse 1,Pulse 2
2026-01-08T18:16:19.548Z,classical,20,30,35,40,25,test note,60,58`

		const rows = parseCSV(csvText)
		const result = parseCSVRow(rows[1], 0)

		expect(result.error).toBeNull()
		expect(result.session?.exerciseType).toBe('classical')
		expect(result.session?.controlPause1).toBe(20)
		expect(result.session?.maxPause1).toBe(30)
		expect(result.session?.note).toBe('test note')
	})

	it('parses current format with diminished exercise type', () => {
		const csvText = `DateTime,Exercise Type,Control Pause 1,Max Pause 1,Max Pause 2,Max Pause 3,Control Pause 2,Note,Pulse 1,Pulse 2
2026-01-08T18:16:19.548Z,diminished,22,0,0,0,24,,65,62`

		const rows = parseCSV(csvText)
		const result = parseCSVRow(rows[1], 0)

		expect(result.error).toBeNull()
		expect(result.session?.exerciseType).toBe('diminished')
		expect(result.session?.controlPause1).toBe(22)
		expect(result.session?.controlPause2).toBe(24)
	})

	it('parses legacy v2 format (no exercise type column)', () => {
		// Legacy v2: DateTime, CP1, MP1, MP2, MP3, CP2, Note, PersonalBest, P1, P2
		const csvText = `DateTime,Control Pause 1,Max Pause 1,Max Pause 2,Max Pause 3,Control Pause 2,Note,Personal Best,Pulse 1,Pulse 2
2026-01-08T18:16:19.548Z,20,30,35,40,25,test note,40,60,58`

		const rows = parseCSV(csvText)
		const result = parseCSVRow(rows[1], 0)

		expect(result.error).toBeNull()
		expect(result.session?.exerciseType).toBe('classical')
		expect(result.session?.controlPause1).toBe(20)
		expect(result.session?.maxPause1).toBe(30)
		expect(result.session?.maxPause2).toBe(35)
		expect(result.session?.maxPause3).toBe(40)
		expect(result.session?.controlPause2).toBe(25)
		expect(result.session?.note).toBe('test note')
		expect(result.session?.pulse1).toBe(60)
		expect(result.session?.pulse2).toBe(58)
	})

	it('parses legacy v1 format (separate date and time columns)', () => {
		// Legacy v1: Date, Time, CP1, MP1, MP2, MP3, CP2, Note, PersonalBest, P1, P2
		const row = [
			'2026-01-08',
			'18:16:19',
			'20',
			'30',
			'35',
			'40',
			'25',
			'test note',
			'45',
			'60',
			'58',
		]
		const result = parseCSVRow(row, 0)

		expect(result.error).toBeNull()
		expect(result.session?.exerciseType).toBe('classical')
		expect(result.session?.controlPause1).toBe(20)
		expect(result.session?.pulse1).toBe(60)
	})

	it('returns error for incorrect column count', () => {
		const row = ['only', 'three', 'columns']
		const result = parseCSVRow(row, 5)

		expect(result.error).toContain('Row 6')
		expect(result.error).toContain('Expected 10 columns')
		expect(result.session).toBeNull()
	})

	it('handles non-numeric values as 0', () => {
		const csvText = `DateTime,Exercise Type,Control Pause 1,Max Pause 1,Max Pause 2,Max Pause 3,Control Pause 2,Note,Pulse 1,Pulse 2
2026-01-08T18:16:19.548Z,classical,abc,30,35,40,25,test note,60,58`

		const rows = parseCSV(csvText)
		const result = parseCSVRow(rows[1], 0)

		expect(result.error).toBeNull()
		expect(result.session?.controlPause1).toBe(0)
	})

	it('handles empty numeric values as 0', () => {
		const csvText = `DateTime,Exercise Type,Control Pause 1,Max Pause 1,Max Pause 2,Max Pause 3,Control Pause 2,Note,Pulse 1,Pulse 2
2026-01-08T18:16:19.548Z,classical,,30,35,40,25,test note,60,58`

		const rows = parseCSV(csvText)
		const result = parseCSVRow(rows[1], 0)

		expect(result.error).toBeNull()
		expect(result.session?.controlPause1).toBe(0)
	})

	it('handles case-insensitive exercise types', () => {
		const csvText = `DateTime,Exercise Type,Control Pause 1,Max Pause 1,Max Pause 2,Max Pause 3,Control Pause 2,Note,Pulse 1,Pulse 2
2026-01-08T18:16:19.548Z,CLASSICAL,20,30,35,40,25,,60,58`

		const rows = parseCSV(csvText)
		const result = parseCSVRow(rows[1], 0)

		expect(result.error).toBeNull()
		expect(result.session?.exerciseType).toBe('classical')
	})
})

describe('validateCSVHeaders', () => {
	it('validates current format headers', () => {
		expect(validateCSVHeaders(EXPECTED_CSV_HEADERS)).toBe(true)
	})

	it('validates legacy v1 headers', () => {
		const legacyHeaders = [
			'Date',
			'Time',
			'Control Pause 1',
			'Max Pause 1',
			'Max Pause 2',
			'Max Pause 3',
			'Control Pause 2',
			'Note',
			'Personal Best MP3',
			'Pulse 1',
			'Pulse 2',
		]
		expect(validateCSVHeaders(legacyHeaders)).toBe(true)
	})

	it('validates legacy v2 headers', () => {
		const legacyV2Headers = [
			'DateTime',
			'Control Pause 1',
			'Max Pause 1',
			'Max Pause 2',
			'Max Pause 3',
			'Control Pause 2',
			'Note',
			'Personal Best MP3',
			'Pulse 1',
			'Pulse 2',
		]
		expect(validateCSVHeaders(legacyV2Headers)).toBe(true)
	})

	it('rejects invalid headers', () => {
		expect(validateCSVHeaders(['wrong', 'headers'])).toBe(false)
	})

	it('rejects empty headers', () => {
		expect(validateCSVHeaders([])).toBe(false)
	})

	it('rejects headers with wrong column count', () => {
		const wrongCount = ['DateTime', 'Exercise Type', 'Control Pause 1']
		expect(validateCSVHeaders(wrongCount)).toBe(false)
	})
})

describe('validateAndParseCSV', () => {
	it('parses valid CSV with current format', () => {
		const csv = `DateTime,Exercise Type,Control Pause 1,Max Pause 1,Max Pause 2,Max Pause 3,Control Pause 2,Note,Pulse 1,Pulse 2
2026-01-08T18:16:19.548Z,classical,20,30,35,40,25,test,60,58
2026-01-09T10:00:00.000Z,mcp,18,0,0,0,0,,0,0`

		const result = validateAndParseCSV(csv)

		expect(result.isValid).toBe(true)
		expect(result.sessions).toHaveLength(2)
		expect(result.errors).toHaveLength(0)
		expect(result.skippedRows).toBe(0)
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
		const csv = `DateTime,Exercise Type,Control Pause 1,Max Pause 1,Max Pause 2,Max Pause 3,Control Pause 2,Note,Pulse 1,Pulse 2
2026-01-08T18:16:19.548Z,classical,20,30,35,40,25,test,60,58
bad,row
2026-01-09T10:00:00.000Z,mcp,18,0,0,0,0,,0,0`

		const result = validateAndParseCSV(csv)

		expect(result.isValid).toBe(true)
		expect(result.sessions).toHaveLength(2)
		expect(result.errors).toHaveLength(1)
		expect(result.skippedRows).toBe(1)
	})

	it('is valid with headers only (no data rows)', () => {
		const csv = `DateTime,Exercise Type,Control Pause 1,Max Pause 1,Max Pause 2,Max Pause 3,Control Pause 2,Note,Pulse 1,Pulse 2`

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
				maxPause1: 30,
				maxPause2: 35,
				maxPause3: 40,
				note: 'test note',
				pulse1: 60,
				pulse2: 58,
			},
		]

		const csv = convertSessionsToCSV(sessions)
		const lines = csv.split('\n')

		expect(lines[0]).toBe(EXPECTED_CSV_HEADERS.join(','))
		expect(lines[1]).toContain('2026-01-08T18:16:19.548Z')
		expect(lines[1]).toContain('classical')
		expect(lines[1]).toContain('test note')
	})

	it('escapes values with commas', () => {
		const sessions: BreathingSession[] = [
			{
				controlPause1: 20,
				controlPause2: 25,
				date: new Date('2026-01-08T18:16:19.548Z'),
				exerciseType: 'classical',
				id: '123',
				maxPause1: 30,
				maxPause2: 35,
				maxPause3: 40,
				note: 'hello, world',
				pulse1: 60,
				pulse2: 58,
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
				maxPause1: 30,
				maxPause2: 35,
				maxPause3: 40,
				note: 'test',
				pulse1: 60,
				pulse2: 58,
			},
			{
				controlPause1: 18,
				controlPause2: 0,
				date: new Date('2026-01-09T07:00:00.000Z'),
				exerciseType: 'mcp',
				id: '456',
				maxPause1: 0,
				maxPause2: 0,
				maxPause3: 0,
				note: '',
				pulse1: 0,
				pulse2: 0,
			},
		]

		const csv = convertSessionsToCSV(originalSessions)
		const result = validateAndParseCSV(csv)

		expect(result.isValid).toBe(true)
		expect(result.sessions).toHaveLength(2)
		expect(result.sessions[0].controlPause1).toBe(20)
		expect(result.sessions[0].exerciseType).toBe('classical')
		expect(result.sessions[1].controlPause1).toBe(18)
		expect(result.sessions[1].exerciseType).toBe('mcp')
	})
})
