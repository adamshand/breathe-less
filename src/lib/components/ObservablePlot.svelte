<script lang="ts">
	import * as Plot from '@observablehq/plot'

	let { options }: { options: any } = $props()
	let div: HTMLElement | undefined = $state()

	$effect(() => {
		div?.firstChild?.remove() // remove old chart, if any
		div?.append(Plot.plot(options)) // add the new chart
	})
</script>

<div bind:this={div} role="img"></div>