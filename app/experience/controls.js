const THREE = require('three');
import TweenLite from 'gsap';
require('../vendor/OrbitControls.js');
require('../vendor/DeviceOrientationControls.js');
import { camera } from './camera.js';
import { CAMERA_MOVE_SPEED, ACTIVE_OPACITY, INACTIVE_OPACITY } from './constants.js';

export let controls;
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

export const moveToPosition = (position) => {
	const dist = new THREE.Vector3().copy(position).sub(camera.position).length();
	const dir = new THREE.Vector3().copy(position).sub(camera.position).normalize();
	const toPosition = new THREE.Vector3().copy(position).sub(dir);
	const { x, y, z } = toPosition;

	const targetToPosition = new THREE.Vector3().copy(position).add(dir);


	TweenLite.to(
		camera.position,
		CAMERA_MOVE_SPEED,
		{
			x,
			y,
			z,
			ease: Sine.EaseInOut,
		}
	);

	TweenLite.to(
		controls.target,
		CAMERA_MOVE_SPEED,
		{
			x: targetToPosition.x,
			y: targetToPosition.y,
			z: targetToPosition.z,
			ease: Sine.EaseInOut,
		}
	);
}

export const moveAlongJumpPath = (path) => {
	const dist = path.getLength();
	const dur = dist / 500;

	const control = { t: 0 };
	const dir = new THREE.Vector3();

	const setCamera = () => {
		const pos = path.getPoint(control.t);
		dir.copy(pos).sub(camera.position).normalize().multiplyScalar(0.01);
		camera.position.copy(pos);
		controls.target.copy(pos.add(dir));
	}

	TweenLite.to(
		control,
		dur,
		{
			t: 1,
			ease: Expo.EaseInOut,
			onUpdate: setCamera,
		}
	);
}

export const update = (delta) => {
	if (controls) controls.update(delta);
}