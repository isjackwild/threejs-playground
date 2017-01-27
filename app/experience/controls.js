const THREE = require('three');
import TweenLite from 'gsap';
require('../vendor/OrbitControls.js');
require('../vendor/DeviceOrientationControls.js');
import { camera } from './camera.js';
import { CAMERA_MOVE_SPEED } from './constants.js';

let controls;
let currentLevel = 0;
let currentSpehere = null;

export const init = () => {
	controls = new THREE.OrbitControls(camera);
	controls.target.set(0, 0, 0);
	window.addEventListener('deviceorientation', setOrientationControls, true);
}

const setOrientationControls = (e) => {
	window.removeEventListener('deviceorientation', setOrientationControls, true);
	if (!e.alpha) return;
	controls = new THREE.DeviceOrientationControls(camera, true);
	controls.connect();
	controls.update();
}

export const moveToSphere = (sphere) => {
	const { position, scalar, level, parent, matrixWorld } = sphere;
	sphere.traverseAncestors(ancestor => ancestor.updateMatrixWorld());
	// const worldPosition = new THREE.Vector3().setFromMatrixPosition(matrixWorld);
	const worldPosition = new THREE.Vector3();
	sphere.localToWorld(worldPosition);
	console.log('SCALE', scalar);
	
	currentLevel = 0;
	if (currentSpehere) currentSpehere.isEnabled = true;
	currentSpehere = sphere;
	currentSpehere.isEnabled = false;

	const dist = new THREE.Vector3().copy(worldPosition).sub(camera.position).length();
	console.log(dist);
	const dir = new THREE.Vector3().copy(worldPosition).sub(camera.position).normalize().multiplyScalar(scalar);
	const toPosition = new THREE.Vector3().copy(worldPosition).sub(dir);
	const { x, y, z } = toPosition;
	
	controls.enabled = false;
	controls.target.copy(worldPosition);

	TweenLite.to(
		camera.position,
		CAMERA_MOVE_SPEED,
		{
			x,
			y,
			z,
			ease: Sine.EaseInOut,
			onComplete: () => { controls.enabled = true },
		}
	);
}

export const update = (delta) => {
	if (controls) controls.update(delta);
}