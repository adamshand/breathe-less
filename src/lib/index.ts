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

export function shuffled<T>(array: T[]): T[] {
	shuffle(array)
	return array
}

export function stripHtml(str: string) {
	return str.replace(/<\/?[^>]+(>|$)/g, '').trim()
}

// CSV utility functions for breathe.adam.nz
export interface BreathingSession {
	controlPause1: number
	controlPause2: number
	date: Date
	id: string
	maxPause1: number
	maxPause2: number
	maxPause3: number
	note: string
	personalBest: {
		maxPause3: boolean
	}
	pulse1: number
	pulse2: number
}

export function escapeCSV(value: string | number): string {
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

export function convertSessionsToCSV(sessions: BreathingSession[]): string {
	const csvLines = [EXPECTED_CSV_HEADERS.join(',')]

	sessions.forEach((session) => {
		const date = new Date(session.date)
		const row = [
			escapeCSV(date.toISOString()), // Full ISO datetime: 2025-07-23T14:30:45.123Z
			escapeCSV(session.controlPause1),
			escapeCSV(session.maxPause1),
			escapeCSV(session.maxPause2),
			escapeCSV(session.maxPause3),
			escapeCSV(session.controlPause2),
			escapeCSV(session.note),
			escapeCSV(session.personalBest?.maxPause3 ? 'Yes' : 'No'),
			escapeCSV(session.pulse1),
			escapeCSV(session.pulse2),
		]
		csvLines.push(row.join(','))
	})

	return csvLines.join('\n')
}

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

// CSV Import utilities
export interface CSVValidationResult {
	isValid: boolean
	errors: string[]
	sessions: BreathingSession[]
	skippedRows: number
}

export const EXPECTED_CSV_HEADERS = [
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

export function validateCSVHeaders(headers: string[]): boolean {
	// Check for new format first
	if (headers.length === EXPECTED_CSV_HEADERS.length) {
		const isNewFormat = headers.every(
			(header, index) => header.trim() === EXPECTED_CSV_HEADERS[index],
		)
		if (isNewFormat) return true
	}

	// Check for legacy format (Date, Time, ...)
	if (headers.length === 11) {
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
		const isLegacyFormat = headers.every(
			(header, index) => header.trim() === legacyHeaders[index],
		)
		if (isLegacyFormat) return true
	}

	return false
}

export function parseCSVRow(
	row: string[],
	rowIndex: number,
): { session: BreathingSession | null; error: string | null } {
	// Handle both new format (single DateTime column) and legacy format (Date + Time columns)
	const isLegacyFormat = row.length === 11 // Old format had 11 columns
	const expectedLength = isLegacyFormat ? 11 : EXPECTED_CSV_HEADERS.length

	if (row.length !== expectedLength) {
		return {
			session: null,
			error: `Row ${rowIndex + 1}: Expected ${expectedLength} columns, got ${row.length}`,
		}
	}

	try {
		let date: Date

		if (isLegacyFormat) {
			// Legacy format: separate date and time columns
			const dateStr = row[0].trim()
			const timeStr = row[1].trim()

			if (dateStr && timeStr) {
				// Try multiple parsing approaches for legacy formats
				date = new Date(`${dateStr}T${timeStr}`)

				if (isNaN(date.getTime())) {
					date = new Date(`${dateStr} ${timeStr}`)
				}

				if (isNaN(date.getTime())) {
					date = parseLocaleDateString(dateStr, timeStr)
				}

				if (isNaN(date.getTime())) {
					date = new Date(dateStr)
				}

				if (isNaN(date.getTime())) {
					console.warn(
						`Failed to parse legacy date: "${dateStr}" time: "${timeStr}" - using current date`,
					)
					date = new Date()
				}
			} else {
				console.warn(
					`Missing legacy date or time: date="${dateStr}" time="${timeStr}" - using current date`,
				)
				date = new Date()
			}
		} else {
			// New format: single ISO datetime column
			const dateTimeStr = row[0].trim()

			if (dateTimeStr) {
				// Try ISO datetime parsing
				date = new Date(dateTimeStr)

				if (isNaN(date.getTime())) {
					console.warn(
						`Failed to parse ISO datetime: "${dateTimeStr}" - using current date`,
					)
					date = new Date()
				}
			} else {
				console.warn(`Missing datetime: "${dateTimeStr}" - using current date`)
				date = new Date()
			}
		}

		// Parse numeric fields with validation
		const parseNumber = (value: string, fieldName: string): number => {
			const num = parseFloat(value.trim())
			return isNaN(num) ? 0 : num
		}

		// Adjust column indices based on format
		const colOffset = isLegacyFormat ? 1 : 0 // Legacy format has extra time column

		// Parse personal best flag
		const personalBestStr = row[7 + colOffset].trim().toLowerCase()
		const personalBest =
			personalBestStr === 'yes' ||
			personalBestStr === 'true' ||
			personalBestStr === '1'

		const session: BreathingSession = {
			controlPause1: parseNumber(row[1 + colOffset], 'Control Pause 1'),
			controlPause2: parseNumber(row[5 + colOffset], 'Control Pause 2'),
			date: date,
			id: generateUniqueId(date),
			maxPause1: parseNumber(row[2 + colOffset], 'Max Pause 1'),
			maxPause2: parseNumber(row[3 + colOffset], 'Max Pause 2'),
			maxPause3: parseNumber(row[4 + colOffset], 'Max Pause 3'),
			note: row[6 + colOffset].trim(),
			personalBest: {
				maxPause3: personalBest,
			},
			pulse1: parseNumber(row[8 + colOffset], 'Pulse 1'),
			pulse2: parseNumber(row[9 + colOffset], 'Pulse 2'),
		}

		return { session, error: null }
	} catch (error) {
		return {
			session: null,
			error: `Row ${rowIndex + 1}: Failed to parse data - ${error instanceof Error ? error.message : 'Unknown error'}`,
		}
	}
}

export function generateUniqueId(date: Date): string {
	// Use timestamp plus small random component to avoid collisions
	const timestamp = date.getTime()
	const random = Math.floor(Math.random() * 1000)
	return `${timestamp}-${random}`
}

function parseLocaleDateString(dateStr: string, timeStr: string): Date {
	// Try to parse common date formats manually

	// Remove common date separators and try different patterns
	const cleanDate = dateStr.replace(/[^\d]/g, ' ').trim()
	const dateParts = cleanDate.split(/\s+/).filter((p) => p.length > 0)

	if (dateParts.length >= 3) {
		// For DD/MM/YYYY format like "19/07/2025" -> dateParts = ["19", "07", "2025"]
		// We want: day=19 (index 0), month=07 (index 1), year=2025 (index 2)
		const patterns = [
			{ day: 0, month: 1, year: 2 }, // DD/MM/YYYY (New Zealand format)
			{ day: 1, month: 0, year: 2 }, // MM/DD/YYYY (US format)
			{ day: 2, month: 1, year: 0 }, // YYYY/MM/DD (ISO format)
		]

		for (const pattern of patterns) {
			const day = parseInt(dateParts[pattern.day])
			const month = parseInt(dateParts[pattern.month])
			const year = parseInt(dateParts[pattern.year])

			// Validate ranges
			if (
				year >= 1900 &&
				year <= 2100 &&
				month >= 1 &&
				month <= 12 &&
				day >= 1 &&
				day <= 31
			) {
				// Try to parse time
				let hours = 0,
					minutes = 0,
					seconds = 0

				if (timeStr) {
					const timeMatch = timeStr.match(
						/(\d{1,2})[^\d](\d{1,2})(?:[^\d](\d{1,2}))?(?:\s*(am|pm))?/i,
					)
					if (timeMatch) {
						hours = parseInt(timeMatch[1])
						minutes = parseInt(timeMatch[2])
						seconds = timeMatch[3] ? parseInt(timeMatch[3]) : 0

						// Handle AM/PM
						if (timeMatch[4]) {
							const isPM = timeMatch[4].toLowerCase() === 'pm'
							if (isPM && hours !== 12) hours += 12
							if (!isPM && hours === 12) hours = 0
						}
					}
				}

				const testDate = new Date(year, month - 1, day, hours, minutes, seconds)
				if (!isNaN(testDate.getTime())) {
					return testDate
				}
			}
		}
	}

	// If all parsing attempts fail, return invalid date
	return new Date(NaN)
}

export function validateAndParseCSV(csvText: string): CSVValidationResult {
	const errors: string[] = []
	const sessions: BreathingSession[] = []
	let skippedRows = 0

	try {
		const rows = parseCSV(csvText)

		if (rows.length === 0) {
			return {
				isValid: false,
				errors: ['CSV file is empty'],
				sessions: [],
				skippedRows: 0,
			}
		}

		// Validate headers
		const headers = rows[0]
		if (!validateCSVHeaders(headers)) {
			return {
				isValid: false,
				errors: [
					'CSV headers do not match expected format',
					`Expected: ${EXPECTED_CSV_HEADERS.join(', ')}`,
					`Found: ${headers.join(', ')}`,
				],
				sessions: [],
				skippedRows: 0,
			}
		}

		// Parse data rows
		for (let i = 1; i < rows.length; i++) {
			const { session, error } = parseCSVRow(rows[i], i)

			if (error) {
				errors.push(error)
				skippedRows++
			} else if (session) {
				sessions.push(session)
			}
		}

		const isValid = sessions.length > 0 || rows.length === 1 // Valid if we have sessions or just headers

		return {
			isValid,
			errors,
			sessions,
			skippedRows,
		}
	} catch (error) {
		return {
			isValid: false,
			errors: [
				`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
			],
			sessions: [],
			skippedRows: 0,
		}
	}
}
