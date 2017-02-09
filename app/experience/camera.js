const THREE = require('three');
import { CAMERA_DISTANCE } from './constants.js';

export let camera;

export const init = () => {
	camera = new THREE.PerspectiveCamera(40, window.app.width / window.app.height, 0.001, 1000000);
	const cameraPosVec = new THREE.Vector3(1590, 1960, 1295);
	camera.position.copy(cameraPosVec);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
}

export const onResize = (w, h) => {
	if (!camera) return
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
}