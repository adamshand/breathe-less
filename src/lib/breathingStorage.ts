/* eslint-disable perfectionist/sort-modules -- ExerciseType must be defined before BreathingSession uses it */
export type ExerciseType = 'classical' | 'diminished' | 'mcp'

export interface BreathingSession {
	controlPause1: number
	controlPause2: number
	date: Date
	exerciseType: ExerciseType
	id: string // timestamp-based ID
	maxPause1: number // light effort (classical only)
	maxPause2: number // medium effort (classical only)
	maxPause3: number // maximum effort (classical only)
	note: string
	pulse1: number
	pulse2: number
}

class BreathingStorage {
	private db: IDBDatabase | null = null
	private dbName = 'BreathingApp' // TODO: rename to breatheless
	private storeName = 'sessions'
	private version = 4

	async getAllSessions(): Promise<BreathingSession[]> {
		if (!this.db) await this.init()

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([this.storeName], 'readonly')
			const store = transaction.objectStore(this.storeName)
			const request = store.getAll()

			request.onsuccess = () => {
				const records = request.result
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const migratedRecords = records.map((record: any) =>
					this.needsMigration(record) ? this.migrateOldRecord(record) : record,
				)
				resolve(migratedRecords)
			}
			request.onerror = () => reject(request.error)
		})
	}

	async getSessionsByDate(date: Date): Promise<BreathingSession[]> {
		if (!this.db) await this.init()

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([this.storeName], 'readonly')
			const store = transaction.objectStore(this.storeName)
			const index = store.index('date')

			const startOfDay = new Date(date)
			startOfDay.setHours(0, 0, 0, 0)
			const endOfDay = new Date(date)
			endOfDay.setHours(23, 59, 59, 999)

			const range = IDBKeyRange.bound(startOfDay, endOfDay)
			const request = index.getAll(range)

			request.onsuccess = () => {
				const records = request.result
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const migratedRecords = records.map((record: any) =>
					this.needsMigration(record) ? this.migrateOldRecord(record) : record,
				)
				resolve(migratedRecords)
			}
			request.onerror = () => reject(request.error)
		})
	}

	async importSessions(
		sessions: BreathingSession[],
	): Promise<{ errors: string[]; imported: number }> {
		if (!this.db) await this.init()

		const errors: string[] = []
		let imported = 0

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([this.storeName], 'readwrite')
			const store = transaction.objectStore(this.storeName)

			// Handle transaction completion
			transaction.oncomplete = () => {
				resolve({ errors, imported })
			}

			transaction.onerror = () => {
				reject(new Error(`Transaction failed: ${transaction.error?.message}`))
			}

			// Import each session
			let completed = 0
			sessions.forEach((session, index) => {
				// Serialize the session to avoid proxy object issues
				const serializedSession: BreathingSession = {
					controlPause1: session.controlPause1,
					controlPause2: session.controlPause2,
					date: new Date(session.date), // Ensure it's a proper Date object
					exerciseType: session.exerciseType,
					id: session.id,
					maxPause1: session.maxPause1,
					maxPause2: session.maxPause2,
					maxPause3: session.maxPause3,
					note: session.note,
					pulse1: session.pulse1,
					pulse2: session.pulse2,
				}

				const request = store.put(serializedSession)

				request.onsuccess = () => {
					imported++
					completed++

					if (completed === sessions.length) {
						// All requests completed - transaction will complete automatically
					}
				}

				request.onerror = () => {
					errors.push(
						`Failed to import session ${index + 1}: ${request.error?.message}`,
					)
					completed++

					if (completed === sessions.length) {
						// All requests completed - transaction will complete automatically
					}
				}
			})

			// Handle empty sessions array
			if (sessions.length === 0) {
				resolve({ errors: [], imported: 0 })
			}
		})
	}

	async init(): Promise<void> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.version)

			request.onerror = () => reject(request.error)
			request.onsuccess = () => {
				this.db = request.result
				resolve()
			}

			request.onupgradeneeded = (event) => {
				const db = request.result
				const transaction = (event.target as IDBOpenDBRequest).transaction!

				let store: IDBObjectStore

				if (event.oldVersion < 1) {
					// Create new object store for version 1
					store = db.createObjectStore(this.storeName, { keyPath: 'id' })
					store.createIndex('date', 'date', { unique: false })
				} else {
					// Get existing store for migration
					store = transaction.objectStore(this.storeName)
				}

				if (event.oldVersion < 2) {
					this.migrateToVersion2Sync(store)
				}

				if (event.oldVersion < 3) {
					this.migrateToVersion3Sync(store)
				}

				if (event.oldVersion < 4) {
					this.migrateToVersion4Sync(store)
				}
			}
		})
	}

	async saveOrUpdateSession(session: BreathingSession): Promise<void> {
		if (!this.db) await this.init()

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([this.storeName], 'readwrite')
			const store = transaction.objectStore(this.storeName)

			// Serialize the session to avoid proxy object issues
			const serializedSession: BreathingSession = {
				controlPause1: session.controlPause1,
				controlPause2: session.controlPause2,
				date: new Date(session.date), // Ensure it's a proper Date object
				exerciseType: session.exerciseType,
				id: session.id,
				maxPause1: session.maxPause1,
				maxPause2: session.maxPause2,
				maxPause3: session.maxPause3,
				note: session.note,
				pulse1: session.pulse1,
				pulse2: session.pulse2,
			}

			const request = store.put(serializedSession) // Use put() for upsert behavior

			request.onsuccess = () => resolve()
			request.onerror = () => reject(request.error)
		})
	}

	async saveSession(session: BreathingSession): Promise<void> {
		if (!this.db) await this.init()

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([this.storeName], 'readwrite')
			const store = transaction.objectStore(this.storeName)
			const request = store.add(session)

			request.onsuccess = () => resolve()
			request.onerror = () => reject(request.error)
		})
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private migrateOldRecord(oldRecord: any): BreathingSession {
		const dateToUse = oldRecord.startTime
			? new Date(oldRecord.startTime)
			: oldRecord.date
				? new Date(oldRecord.date)
				: new Date()

		const migratedRecord: BreathingSession = {
			controlPause1: oldRecord.controlPause1 || 0,
			controlPause2: oldRecord.controlPause2 || 0,
			date: dateToUse,
			exerciseType: oldRecord.exerciseType || 'classical',
			id: oldRecord.id,
			maxPause1: oldRecord.maxPause1 || 0,
			maxPause2: oldRecord.maxPause2 || 0,
			maxPause3: oldRecord.maxPause3 || 0,
			note: oldRecord.note || '',
			pulse1: oldRecord.pulse1 || 0,
			pulse2: oldRecord.pulse2 || 0,
		}

		return migratedRecord
	}

	private migrateToVersion2Sync(store: IDBObjectStore): void {
		const cursorRequest = store.openCursor()

		cursorRequest.onsuccess = (event) => {
			const cursor = (event.target as IDBRequest).result
			if (cursor) {
				const record = cursor.value
				if (this.needsMigration(record)) {
					const migratedRecord = this.migrateOldRecord(record)
					cursor.update(migratedRecord)
				}
				cursor.continue()
			}
		}

		cursorRequest.onerror = () => {
			console.error('Failed to migrate records:', cursorRequest.error)
		}
	}

	private migrateToVersion3Sync(store: IDBObjectStore): void {
		const cursorRequest = store.openCursor()

		cursorRequest.onsuccess = (event) => {
			const cursor = (event.target as IDBRequest).result
			if (cursor) {
				const record = cursor.value
				if (!('note' in record)) {
					record.note = record.note || ''
					cursor.update(record)
				}
				cursor.continue()
			}
		}

		cursorRequest.onerror = () => {
			console.error(
				'Failed to migrate records to version 3:',
				cursorRequest.error,
			)
		}
	}

	private migrateToVersion4Sync(store: IDBObjectStore): void {
		const cursorRequest = store.openCursor()

		cursorRequest.onsuccess = (event) => {
			const cursor = (event.target as IDBRequest).result
			if (cursor) {
				const record = cursor.value
				let needsUpdate = false

				if (!('exerciseType' in record)) {
					record.exerciseType = 'classical'
					needsUpdate = true
				}

				if ('personalBest' in record) {
					delete record.personalBest
					needsUpdate = true
				}

				if (needsUpdate) {
					cursor.update(record)
				}
				cursor.continue()
			}
		}

		cursorRequest.onerror = () => {
			console.error(
				'Failed to migrate records to version 4:',
				cursorRequest.error,
			)
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private needsMigration(record: any): boolean {
		return (
			'startTime' in record ||
			!('pulse1' in record) ||
			!('pulse2' in record) ||
			!('note' in record) ||
			!('exerciseType' in record)
		)
	}
}

export const breathingStorage = new BreathingStorage()
