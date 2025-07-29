<script lang="ts">
	import Disclaimer from '$lib/components/Disclaimer.svelte'
</script>

<article>
	<Disclaimer />

	<h1>Instructions</h1>
	<p>
		This app helps you perform and track your progress of the maximum pause
		exercise as taught by <a href="https://learnbuteyko.substack.com"
			>Learn Buteyko Online</a
		>.
	</p>
	<p>
		The maximum pause exercise helps you increase your tolerance to carbon
		dioxide with a combination of breath holding and shallow breathing.
	</p>
	<ul>
		<li>
			Shallow breathing helps break your habit of over breathing and builds a
			store of CO2, this <a href="https://en.wikipedia.org/wiki/Bohr_effect"
				>helps your body deliver oxygen to cells</a
			>.
		</li>
		<li>
			Breath holding trains your respiratory system to tolerate a higher
			threshold of CO2.
		</li>
	</ul>
	<p>
		Despite its apparent simplicity, the Buteyko Method is infamously difficult
		to learn without a teacher. I tried for several months and made very little
		progress until I took a course and got some coaching.
	</p>
	<p>
		⚠️ Please note there are <a
			href="https://www.normalbreathing.com/breath-holds/"
			>contraindications for maximum pause exercises</a
		>.
	</p>
	<h2>Overview</h2>
	<p>To make steady progress, you should:</p>
	<ul>
		<li><p>Perform this exercise four times a day.</p></li>
		<li>
			<p>
				Practice should be on an empty stomach (two hours after a meal). A good
				schedule is to practice before breakfast, lunch, dinner, and bed.
			</p>
		</li>
		<li><p>Sessions should be at least two hours apart.</p></li>
		<li><p>Only breathe into your belly (not chest)</p></li>
		<li><p>Only breathe through your nose (not mouth).</p></li>
		<li>
			<p>During maximum and control pauses:</p>
			<ul>
				<li>
					Pinch your nose shut (this allows your breathing muscles to relax).
				</li>
				<li>Relax as much as possible.</li>
				<li>Avoid watching the timer.</li>
			</ul>
		</li>
	</ul>
	<h2>Pulse</h2>
	<p>
		At the beginning and end of each session, you measure and record your pulse.
	</p>
	<p>
		Your pulse should be lower at the end than at the beginning. If it
		isn&#39;t, wait 5-15 minutes and check again. If your pulse is still higher,
		this can be an indication that you are performing the exercise incorrectly
		or over training. Please get advice from an experienced teacher.
	</p>
	<h2>Control Pause</h2>
	<p>
		Your control pause (sometimes called a <a
			href="https://oxygenadvantage.com/measure-bolt/">BOLT score</a
		>) is a way to measure your current CO2 tolerance and the Buteyko Method’s
		primary metric to track progress.
	</p>
	<ol>
		<li>Sit quietly for a few minutes.</li>
		<li>After a normal inhale and exhale, pinch your nose closed.</li>
		<li>Start the timer.</li>
		<li>At the first definite desire to breathe, stop the timer.</li>
	</ol>
	<p>
		After the pause, you should be able to breathe effortlessly. If there is any
		desire to breathe faster or deeper, you have held on too long.
	</p>
	<p>
		Understanding the exact moment of your control pause is difficult in the
		beginning. With practice, and as your control pause increases, it gets
		clearer.
	</p>
	<p>
		If you would like more detailed descriptions of how to take your control
		pause, I found these pages useful:
	</p>
	<ul>
		<li>
			<a href="https://thebreathingman.com/control-pause/"
				>How to measure your control pause</a
			> by Vladimir and Marina Buteyko
		</li>
		<li>
			<a href="https://oxygenadvantage.com/measure-bolt/"
				>How to measure your BOLT score</a
			> by Patrick McKeown
		</li>
	</ul>
	<h2>Very Shallow Breathing</h2>
	<p>
		Use shallow belly breathing to build and maintain a gentle sense of air
		hunger. Adjust the depth of your breath to maintain air hunger, while making
		sure that your belly stays relaxed.
	</p>
	<p>
		Your breath should be relaxed, fluid and regular. The only control you exert
		is reducing the depth of your inhalation. Do not use any force or control
		for the exhalation, let your body exhale naturally.
	</p>
	<p>
		If your belly becomes tense, you have generated too much air hunger. You can
		try briefly massaging your belly to release tension, or you can breathe
		slightly deeper to reduce air hunger.
	</p>
	<p>
		If you lose air hunger, pause for a few seconds after exhalation until the
		sense of air hunger returns, and then resume shallow breathing.
	</p>
	<h2>Recover</h2>
	<p>
		Allow your body to breathe naturally and let the sense of air hunger fade.
	</p>
	<h2>Maximum Pauses</h2>
	<p>
		The basic process is the same as for the control pause. Only instead of
		releasing the breath hold at the first definite desire to breathe, you
		continue the hold for as long as you can.
	</p>
	<p>
		At the end of a maximum pause, you will have a strong desire to breathe
		deeply. You must suppress the reflex to take a deep breath. Very rapid and
		shallow breathing can help suppress the desire.
	</p>
	<p>
		The maximum pauses use a series of increasing distractions to help you
		extend your breath hold.
	</p>
	<h3>Light Effort</h3>
	<p>
		While in an upright, seated position, hold your breath for as long as you
		can.
	</p>
	<h3>Medium Effort</h3>
	<p>
		Same as the previous maximum pause. Before the urge to breathe becomes
		strong, add rocking and twisting movements to help extend the breath hold.
	</p>
	<h3>Full Effort</h3>
	<p>
		Same as the previous maximum pause. After the rocking and twisting, and
		before the urge to breathe becomes strong, get up and walk around the room
		to help extend the breath hold.
	</p>
	<p>&nbsp;</p>
</article>

<style>
	article {
		margin-inline: var(--size-4);
	}
	h1,
	h2 {
		color: var(--brand);
	}
	p,
	ol,
	ul {
		font-size: var(--font-size-3);
	}
</style>
