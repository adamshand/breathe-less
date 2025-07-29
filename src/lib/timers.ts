const intro = {
	autoStart: false,
	duration: 0,
	instructions: `
  <p>This exercise should be performed four times a day. Before breakfast, lunch, dinner and bed.</p> 
  <p>Do not practice for two hours after a meal.</p> 
  <p>Learn more about this exercise on the free five-day beginners course at <a href="https://www.learnbuteykoonline.net/" target="_blank">Learn Buteyko Online</a>.</p>`,
	logged: false,
	name: 'Buteyko Maximum Pause Exercise', // Introduction
	shortName: 'start',
}

const finished = {
	autoStart: false,
	duration: 0,
	instructions: 'You have accumulated CO2, congratulations!',
	logged: false,
	name: 'Finished 🔥',
	shortName: 'finished',
}

const pulse = {
	autoStart: false,
	duration: 15,
	instructions: `<p>Find your pulse in your neck or wrist.  Count the number of heartbeats during the timer.</p>`,
	logged: true,
	name: 'Record Pulse',
	shortName: 'p',
}

const cp = {
	autoStart: false,
	duration: 0,
	instructions: `
	<p>After a normal inhale and exhale, hold your breath and pinch your nose shut.</p>
	<p>Release the hold at the first sign of discomfort.</p>`,
	logged: true,
	name: 'Control Pause',
	shortName: 'cp',
}

const vsb = {
	autoStart: true,
	duration: 180,
	instructions: `
	<p>Use shallow belly breathing to maintain gentle air hunger.</p>
	<p>Adjust the depth of breath (do not slow down the rate of breathing) 
	   to	maintain air hunger while making sure that your belly stays relaxed.</p>`,
	logged: false,
	name: 'Very Shallow Breathing',
	shortName: 'vsb',
}

const recover = {
	autoStart: true,
	duration: 30,
	instructions: `<p>Allow your body to breathe naturally and let the sense of air hunger fade.</p>`,
	logged: false,
	name: 'Recover',
	shortName: 'recover',
}

const mp = {
	autoStart: false,
	duration: 0,
	instructions: '',
	logged: true,
	name: '',
	shortName: 'mp',
}

export const layout = [
	intro,
	pulse,
	cp,
	vsb,
	recover,

	{
		...mp,
		instructions: `<h3>Light Effort</h3>
		<p>After a normal exhale, pinch your nose and hold your breath. Hold as long as	you can 
		while remaining relaxed and still.</p>`,
		name: 'Maximum Pause',
		shortName: 'mp 1',
	},
	vsb,
	recover,

	{
		...mp,
		instructions: `<h3>Medium Effort</h3>
		<p>After a normal exhale, pinch your nose and hold your breath. Use rocking and
		twisting to help extend the breath hold.</p>`,
		name: 'Maximum Pause',
		shortName: 'mp 2',
	},
	vsb,
	recover,

	{
		...mp,
		instructions: `<h3>Full Effort</h3>
		<p>After a normal exhale, pinch your nose and hold your breath. Add walking tohelp extend the breath hold.</p>`,
		name: 'Maximum Pause',
		shortName: 'mp 3',
	},
	vsb,
	{ ...recover, duration: 60 },

	cp,
	pulse,
	finished,
]
