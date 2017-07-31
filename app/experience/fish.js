const THREE = require('three');
import { FF_DIMENTIONS, FISH_MAX_VEL } from './CONSTANTS.js';
import { scene } from './scene.js';

export const Fish = (initPos = new THREE.Vector3()) => {
	const pos = new THREE.Vector3().copy(initPos);
	const vel = new THREE.Vector3();
	const acc = new THREE.Vector3();

	const geom = new THREE.BoxGeometry( 30, 30, 30 );
	const material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
	const mesh = new THREE.Mesh( geom, material );
	scene.add( mesh );

	const applyForce = (vec) => {
		acc.add(vec);
	}

	const update = () => {
		vel.add(acc);
		vel.clampLength(0, FISH_MAX_VEL);
		pos.add(vel);
		pos.clampScalar(-FF_DIMENTIONS / 2, FF_DIMENTIONS / 2);
		console.log(acc, vel, pos);


		mesh.position.copy(pos);
		acc.set(0, 0, 0);
	}

	return { pos, applyForce, update }
}