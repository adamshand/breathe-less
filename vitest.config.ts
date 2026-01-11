import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		allowedHosts: true,
	},
	test: {
		coverage: {
			exclude: ['src/lib/**/*.test.ts', 'src/lib/**/*.svelte'],
			include: ['src/lib/**/*.ts'],
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
		},
		environment: 'jsdom',
		exclude: ['e2e/**', 'node_modules/**'],
		include: ['src/**/*.{test,spec}.{js,ts}'],
		setupFiles: ['./vitest-setup-client.ts'],
	},
})
