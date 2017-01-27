const THREE = require('three');
import { CAMERA_DISTANCE } from './constants.js';

export let camera;

export const init = () => {
	camera = new THREE.PerspectiveCamera(65, window.app.width / window.app.height, 0.001, 1000000);
	const cameraPosVec = new THREE.Vector3(3, 5, 8).normalize().multiplyScalar(CAMERA_DISTANCE);
	camera.position.copy(cameraPosVec);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
}

export const onResize = (w, h) => {
	if (!camera) return
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
}