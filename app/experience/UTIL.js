const THREE = require('three');

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


// export const toXYCoords = (obj, camera) => {
// 	console.log(obj);
// 	// camera.updateMatrixWorld();
// 	// const vector = projector.projectVector(pos.clone(), camera);
// 	// vector.x = (vector.x + 1)/2 * window.innerWidth;
// 	// vector.y = -(vector.y - 1)/2 * window.innerHeight;
// 	// return vector;

	
// 	const vector = new THREE.Vector3();
// 	const widthHalf = window.innerWidth * 0.5;
// 	const heightHalf = window.innerHeight * 0.5;

// 	camera.updateMatrixWorld();
// 	obj.updateMatrixWorld();

// 	vector.setFromMatrixPosition(obj.matrixWorld);
// 	vector.project(camera);

// 	vector.x = (vector.x * widthHalf) + widthHalf;
// 	vector.x = - (vector.y * heightHalf) + heightHalf;

// 	return vector;
// }




export const toXYCoords = (obj, camera) => {
	// camera.updateMatrixWorld();
	// obj.updateMatrixWorld();

	const { x, y, z } = obj.position;
	const vector = new THREE.Vector3(x, y, z);
	const projected = vector.project(camera);

	vector.x = (vector.x + 1) / 2 * window.innerWidth;
	vector.y = - (vector.y - 1) / 2 * window.innerHeight;

	return vector;
}
