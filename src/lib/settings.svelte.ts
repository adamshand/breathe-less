import { browser } from '$app/environment'

const STORAGE_KEY = 'breathe-less-settings'

interface AppSettings {
	hasPulseTracker: boolean
}

const defaults: AppSettings = {
	hasPulseTracker: false,
}

class Settings {
	get hasPulseTracker(): boolean {
		return this.#hasPulseTracker
	}

	set hasPulseTracker(value: boolean) {
		this.#hasPulseTracker = value
		this.#save()
	}

	#hasPulseTracker = $state(false)

	constructor() {
		if (!browser) return

		try {
			const stored = localStorage.getItem(STORAGE_KEY)
			if (stored) {
				const parsed = JSON.parse(stored) as Partial<AppSettings>
				this.#hasPulseTracker =
					parsed.hasPulseTracker ?? defaults.hasPulseTracker
			}
		} catch (error) {
			console.error('Failed to load settings:', error)
		}
	}

	#save(): void {
		if (!browser) return

		try {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({ hasPulseTracker: this.#hasPulseTracker }),
			)
		} catch (error) {
			console.error('Failed to save settings:', error)
		}
	}
}

export const settings = new Settings()
