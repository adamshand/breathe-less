import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const config = {
	compilerOptions: {
		runes: true,
	},
	kit: { adapter: adapter() },
	preprocess: vitePreprocess(),
	vitePlugin: {
		// https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/inspector.md
		inspector: true, // alt-x (option) to enable
	},
}

export default config
