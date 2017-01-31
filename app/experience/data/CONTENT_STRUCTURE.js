export const paths = [
	[
		{id: 'a0', depth: 0, jumpPoints: ['a1', 'a1']},
		{id: 'a1', depth: 1, jumpPoints: []},
		{id: 'a2', depth: 1, jumpPoints: ['a3']},
		{id: 'a3', depth: 2, jumpPoints: []}
	],
	// [
	// 	{id: 'a0'}, {id: 'a1'}, {id: 'a2'}
	// ],
	// [
	// 	{id: 'a0'}, {id: 'a1'}, {id: 'a2'}, {id: 'a3'}, {id: 'a4'}
	// ],
	// [
	// 	{id: 'a0'}, {id: 'a1'}
	// ],
]

export const groups = [
	[paths[0]],
];