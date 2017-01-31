const THREE = require('three');
import { camera } from './camera.js';
import { intersectableObjects } from './input-handler.js';
import ClipSphere from './objects/ClipSphere.js';
import { lights } from './lighting.js';

export let scene, boxMesh;
let sphere;

export const init = () => {
	scene = new THREE.Scene();
	scene.add(camera);
	lights.forEach( light => scene.add(light) );
	sphere = new ClipSphere({ level: 0, position: new THREE.Vector3(0, 0, 0) });
	scene.add(sphere);
}

export const update = (delta) => {
	sphere.update(delta);
}