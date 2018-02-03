import { Scene, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
import { camera } from './camera.js';
import { intersectableObjects } from './input-handler.js';
import { lights } from './lighting.js';
import InstancedParticles from './InstancedParticles';

export let scene, boxMesh, instancedParticles;


export const init = () => {
	scene = new Scene();
	scene.add(camera);
	lights.forEach( light => scene.add(light) );

	const boxGeometry = new BoxGeometry( 50, 50, 50 );
	const boxMaterial = new MeshBasicMaterial( { color: 0x0000ff } );
	boxMesh = new Mesh( boxGeometry, boxMaterial );
	// scene.add( boxMesh );

	instancedParticles = InstancedParticles();
	scene.add(instancedParticles.mesh);

	const posFolder = window.gui.addFolder('position');
	posFolder.add(instancedParticles.mesh.position, 'x', -5000, 5000);
	posFolder.add(instancedParticles.mesh.position, 'y', -5000, 5000);
	posFolder.add(instancedParticles.mesh.position, 'z', -5000, 5000);
};

export const update = (delta) => {
	instancedParticles.update(delta);
};
