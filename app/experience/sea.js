const THREE = require('three');
import _ from 'lodash';
import { FF_DIMENTIONS, FF_RESOLUTION } from './CONSTANTS.js';
import { scene } from './scene.js';
import { lookup as lookupFlowField } from './flow-field.js';

let geom, materials, sea;
const topVerts = [];

export const init = () => {
	geom = new THREE.BoxGeometry( FF_DIMENTIONS, FF_DIMENTIONS - 120, FF_DIMENTIONS, 50, 1, 50 );

	materials = [
		new THREE.MeshStandardMaterial( { color: 0x42abed, wireframe: false, opacity: 0.3, transparent: true } ),
		new THREE.MeshStandardMaterial( { color: 0x42abed, wireframe: false, opacity: 0.3, transparent: true } ),
		new THREE.MeshStandardMaterial( { color: 0x42abed, wireframe: false, opacity: 0.8, transparent: true } ), //top
		new THREE.MeshStandardMaterial( { color: 0x42abed, wireframe: false, opacity: 0.3, transparent: true } ),
		new THREE.MeshStandardMaterial( { color: 0x42abed, wireframe: false, opacity: 0.3, transparent: true } ),
		new THREE.MeshStandardMaterial( { color: 0x42abed, wireframe: false, opacity: 0.3, transparent: true } ),
	]
	sea = new THREE.Mesh( geom, materials );
	// sea.castShadow = true;
	// sea.receiveShadow = true;
	console.log(sea);
	// sea.rotation.x = Math.PI / -2;
	// sea.position.set(0, FF_DIMENTIONS / 2 - 50, 0);
	scene.add( sea );

	const up = new THREE.Vector3(0, 1, 0);
	geom.faces.forEach(f => {
		if (f.normal.equals(up)) {
			if (!_.includes(topVerts, f.a)) topVerts.push(f.a);
			if (!_.includes(topVerts, f.b)) topVerts.push(f.b);
			if (!_.includes(topVerts, f.c)) topVerts.push(f.c);
		}
	});
}

export const update = () => {
	// geom.vertices.forEach((vert) => {
	// 	const { x, y, z } = vert;
	// 	vert.z = lookupFlowField(vert).length() * 200;
	// });

	topVerts.forEach((i) => {
		geom.vertices[i].y = FF_DIMENTIONS / 2 + lookupFlowField(geom.vertices[i]).length() * 300;
	});

	geom.verticesNeedUpdate = true;
	geom.normalsNeedUpdate = true;
	geom.computeFaceNormals();
	geom.computeVertexNormals();
}