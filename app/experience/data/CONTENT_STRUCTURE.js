// COLOURS: Muted Warmer Grey-tones for the bubbles, and more tonally stronger threads

export const threads = [
	{
		colors: {
			anchor: '#a0998e',
			jump: '#FFA925',
			renderer: '#243869',
			line: '#ffffff',
		},
		anchors: [
			{id: 'a0', depth: 0, jumpPoints: ['a1', 'a2']},
			{id: 'a1', depth: 1, jumpPoints: []},
			{id: 'a2', depth: 1, jumpPoints: ['a3']},
			{id: 'a3', depth: 2, jumpPoints: ['c2']},
		]
	},
	{	
		colors: {
			anchor: '#9094a0',
			jump: '#5545b2', //blue
			renderer: '#243869',
			line: '#ffffff',
		},
		anchors: [
			{id: 'b0', depth: 0, jumpPoints: ['b1', 'b2']},
			{id: 'b1', depth: 1, jumpPoints: ['a3']},
			{id: 'b2', depth: 1, jumpPoints: []},
		]
	},
	{
		colors: {
			anchor: '#c4a7a1', //orange
			jump: '#fc7d67',
			renderer: '#243869',
			line: '#ffffff',
		},
		anchors: [
			{id: 'c0', depth: 0, jumpPoints: ['c1', 'c2', 'c3']},
			{id: 'c1', depth: 1, jumpPoints: ['c4']},
			{id: 'c2', depth: 1, jumpPoints: ['c4']},
			{id: 'c3', depth: 1, jumpPoints: ['d1', 'b2']},
			{id: 'c4', depth: 2, jumpPoints: []},
		]
	},
	{
		colors: {
			anchor: '#85968c',
			jump: '#76e2cd',
			renderer: '#243869',
			line: '#ffffff',
		},
		anchors: [
			{id: 'd0', depth: 0, jumpPoints: ['d1', 'c3']},
			{id: 'd1', depth: 1, jumpPoints: []},
		]
	},
	{
		colors: {
			anchor: '#a8959d',
			jump: '#ce333b', //rasberry
			renderer: '#ffffff',
			line: '#ffffff',
		},
		anchors: [
			{id: 'e0', depth: 0, jumpPoints: ['d1', 'c3', 'e1']},
			{id: 'e1', depth: 1, jumpPoints: ['e3']},
			{id: 'e2', depth: 1, jumpPoints: ['e4', 'e5', 'c4']},
			{id: 'e3', depth: 2, jumpPoints: ['a2']},
			{id: 'e4', depth: 2, jumpPoints: ['e5', 'e5']},
			{id: 'e5', depth: 2, jumpPoints: ['b2']},
		]
	},
]

// export const groups = [
// 	[
// 		paths[0],
// 		paths[1],
// 		paths[2],
// 		paths[3],
// 	],
// ];
// 
// 



export const structure = [
	{id: 'c0', depth: 0, jumpPoints: ['c1', 'c2', 'c3']},
	{id: 'c1', depth: 1, jumpPoints: ['c4']},
	{id: 'c2', depth: 1, jumpPoints: ['c4']},
	{id: 'c3', depth: 1, jumpPoints: []},
	{id: 'c4', depth: 2, jumpPoints: []},
];