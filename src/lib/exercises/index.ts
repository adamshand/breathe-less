export { classicalExercise, classicalLayout } from './classical'
export type { ExerciseConfig, ExerciseType, Stage } from './types'

import type { ExerciseConfig, ExerciseType } from './types'

import { classicalExercise } from './classical'

export const exercises: Record<ExerciseType, ExerciseConfig> = {
	classical: classicalExercise,
	diminished: classicalExercise, // Placeholder - will be replaced
	mcp: classicalExercise, // Placeholder - will be replaced
}

export function getExercise(type: ExerciseType): ExerciseConfig {
	return exercises[type]
}
