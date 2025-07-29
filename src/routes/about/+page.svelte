<script lang="ts">
	import Disclaimer from '$lib/components/Disclaimer.svelte'
</script>

<article>
	<a href="https://adam.nz">
		<img src="/adam.jpg" alt="Adam and Audrey" title="Dog is my copilot" />
	</a>

	<h1>About</h1>

	<p>Hello, I'm <a href="https://adam.nz">Adam</a>.</p>

	<p>
		I built this app because I wanted a way to track my progress visually, and
		got nerd rage from constantly starting and stopping timers manually.
	</p>
	<p>
		I’ve been using it every day since June 2025 and am sharing it in the hope
		that it will be useful to others.
	</p>

	<p>
		It is a work in progress. Expect things to change and occasionally break.
	</p>

	<p>For those that are interested in the technical details about this app:</p>
	<ul>
		<li>
			It is written using the JavaScript framework <a href="https://svelte.dev"
				>SvelteKit</a
			>.
		</li>
		<li>
			It is a <a href="https://web.dev/explore/progressive-web-apps"
				>progressive web app</a
			>. This means it can be installed as an
			<a
				href="https://mobilesyrup.com/2020/05/24/how-install-progressive-web-app-pwa-android-ios-pc-mac/"
				>app on phones and used offline</a
			>
			without an internet connection.
		</li>
		<li>
			Practice data is only stored inside your web browser using <a
				href="https://javascript.info/indexeddb">IndexedDB</a
			>.
		</li>
		<li>
			The only data collected is normal web stats using the open source project <a
				href="https://umami.is/">Umami</a
			>.
		</li>
		<li>
			The <a href="https://github.com/adamshand/breathe-less"
				>source code is available</a
			> under an open source license on Github.
		</li>
	</ul>

	<p>
		If you'd like more information about me, you can visit my <a
			href="https://adam.nz">my website</a
		>.
	</p>

	<Disclaimer />
</article>

<style>
	article {
		margin-inline: var(--size-4);
	}
	img {
		float: right;
		margin-block: var(--size-7) var(--size-3);
		margin-left: var(--size-3);
		width: var(--size-12);
		border-radius: var(--radius-blob-5);
	}
	p,
	ul {
		font-size: var(--font-size-3);
	}
</style>
