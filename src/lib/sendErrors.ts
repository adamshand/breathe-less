import type { NavigationEvent, RequestEvent } from '@sveltejs/kit'

import { browser, dev } from '$app/environment'
// import { PUBLIC_DEBUG } from '$env/static/public'

export async function sendErrorToNtfy(
	error: unknown,
	event: NavigationEvent | RequestEvent,
	message: string,
	status: number,
	runInDev = false,
) {
	if (dev && runInDev === false) {
		console.error(error)
		return { message }
	}

	if (status === 404) {
		console.error(error)
		return { message }
	}

	// const id = crypto.randomUUID() // maybe later
	// this is the right thing, but need to figure out  how to auto subscribe
	// const ntfyTopic = `${event.url.hostname}-${version}`
	const version = ''
	// const ntfyTopic = `${event.url.hostname.replace(/[.]/g, '-')}-${version}`
	// const ntfyUrl = `https://ntfy.sh/${ntfyTopic}?auth=tk_39wjfjv3i5hycpnc3ot33svzo1vta`
	const ntfyUrl = `https://ntfy.sh/breathe-less-84502?auth=tk_39wjfjv3i5hycpnc3ot33svzo1vta`

	const errorMsg = error instanceof Error ? error.message : String(error)
	const stack = error instanceof Error ? error.stack : 'no stack'

	const location = `[${event.url.href}](${event.url.href})`
	const renderMode = browser ? 'CSR' : 'SSR'
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const user = `@${(event as any).locals?.user?.username ?? 'anonymous'}`

	const body = `**${status}: ${message}**\n\n${stack}\n\n${location}`

	// if (PUBLIC_DEBUG) console.log({ ntfyUrl, renderMode, user })

	const headers = {
		Markdown: 'yes',
		Tags: `${browser ? 'facepalm' : 'boom'}, ${status}, ${renderMode}, ${user}, ${version}`,
		Title: `${errorMsg}`,
	}

	try {
		// don't need to await because we aren't using result
		await fetch(ntfyUrl, {
			body,
			headers,
			method: 'POST',
		})
	} catch (apiError) {
		//  since i don't await the fetch, is this any use?
		console.error('Error sending to ntfy:', apiError)
	}
}
