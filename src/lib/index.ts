import md5 from 'md5'

export const yearRegex = /^\d{4}$/
export const blockUrlParamsRegex = /(action|calparms|do|highlight|rev)=/
export const blockUrlPathRegex =
	/wordpress|wp-(admin|content|json|includes|login|secvrity)|wp2|\.env|\.php|\.sql|\.git|src|cdn.js|\.vscode|asn\/\.well-known|wiki\/HelpOn|(ads|security)\.txt|.*\/feed$|index\.rss|^\/-/

export function convert24to12(time: string) {
	const [hours, minutes] = time.split(':').map(Number)
	const date = new Date()
	date.setHours(hours, minutes)
	return date.toLocaleTimeString('en-US', {
		hour: 'numeric',
		hour12: true,
		minute: 'numeric',
	})
}

export const formatLocalDate = (d: Date | string) => {
	const date = typeof d === 'string' ? new Date(d) : d
	if (isNaN(date.getTime())) {
		throw new Error('Invalid input date')
	}

	const locale = navigator.language
	const timeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone
	return new Date(d).toLocaleDateString(locale, {
		day: 'numeric',
		month: 'short',
		timeZone,
		year: 'numeric',
	})
}

export const formatLocalDateTime = (d: Date | string) => {
	const date = typeof d === 'string' ? new Date(d) : d
	if (isNaN(date.getTime())) {
		throw new Error('Invalid input date')
	}

	const locale = navigator.language
	const timeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone
	return new Date(d).toLocaleString(locale, {
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		month: 'short',
		timeZone,
		year: 'numeric',
	})
}

export const getGravatarUrl = (email: string) => {
	const hash = md5(email.trim().toLowerCase())
	return `https://gravatar.com/avatar/${hash}`
}

export function getOpenmojiUrl(
	id: string,
	palette: 'black' | 'color' = 'color',
) {
	const baseUrl = 'https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji'
	// const baseUrl = 'https://unpkg.com/openmoji';
	return `${baseUrl}/${palette}/svg/${id.toUpperCase()}.svg`
}

export const getRandomElement = <T>(arr: T[]): T => {
	return arr[Math.floor(Math.random() * arr.length)]
}

export function getRandomNumber(min: number, max: number) {
	return Math.random() * (max - min) + min
}

export const getYear = (d: string) => {
	// TODO if no parameter is provided, return current year,
	return new Date(d).toLocaleDateString('en-NZ', {
		year: 'numeric',
	})
}
export const isValidEmail = (email: string) => {
	return /^[^@\s]+@[^@\s]+\.[^@\s]+/.test(email)
}

export const normaliseHostname = (host: string) => {
	return host.replace(/^dev\.|\.localhost$|\.svelte$/g, '')
}
export const shuffle = <T>(array: T[]) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[array[i], array[j]] = [array[j], array[i]]
	}
}

// CSV Import utilities
export interface CSVValidationResult {
	errors: string[]
	isValid: boolean
	sessions: BreathingSession[]
	skippedRows: number
}

export function convertSessionsToCSV(sessions: BreathingSession[]): string {
	const csvLines = [EXPECTED_CSV_HEADERS.join(',')]

	sessions.forEach((session) => {
		const date = new Date(session.date)
		const row = [
			escapeCSV(date.toISOString()), // UTC: 2025-07-23T14:30:45.123Z
			escapeCSV(session.localDate), // LocalDate: 2025-07-23
			escapeCSV(session.localTime), // LocalTime: 14:30
			escapeCSV(session.timezone), // Timezone: Pacific/Auckland
			escapeCSV(session.exerciseType),
			escapeCSV(session.pulse1),
			escapeCSV(session.pulse2),
			escapeCSV(session.controlPause1),
			escapeCSV(session.controlPause2),
			escapeCSV(session.maxPause1),
			escapeCSV(session.maxPause2),
			escapeCSV(session.maxPause3),
			escapeCSV(session.note),
		]
		csvLines.push(row.join(','))
	})

	return csvLines.join('\n')
}

// Re-export BreathingSession from breathingStorage for CSV utilities
import {
	type BreathingSession,
	type ExerciseType,
	getLocalDateTime,
} from '$lib/breathingStorage'
export type { BreathingSession, ExerciseType }

export function downloadCSV(csvContent: string, filename: string): void {
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
	const link = document.createElement('a')

	if (link.download !== undefined) {
		const url = URL.createObjectURL(blob)
		link.setAttribute('href', url)
		link.setAttribute('download', filename)
		link.style.visibility = 'hidden'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(url)
	}
}

export function escapeCSV(value: number | string): string {
	const stringValue = String(value)
	// If the value contains commas, quotes, or newlines, wrap it in quotes and escape any quotes
	if (
		stringValue.includes(',') ||
		stringValue.includes('"') ||
		stringValue.includes('\n')
	) {
		return '"' + stringValue.replace(/"/g, '""') + '"'
	}
	return stringValue
}

export function shuffled<T>(array: T[]): T[] {
	shuffle(array)
	return array
}

export function stripHtml(str: string) {
	return str.replace(/<\/?[^>]+(>|$)/g, '').trim()
}

export const EXPECTED_CSV_HEADERS = [
	'UTC',
	'LocalDate',
	'LocalTime',
	'Timezone',
	'Exercise Type',
	'Pulse 1',
	'Pulse 2',
	'Control Pause 1',
	'Control Pause 2',
	'Max Pause 1',
	'Max Pause 2',
	'Max Pause 3',
	'Note',
]

export function generateUniqueId(date: Date): string {
	// Use timestamp plus small random component to avoid collisions
	const timestamp = date.getTime()
	const random = Math.floor(Math.random() * 1000)
	return `${timestamp}-${random}`
}

export function localTimeToUTC(
	localDate: string,
	localTime: string,
	timezone?: string,
): Date {
	const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
	const localDateTimeStr = `${localDate}T${localTime}:00`

	// Create a date in local time (browser's timezone)
	const localDateTime = new Date(localDateTimeStr)

	if (tz === Intl.DateTimeFormat().resolvedOptions().timeZone) {
		// If target timezone matches browser timezone, we're done
		return localDateTime
	}

	// For a different timezone, we need to calculate the offset difference
	// The trick: format the same instant in both timezones and compare
	const formatter = new Intl.DateTimeFormat('en-US', {
		day: '2-digit',
		hour: '2-digit',
		hour12: false,
		minute: '2-digit',
		month: '2-digit',
		second: '2-digit',
		timeZone: tz,
		year: 'numeric',
	})

	// Get a reference point - use the local datetime as a starting guess
	// We need to find what UTC time corresponds to localDate+localTime in the target timezone
	// Iterative approach: adjust until the formatted time in target TZ matches our desired local time

	// Start with the naive interpretation (as if it were browser local time)
	const utcGuess = localDateTime.getTime()

	// Format this UTC time in the target timezone
	const formatInTargetTz = (utcMs: number): string => {
		const parts = formatter.formatToParts(new Date(utcMs))
		const get = (type: string) =>
			parts.find((p) => p.type === type)?.value || ''
		return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`
	}

	// What time does our guess show in the target timezone?
	const formattedInTz = formatInTargetTz(utcGuess)

	// Compare with what we want
	const targetStr = `${localDate}T${localTime}:00`

	if (formattedInTz === targetStr) {
		return new Date(utcGuess)
	}

	// Calculate the difference and adjust
	const formattedDate = new Date(formattedInTz)
	const targetDate = new Date(targetStr)
	const diffMs = targetDate.getTime() - formattedDate.getTime()

	return new Date(utcGuess + diffMs)
}

export function parseCSV(csvText: string): string[][] {
	const lines = csvText.trim().split('\n')
	const result: string[][] = []

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim()
		if (!line) continue

		const row: string[] = []
		let currentField = ''
		let inQuotes = false
		let j = 0

		while (j < line.length) {
			const char = line[j]

			if (char === '"') {
				if (inQuotes && line[j + 1] === '"') {
					// Escaped quote
					currentField += '"'
					j += 2
				} else {
					// Toggle quote state
					inQuotes = !inQuotes
					j++
				}
			} else if (char === ',' && !inQuotes) {
				// Field separator
				row.push(currentField)
				currentField = ''
				j++
			} else {
				currentField += char
				j++
			}
		}

		// Add the last field
		row.push(currentField)
		result.push(row)
	}

	return result
}

export function parseCSVRow(
	row: string[],
	rowIndex: number,
): { error: null | string; session: BreathingSession | null } {
	// New format only: UTC,LocalDate,LocalTime,Timezone,Exercise Type,Pulse 1,Pulse 2,Control Pause 1,Control Pause 2,Max Pause 1,Max Pause 2,Max Pause 3,Note
	if (row.length !== EXPECTED_CSV_HEADERS.length) {
		return {
			error: `Row ${rowIndex + 1}: Expected ${EXPECTED_CSV_HEADERS.length} columns, got ${row.length}`,
			session: null,
		}
	}

	try {
		const utcStr = row[0].trim()
		const localDateStr = row[1].trim()
		const localTimeStr = row[2].trim()
		const timezoneStr = row[3].trim()

		let date: Date
		let localDate: string
		let localTime: string
		let timezone: string

		if (utcStr) {
			// UTC is present - use it as canonical, compute local from it
			date = new Date(utcStr)
			if (isNaN(date.getTime())) {
				return {
					error: `Row ${rowIndex + 1}: Invalid UTC datetime "${utcStr}"`,
					session: null,
				}
			}
			const local = getLocalDateTime(date)
			localDate = local.localDate
			localTime = local.localTime
			timezone = local.timezone
		} else if (localDateStr && localTimeStr) {
			// UTC is empty - compute from local date/time + timezone
			timezone = timezoneStr || Intl.DateTimeFormat().resolvedOptions().timeZone
			date = localTimeToUTC(localDateStr, localTimeStr, timezone)
			localDate = localDateStr
			localTime = localTimeStr
		} else {
			// Both UTC and local date/time are empty - error
			return {
				error: `Row ${rowIndex + 1}: Missing both UTC and LocalDate/LocalTime`,
				session: null,
			}
		}

		const parseNumber = (value: string): number => {
			const num = parseFloat(value.trim())
			return isNaN(num) ? 0 : num
		}

		const typeStr = row[4].trim().toLowerCase()
		let exerciseType: ExerciseType = 'classical'
		if (
			typeStr === 'classical' ||
			typeStr === 'diminished' ||
			typeStr === 'mcp'
		) {
			exerciseType = typeStr
		}

		const pulse1 = parseNumber(row[5])
		const pulse2 = parseNumber(row[6])
		const controlPause1 = parseNumber(row[7])
		const controlPause2 = parseNumber(row[8])
		const maxPause1 = parseNumber(row[9])
		const maxPause2 = parseNumber(row[10])
		const maxPause3 = parseNumber(row[11])
		const note = row[12].trim()

		const session: BreathingSession = {
			controlPause1,
			controlPause2,
			date,
			exerciseType,
			id: generateUniqueId(date),
			localDate,
			localTime,
			maxPause1,
			maxPause2,
			maxPause3,
			note,
			pulse1,
			pulse2,
			timezone,
		}

		return { error: null, session }
	} catch (error) {
		return {
			error: `Row ${rowIndex + 1}: Failed to parse data - ${error instanceof Error ? error.message : 'Unknown error'}`,
			session: null,
		}
	}
}

export function validateAndParseCSV(csvText: string): CSVValidationResult {
	const errors: string[] = []
	const sessions: BreathingSession[] = []
	let skippedRows = 0

	try {
		const rows = parseCSV(csvText)

		if (rows.length === 0) {
			return {
				errors: ['CSV file is empty'],
				isValid: false,
				sessions: [],
				skippedRows: 0,
			}
		}

		// Validate headers
		const headers = rows[0]
		if (!validateCSVHeaders(headers)) {
			return {
				errors: [
					'CSV headers do not match expected format',
					`Expected: ${EXPECTED_CSV_HEADERS.join(', ')}`,
					`Found: ${headers.join(', ')}`,
				],
				isValid: false,
				sessions: [],
				skippedRows: 0,
			}
		}

		// Parse data rows
		for (let i = 1; i < rows.length; i++) {
			const { error, session } = parseCSVRow(rows[i], i)

			if (error) {
				errors.push(error)
				skippedRows++
			} else if (session) {
				sessions.push(session)
			}
		}

		const isValid = sessions.length > 0 || rows.length === 1 // Valid if we have sessions or just headers

		return {
			errors,
			isValid,
			sessions,
			skippedRows,
		}
	} catch (error) {
		return {
			errors: [
				`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
			],
			isValid: false,
			sessions: [],
			skippedRows: 0,
		}
	}
}

export function validateCSVHeaders(headers: string[]): boolean {
	if (headers.length !== EXPECTED_CSV_HEADERS.length) {
		return false
	}

	return headers.every(
		(header, index) => header.trim() === EXPECTED_CSV_HEADERS[index],
	)
}
