import type { BreathingSession, ExerciseType } from '$lib/breathingStorage'

export interface ExerciseConfig {
	description: string
	layout: Stage[]
	mapLogToSession: (log: number[], date: Date) => BreathingSession
	name: string
	shortName: string
	type: ExerciseType
}

export interface Stage {
	autoStart: boolean
	duration: number
	instructions: string
	logged: boolean
	name: string
	shortName: string
}

export type { ExerciseType }
