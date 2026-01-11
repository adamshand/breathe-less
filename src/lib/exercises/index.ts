export { classicalExercise, classicalLayout } from './classical'
export { diminishedExercise, diminishedLayout } from './diminished'
export { mcpExercise, mcpLayout } from './mcp'
export type { ExerciseConfig, ExerciseType, Stage } from './types'

import type { ExerciseConfig, ExerciseType } from './types'

import { classicalExercise } from './classical'
import { diminishedExercise } from './diminished'
import { mcpExercise } from './mcp'

export const exercises: Record<ExerciseType, ExerciseConfig> = {
	classical: classicalExercise,
	diminished: diminishedExercise,
	mcp: mcpExercise,
}

export function getExercise(type: ExerciseType): ExerciseConfig {
	return exercises[type]
}
