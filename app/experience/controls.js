const THREE = require('three');
import TweenLite from 'gsap';
require('../vendor/OrbitControls.js');
require('../vendor/DeviceOrientationControls.js');
import { camera } from './camera.js';
import { CAMERA_MOVE_SPEED, ACTIVE_OPACITY, INACTIVE_OPACITY } from './constants.js';

let controls;
let currentLevel = 0;
let currentAnchor = null;

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

export const moveToAnchor = (sphere) => {
	currentAnchor = sphere;
	
	const { position, matrixWorld } = currentAnchor;
	currentAnchor.traverseAncestors(ancestor => ancestor.updateMatrixWorld());
	const worldPosition = new THREE.Vector3();
	currentAnchor.localToWorld(worldPosition);

	const dist = new THREE.Vector3().copy(worldPosition).sub(camera.position).length();
	const dir = new THREE.Vector3().copy(worldPosition).sub(camera.position).normalize();
	const toPosition = new THREE.Vector3().copy(worldPosition).sub(dir);
	const { x, y, z } = toPosition;
	
	controls.enabled = false;

	TweenLite.to(
		camera.position,
		CAMERA_MOVE_SPEED,
		{
			x,
			y,
			ease: Cubic.EaseInOut,
		}
	);

	TweenLite.to(
		camera.position,
		CAMERA_MOVE_SPEED,
		{
			z,
			ease: Power0.easeNone,
		}
	);

	TweenLite.to(
		controls.target,
		CAMERA_MOVE_SPEED,
		{
			x: worldPosition.x,
			y: worldPosition.y,
			z: worldPosition.z,
			ease: Sine.EaseInOut,
			onComplete: () => {
				controls.enabled = true;
			},
		}
	);
}

export const update = (delta) => {
	if (controls) controls.update(delta);
}