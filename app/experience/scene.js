const THREE = require('three');
import { camera } from './camera.js';
import { intersectableObjects } from './input-handler.js';
import { lights } from './lighting.js';
import ClipSphere from './objects/ClipSphere.js';

export let scene, boxMesh;


export const init = () => {
	scene = new THREE.Scene();
	scene.add(camera);
	lights.forEach( light => scene.add(light) );

	scene.add( new THREE.AxisHelper(10)); // RED = X, GREEN = Y, BLUE = Z; 

	const clipSphere = new ClipSphere({ 
		level: 0,
		position: new THREE.Vector3(0, 0, 0),
	});
	scene.add(clipSphere);
}

export const update = (delta) => {
}