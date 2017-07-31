const THREE = require('three');
import { FF_DIMENTIONS, FF_RESOLUTION, FF_NOISE_SCALE, FF_NOISE_SPEED } from './CONSTANTS.js';
import { scene } from './scene.js';
import { Noise } from 'noisejs';
import { lerp } from '../lib/maths.js';

export const values = [];
const arrowHelpers = [];
const noisePhi = new Noise(Math.random());
const noiseTheta = new Noise(Math.random());
const noiseMag = new Noise(Math.random());
const tmp = new THREE.Vector3();
let noiseTime = 0;

const spherical = new THREE.Spherical();
const origin = new THREE.Vector3();

export const init = () => {
	setVectors();
}

export const setVectors = () => {
	for (let x = 0; x <= FF_DIMENTIONS / FF_RESOLUTION; x++) {
		if (!values[x]) values[x] = [];
		for (let y = 0; y <= FF_DIMENTIONS / FF_RESOLUTION; y++) {
			if (!values[x][y]) values[x][y] = [];
			for (let z = 0; z <= FF_DIMENTIONS / FF_RESOLUTION; z++) {
				if (!values[x][y][z]) values[x][y][z] = new THREE.Vector3();

				const phi = (noisePhi.simplex3(x * FF_NOISE_SCALE + noiseTime, y * FF_NOISE_SCALE + noiseTime, z * FF_NOISE_SCALE + noiseTime) + 1 / 2) * Math.PI;
				const theta = (noiseTheta.simplex3(x * FF_NOISE_SCALE + noiseTime, y * FF_NOISE_SCALE + noiseTime, z * FF_NOISE_SCALE + noiseTime) + 1 / 2) * Math.PI * 2;
				const mag = (noiseMag.simplex3(x * FF_NOISE_SCALE + noiseTime, y * FF_NOISE_SCALE + noiseTime, z * FF_NOISE_SCALE + noiseTime) + 1) / 2;

				// const phi = 0.5 * Math.PI;
				// const theta = 0;
				// const mag = (noiseMag.simplex3(x * FF_NOISE_SCALE + noiseTime, y * FF_NOISE_SCALE + noiseTime, z * FF_NOISE_SCALE + noiseTime) + 1) / 2;
				// // console.log(mag);
				spherical.set(1, phi, theta);

				values[x][y][z].setFromSpherical(spherical).normalize();
				values[x][y][z].magnitude = mag;
			}
		}
	}
}

const draw = () => {
	for (let x = 0; x <= FF_DIMENTIONS / FF_RESOLUTION; x++) {
		if (!arrowHelpers[x]) arrowHelpers[x] = [];
		for (let y = 0; y <= FF_DIMENTIONS / FF_RESOLUTION; y++) {
			if (!arrowHelpers[x][y]) arrowHelpers[x][y] = [];
			for (let z = 0; z <= FF_DIMENTIONS / FF_RESOLUTION; z++) {
				if (!arrowHelpers[x][y][z]) {
					origin.set(
						x * FF_RESOLUTION - FF_DIMENTIONS / 2,
						y * FF_RESOLUTION - FF_DIMENTIONS / 2,
						z * FF_RESOLUTION - FF_DIMENTIONS / 2,
					);
					const arrowHelper = new THREE.ArrowHelper(values[x][y][z], origin, values[x][y][z].magnitude * 100, 0xff0000);
					arrowHelpers[x][y][z] = arrowHelper;
					scene.add(arrowHelper);
				} else {
					arrowHelpers[x][y][z].setDirection(values[x][y][z]);
					arrowHelpers[x][y][z].setLength(values[x][y][z].magnitude * 100);
				}
			}
		}
	}
}

// export const lookup = (vec) => {
// 	const x = Math.floor((vec.x + FF_DIMENTIONS / 2) / FF_RESOLUTION);
// 	const y = Math.floor((vec.y + FF_DIMENTIONS / 2) / FF_RESOLUTION);
// 	const z = Math.floor((vec.y + FF_DIMENTIONS / 2) / FF_RESOLUTION);
// 	return new THREE.Vector3().copy(values[x][y][z]).multiplyScalar(values[x][y][z].magnitude * 3);
// }

export const lookup = (vec) => {
	const { x, y, z } = vec;
	
	const phi = (noisePhi.simplex3(x * FF_NOISE_SCALE + noiseTime, y * FF_NOISE_SCALE + noiseTime, z * FF_NOISE_SCALE + noiseTime) + 1 / 2) * Math.PI * 2;
	const theta = (noiseTheta.simplex3(x * FF_NOISE_SCALE + noiseTime, y * FF_NOISE_SCALE + noiseTime, z * FF_NOISE_SCALE + noiseTime) + 1 / 2) * Math.PI * 2;
	const mag = (noiseMag.simplex3(x * FF_NOISE_SCALE + noiseTime, y * FF_NOISE_SCALE + noiseTime, z * FF_NOISE_SCALE + noiseTime) + 1) / 2;
	// console.log(mag);
	spherical.set(1, phi, theta);

	tmp.setFromSpherical(spherical).normalize().multiplyScalar(mag);
	return tmp;
}

export const update = (delta) => {
	noiseTime += FF_NOISE_SPEED * delta;
	setVectors();
	draw();
}