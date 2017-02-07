export const paths = [
	// [
	// 	{id: 'a0', depth: 0, jumpPoints: ['a1', 'a2', 'a4', 'a5']},
	// 	{id: 'a1', depth: 1, jumpPoints: ['a3']},
	// 	{id: 'a2', depth: 1, jumpPoints: ['a3', 'a4', 'a7']},
	// 	{id: 'a3', depth: 2, jumpPoints: ['a7', 'a9']},
	// 	{id: 'a4', depth: 3, jumpPoints: ['a5', 'a7']},
	// 	{id: 'a5', depth: 4, jumpPoints: ['a8', 'a10']},
	// 	{id: 'a6', depth: 5, jumpPoints: ['a8', 'a10', 'a12']},
	// 	{id: 'a7', depth: 5, jumpPoints: ['a9']},
	// 	{id: 'a8', depth: 5, jumpPoints: []},
	// 	{id: 'a9', depth: 6, jumpPoints: ['a12']},
	// 	{id: 'a10', depth: 7, jumpPoints: ['a12', 'a11']},
	// 	{id: 'a11', depth: 8, jumpPoints: []},
	// 	{id: 'a12', depth: 8, jumpPoints: []},
	// ],
	{
		colors: {
			anchor: '#692a3d',
			renderer: '#243869',
			jump: '#2a5b66',
			line: '#ffffff',
		},
		paths: [
			{id: 'a0', depth: 0, jumpPoints: ['a1', 'a2']},
			{id: 'a1', depth: 1, jumpPoints: []},
			{id: 'a2', depth: 1, jumpPoints: ['a3']},
			{id: 'a3', depth: 2, jumpPoints: []},
		]
	},
	{	
		colors: {
			anchor: '#692a3d',
			renderer: '#243869',
			jump: '#2a5b66',
			line: '#ffffff',
		},
		paths: [
			{id: 'b0', depth: 0, jumpPoints: ['b1', 'b2']},
			{id: 'b1', depth: 1, jumpPoints: ['a3']},
			{id: 'b2', depth: 1, jumpPoints: []},
		]
	},
	{
		colors: {
			anchor: '#692a3d',
			renderer: '#243869',
			jump: '#2a5b66',
			line: '#ffffff',
		},
		paths: [
			{id: 'c0', depth: 0, jumpPoints: ['c1', 'c2', 'c3']},
			{id: 'c1', depth: 1, jumpPoints: ['c4']},
			{id: 'c2', depth: 1, jumpPoints: ['c4']},
			{id: 'c3', depth: 1, jumpPoints: []},
			{id: 'c4', depth: 2, jumpPoints: []},
		]
	},
	{
		colors: {
			anchor: '#692a3d',
			renderer: '#243869',
			jump: '#2a5b66',
			line: '#ffffff',
		},
		paths: [
			{id: 'd0', depth: 0, jumpPoints: ['d1', 'c3']},
			{id: 'd1', depth: 1, jumpPoints: []},
		]
	},
]

export const groups = [
	[
		paths[0],
		paths[1],
		paths[2],
		paths[3],
	],
];