const THREE = require('three');
import Particle from './Particle';
import { scene } from './scene.js';
import { lookup as lookupFlowField } from './flow-field.js';
import { FF_DIMENTIONS, FF_RESOLUTION } from './CONSTANTS.js';

let dust;

export const init = () => {
	const dustGeom = new THREE.Geometry();

	for (let i = 0; i <= 2500; i++) {
		const v = new Particle(
			Math.random() * FF_DIMENTIONS.x - FF_DIMENTIONS.x / 2,
			Math.random() * FF_DIMENTIONS.y - FF_DIMENTIONS.y / 2,
			Math.random() * FF_DIMENTIONS.z - FF_DIMENTIONS.z / 2,
		);
		dustGeom.vertices.push(v);
	}
	dust = new THREE.Points(dustGeom, new THREE.PointsMaterial({ size: 1, color: 0xffffff, blending: THREE.AdditiveBlending }));
	scene.add(dust);
}

export const update = (delta) => {
	dust.geometry.vertices.forEach(p => {
		p.applyForce(lookupFlowField(p));
		p.update(delta);
	});
	dust.geometry.verticesNeedUpdate = true;
}