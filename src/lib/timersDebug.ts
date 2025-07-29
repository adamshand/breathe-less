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
	duration: 5,
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
	duration: 2,
	instructions: `<p>Allow your body to breathe naturally and let the sense of air hunger fade.</p>`,
	logged: false,
	name: 'Natural Breathing',
	shortName: 'recover',
}

// const mp = {
// 	autoStart: false,
// 	duration: 0,
// 	instructions: '',
// 	logged: true,
// 	name: '',
// 	shortName: 'mp',
// }

export const layout = [intro, cp, vsb, recover, finished]
