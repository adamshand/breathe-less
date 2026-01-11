export { classicalExercise, classicalLayout } from './classical'
export { mcpExercise, mcpLayout } from './mcp'
export type { ExerciseConfig, ExerciseType, Stage } from './types'

import type { ExerciseConfig, ExerciseType } from './types'

import { classicalExercise } from './classical'
import { mcpExercise } from './mcp'

export const exercises: Record<ExerciseType, ExerciseConfig> = {
	classical: classicalExercise,
	diminished: classicalExercise, // Placeholder - will be replaced
	mcp: mcpExercise,
}

export function getExercise(type: ExerciseType): ExerciseConfig {
	return exercises[type]
}
