export const threads = [
	{
		colors: {
			anchor: '#FFA925',
			renderer: '#243869',
			jump: '#2a5b66',
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
			anchor: '#4360AE',
			renderer: '#243869',
			jump: '#2a5b66',
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
			anchor: '#FC5556',
			renderer: '#243869',
			jump: '#2a5b66',
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
			anchor: '#269751',
			renderer: '#243869',
			jump: '#2a5b66',
			line: '#ffffff',
		},
		anchors: [
			{id: 'd0', depth: 0, jumpPoints: ['d1', 'c3']},
			{id: 'd1', depth: 1, jumpPoints: []},
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