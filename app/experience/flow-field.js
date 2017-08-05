const THREE = require('three');
import { FF_DIMENTIONS, FF_RESOLUTION, FF_NOISE_SCALE, FF_NOISE_SPEED } from './CONSTANTS.js';
import { scene } from './scene.js';
import { Noise } from 'noisejs';
import { lerp } from '../lib/maths.js';

// export const values = [];
const arrowHelpers = [];
const noisePhi = new Noise(Math.random());
const noiseTheta = new Noise(Math.random());
const noiseMag = new Noise(Math.random());
let noiseTime = 0;

const tmp = new THREE.Vector3();
const spherical = new THREE.Spherical();
const origin = new THREE.Vector3();


export const lookup = ({ x, y, z }) => {
	const phi = (noisePhi.perlin3(x * FF_NOISE_SCALE + noiseTime, y * FF_NOISE_SCALE + noiseTime, z * FF_NOISE_SCALE + noiseTime) + 1 / 2) * Math.PI;
	const theta = (noiseTheta.perlin3(x * FF_NOISE_SCALE + noiseTime, y * FF_NOISE_SCALE + noiseTime, z * FF_NOISE_SCALE + noiseTime) + 1 / 2) * Math.PI * 2;
	const mag = (noiseMag.perlin3(x * FF_NOISE_SCALE + noiseTime, y * FF_NOISE_SCALE + noiseTime, z * FF_NOISE_SCALE + noiseTime) + 1) / 2;

	spherical.set(1, phi, theta).makeSafe();
	tmp.setFromSpherical(spherical).normalize().multiplyScalar(mag);
	return tmp;
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
					const vec = lookup({
						x: x * FF_RESOLUTION - FF_DIMENTIONS / 2,
						y: y * FF_RESOLUTION - FF_DIMENTIONS / 2,
						z: z * FF_RESOLUTION - FF_DIMENTIONS / 2,
					});
					const arrowHelper = new THREE.ArrowHelper(vec, origin, 80 * vec.length(), 0xff0000);

					arrowHelpers[x][y][z] = arrowHelper;
					scene.add(arrowHelper);
				} else {
					const vec = lookup({
						x: x * FF_RESOLUTION - FF_DIMENTIONS / 2,
						y: y * FF_RESOLUTION - FF_DIMENTIONS / 2,
						z: z * FF_RESOLUTION - FF_DIMENTIONS / 2,
					});
					arrowHelpers[x][y][z].setDirection(vec);
					arrowHelpers[x][y][z].setLength(80 * vec.length());
				}
			}
		}
	}
}

export const update = (delta) => {
	noiseTime += FF_NOISE_SPEED * delta;
	// draw();
}