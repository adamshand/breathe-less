<script lang="ts">
	// export let id: string
	// export let size: 's' | 'm' | 'l' = 'm'
	// export let title: string = ''

	// const src =
	// 	'https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji/color/svg/' + id.toUpperCase() + '.svg'

	interface Props {
		id: string
		isColor?: boolean
		size?: 'l' | 'm' | 's'
		title?: string
	}

	let { id, isColor = true, size = 'm', title = '' }: Props = $props()

	const src = `https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji/${
		isColor ? 'color' : 'black'
	}/svg/${id.toUpperCase()}.svg`
</script>

<!-- <img alt="Openmoji icon" class={size} {src} {title} /> -->
<img alt="Openmoji {title}" class={size} {src} {title} />

<!-- <img style="width: {width}; height: {width};" src="/openmoji/{id.toUpperCase()}.svg" alt="emoji" /> -->

<style>
	.s {
		width: var(--font-size-fluid-1);
	}
	.m {
		width: var(--font-size-fluid-2);
	}
	.l {
		width: var(--font-size-fluid-3);
	}
	/* can use filter to flip the color of the emoji to white */
	/* img {
		filter: invert(70%);
	} */
</style>
