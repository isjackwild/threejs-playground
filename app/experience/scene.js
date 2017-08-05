const THREE = require('three');
import { camera } from './camera.js';
import { intersectableObjects } from './input-handler.js';
import { lights } from './lighting.js';
import { FF_DIMENTIONS, FF_RESOLUTION } from './CONSTANTS.js';


export let scene, boxMesh;


export const init = () => {
	scene = new THREE.Scene();
	scene.add(camera);
	lights.forEach( light => scene.add(light) );

	const boxGeometry = new THREE.BoxGeometry( FF_DIMENTIONS, FF_DIMENTIONS, FF_DIMENTIONS );
	const boxMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
	boxMesh = new THREE.Mesh( boxGeometry, boxMaterial );
	scene.add( boxMesh );
}

export const update = (delta) => {
}