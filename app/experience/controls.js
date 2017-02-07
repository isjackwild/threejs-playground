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
			ease: Expo.EaseInOut,
		}
	);

	TweenLite.to(
		camera.position,
		CAMERA_MOVE_SPEED,
		{
			z,
			ease: Expo.easeNone,
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

export const moveAlongJumpPath = (jumpPoint) => {
	jumpPoint.traverseAncestors(ancestor => ancestor.updateMatrixWorld());
	const startPos = new THREE.Vector3().copy(jumpPoint.position);
	jumpPoint.parent.localToWorld(startPos);

	const dist = jumpPoint.cameraPath.getLength();
	const dur = dist / 150;

	const control = { t: 0 };

	const dir = new THREE.Vector3();
	const setCamera = () => {
		const pos = jumpPoint.cameraPath.getPoint(control.t).add(startPos);
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