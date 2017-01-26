const THREE = require('three');
require('../vendor/OrbitControls.js');
require('../vendor/DeviceOrientationControls.js');
require('../vendor/TrackballControls.js');
import { camera } from './camera.js';

let controls;

export const init = () => {
	controls = new THREE.TrackballControls(camera);
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

export const update = (delta) => {
	if (controls) controls.update(delta);
}