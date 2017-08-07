const THREE = require('three');
import { camera } from './camera.js';
import { intersectableObjects } from './input-handler.js';
import { lights } from './lighting.js';
import { FF_DIMENTIONS, FF_RESOLUTION } from './CONSTANTS.js';


export let scene, boxMesh;


export const init = () => {
	scene = new THREE.Scene();
	scene.add(camera);
	lights.forEach(light => {
		scene.add(light);
		if (light.target) scene.add(light.target);
	});

	const helper = new THREE.DirectionalLightHelper( lights[0], 50 );
	scene.add( helper );
	// var shadowHelper = new THREE.CameraHelper( lights[0].shadow.camera );
	// console.log(lights[0].shadow.camera);
	// scene.add( shadowHelper );

	// const boxGeometry = new THREE.BoxGeometry( 100, 100, 100, 10, 10, 10 );
	// const boxMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: false } );
	// boxMesh = new THREE.Mesh( boxGeometry, boxMaterial );
	// boxMesh.position.set(-200, FF_DIMENTIONS, 0);
	// boxMesh.castShadow = true;
	// scene.add( boxMesh );
}

export const update = (delta) => {

}