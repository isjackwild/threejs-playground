const THREE = require('three');
// require('../../node_modules/three/examples/js/modifiers/BufferSubdivisionModifier.js');
import { FF_DIMENTIONS, FISH_MAX_VEL, FISH_MAX_STEER, FISH_SIBLING_DIST, FISH_SEPERATION, FISH_VIEW_DIST } from './CONSTANTS.js';
import { scene } from './scene.js';
import { convertToRange } from '../lib/maths.js';



export const Fish = (initPos = new THREE.Vector3()) => {
	const pos = new THREE.Vector3().copy(initPos);
	const vel = new THREE.Vector3();
	const acc = new THREE.Vector3();

	const tmp = new THREE.Vector3();
	const tmp2 = new THREE.Vector3();

	const geom = new THREE.BoxGeometry( 30, 20, 10 );
	const material = new THREE.MeshStandardMaterial( { color: 0xe8451b } );
	const mesh = new THREE.Mesh( geom, material );
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	scene.add( mesh );

	const seek = (target) => {
		tmp.copy(target).sub(pos);

		if (tmp.length() < 150) {
			const scale = convertToRange(tmp.length(), [0, 150], [0, FISH_MAX_VEL]);
			tmp.normalize().multiplyScalar(scale);
		} else {
			tmp.normalize().multiplyScalar(FISH_MAX_VEL);
		}
			
		tmp.sub(vel).clampLength(0, FISH_MAX_STEER); // Steer
		return tmp;
	}

	const seperate = (siblings) => {
		let count = 0;
		tmp.set(0, 0, 0);

		siblings.forEach(s => {
			const dist = pos.distanceTo(s.pos);
			if (dist <= FISH_SEPERATION && dist > 0) {
				tmp2.copy(pos).sub(s.pos).normalize();
				tmp.add(tmp2); //sum
				count++;
			}
		});
		if (count === 0) return tmp.set(0, 0, 0);

		tmp.divideScalar(count).multiplyScalar(FISH_MAX_VEL).sub(vel).clampLength(0, FISH_MAX_STEER);
		return tmp;
	}

	const align = (siblings) => {
		let count = 0;
		tmp.set(0, 0, 0);

		siblings.forEach(s => {
			const dist = pos.distanceTo(s.pos);
			if (dist <= FISH_VIEW_DIST) {
				tmp.add(s.vel); //sum
				count++;
			}
		});
		if (count === 0) return tmp.set(0, 0, 0);

		tmp.divideScalar(count).multiplyScalar(FISH_MAX_VEL).sub(vel).clampLength(0, FISH_MAX_STEER);
		return tmp;
	}

	const cohese = (siblings) => {
		let count = 0;
		tmp.set(0, 0, 0);

		siblings.forEach(s => {
			const dist = pos.distanceTo(s.pos);
			if (dist <= FISH_VIEW_DIST) {
				tmp.add(s.pos); //sum
				count++;
			}
		});

		if (count === 0) return tmp.copy(0, 0, 0);
		
		tmp.divideScalar(count);
		return seek(tmp);
	}

	const applyBehaviors = (target, siblings) => {
		applyForce(seek(target).multiplyScalar(0.5));
		applyForce(align(siblings).multiplyScalar(0.8));
		applyForce(cohese(siblings).multiplyScalar(0.3));
		applyForce(seperate(siblings).multiplyScalar(1.5));
	}

	const applyForce = (vec) => {
		acc.add(vec);
	}

	const update = (correction) => {
		acc.multiplyScalar(correction);
		vel.add(acc);
		vel.clampLength(0, FISH_MAX_VEL);

		mesh.position.copy(pos);
		mesh.lookAt(tmp.copy(pos).add(tmp2.copy(vel).normalize()));
		
		pos.add(vel);
		pos.clampScalar(-FF_DIMENTIONS.y / 2, FF_DIMENTIONS.y / 2);

		acc.set(0, 0, 0);
	}

	return { update, applyBehaviors, applyForce, pos, vel }
}