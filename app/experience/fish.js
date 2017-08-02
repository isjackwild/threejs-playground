const THREE = require('three');
require('../../node_modules/three/examples/js/modifiers/BufferSubdivisionModifier.js');
import { FF_DIMENTIONS, FISH_MAX_VEL, FISH_MAX_STEER, FISH_SIBLING_DIST, FISH_SEPERATION } from './CONSTANTS.js';
import { scene } from './scene.js';



export const Fish = (initPos = new THREE.Vector3()) => {
	const pos = new THREE.Vector3().copy(initPos);
	const vel = new THREE.Vector3();
	const acc = new THREE.Vector3();
	const tmp = new THREE.Vector3();
	const tmp2 = new THREE.Vector3();
	const spherical = new THREE.Spherical();

	const geom = new THREE.BoxGeometry( 30, 30, 30 );
	const modifier = new THREE.BufferSubdivisionModifier(5);
	const geom2 = modifier.modify(geom);
	const material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
	const mesh = new THREE.Mesh( geom2, material );
	scene.add( mesh );

	const align = (siblings) => {
		tmp2.set(0, 0, 0);
		let count = 0;
		
		siblings.forEach(s => {
			if (pos.distanceTo(s.pos) <= FISH_SIBLING_DIST) {
				tmp2.add(s.vel);
				count++;
			}
		});
		// console.log(count);
		steer(tmp2.divideScalar(count));
	}

	const cohesion = (siblings) => {
		tmp2.set(0, 0, 0);
		let count = 0;
		
		siblings.forEach(s => {
			if (pos.distanceTo(s.pos) <= FISH_SIBLING_DIST) {
				tmp2.add(s.pos);
				count++;
			}
		});
		// console.log(count);
		seek(tmp2.divideScalar(count));
	}

	const seperate = (siblings) => {
		tmp2.set(0, 0, 0);
		let count = 0;
		
		siblings.forEach(s => {
			if (pos.distanceTo(s.pos) <= FISH_SEPERATION) {
				tmp2.add(new THREE.Vector3().copy(pos).sub(s.pos));
				count++;
			}
		});
		// console.log(count);
		applyForce(tmp2.divideScalar(count).normalize().multiplyScalar(FISH_MAX_VEL));
	}

	const wander = () => {
		const phi = Math.random() * Math.PI;
		const theta = Math.random() * Math.PI * 2;
		spherical.set(80, phi, theta).makeSafe();

		tmp.copy(vel).multiplyScalar(250).add(pos).add(new THREE.Vector3().setFromSpherical(spherical));

		seek(tmp);
	}

	const seek = (target) => {
		tmp2.copy(target).sub(pos).multiplyScalar(FISH_MAX_VEL);
		applyForce(tmp2);
	}

	const steer = (desired) => {
		tmp.copy(desired).sub(vel).multiplyScalar(FISH_MAX_STEER);
		applyForce(tmp);
	}

	const applyForce = (vec) => {
		acc.add(vec);
	}

	const update = (correction) => {
		acc.multiplyScalar(correction);
		vel.add(acc);
		vel.clampLength(0, FISH_MAX_VEL);
		pos.add(vel);
		pos.clampScalar(-FF_DIMENTIONS / 2, FF_DIMENTIONS / 2);

		mesh.position.copy(pos);
		acc.set(0, 0, 0);
	}

	return { pos, vel, applyForce, update, align, cohesion, seperate, wander }
}