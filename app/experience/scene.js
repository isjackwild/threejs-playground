const THREE = require('three');
import { camera } from './camera.js';
import { intersectableObjects } from './input-handler.js';
import ClipSphere from './objects/ClipSphere.js';
import { lights } from './lighting.js';

export let scene, boxMesh;


export const init = () => {
	scene = new THREE.Scene();
	scene.add(camera);
	lights.forEach( light => scene.add(light) );

	scene.add(new ClipSphere({ level: 0, position: new THREE.Vector3(0, 0, 0) }))
}

export const update = (delta) => {
}