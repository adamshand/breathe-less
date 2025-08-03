<script lang="ts">
	import * as Plot from '@observablehq/plot'

	const { options } = $props<{ options: Plot.PlotOptions }>()

	export function plot(node: HTMLElement, options: Plot.PlotOptions) {
		const chart = Plot.plot(options)
		node.replaceChildren(chart)

		return {
			destroy() {
				node.replaceChildren()
			},
			update(newOptions: Plot.PlotOptions) {
				node.replaceChildren(Plot.plot(newOptions))
			},
		}
	}
</script>

<div use:plot={options} role="img"></div>
