export const fibonacciSphere = (samples = 1, randomize = false) => {
	let rand = 1;
	if (randomize) rand = Math.random() * samples;

	const points = [];
	const offset = 2 / samples;
	const increment = Math.PI * (3 - Math.sqrt(5));

	for (let i = 0; i < samples; i++) {
		const y = ((i * offset) - 1) + offset / 2;
		const r = Math.sqrt(1 - Math.pow(y, 2));
		const phi = ((i + rand) % samples) * increment;

		const x = Math.cos(phi) * r;
		const z = Math.sin(phi) * r;

		points.push({ x, y, z });
	}

	return points;
}