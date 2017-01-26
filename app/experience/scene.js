const THREE = require('three');
import { camera } from './camera.js';
import { intersectableObjects } from './input-handler.js';
import ClipSphere from './objects/ClipSphere.js';
import { lights } from './lighting.js';
import { mesh as floor, update as updateFloor } from './objects/floor/floor.js';

export let scene, boxMesh;


export const init = () => {
	scene = new THREE.Scene();
	scene.add(camera);
	lights.forEach( light => scene.add(light) );

	scene.add( floor );

	const boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );
	const boxMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: false } );
	boxMesh = new THREE.Mesh( boxGeometry, boxMaterial );
	boxMesh.onIntersect = () => {
		console.log('FOCUS');
	}
	intersectableObjects.push(boxMesh);
	scene.add( boxMesh );

	scene.add(new ClipSphere({ level: 0, position: new THREE.Vector3(0, 0, 0) }))
	// scene.add( new THREE.AxisHelper(10));
}

export const update = (delta) => {
	updateFloor(delta);	
}