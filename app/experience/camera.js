const THREE = require('three');
import { CAMERA_START_DISTANCE } from './constants.js';

export let camera;

export const init = () => {
	camera = new THREE.PerspectiveCamera(45, window.app.width / window.app.height, 0.00000000000001, 1000000000);
	camera.position.set(20, 50, 30).normalize().multiplyScalar(CAMERA_START_DISTANCE);
}

export const onResize = (w, h) => {
	if (!camera) return
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
}