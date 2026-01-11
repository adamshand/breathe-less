import type { HandleServerError } from '@sveltejs/kit'

import { sendErrorToNtfy } from '$lib/sendErrors'

export const handleError: HandleServerError = async ({
	error,
	event,
	message,
	status,
}) => {
	console.error(error)
	sendErrorToNtfy(error, event, message, status, true)
	return { message }
}
