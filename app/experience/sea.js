const THREE = require('three');
import _ from 'lodash';
import { FF_DIMENTIONS, FF_RESOLUTION } from './CONSTANTS.js';
import { scene } from './scene.js';
import { lookup as lookupFlowField } from './flow-field.js';

let geom, material, sea;
const topVerts = [];

export const init = () => {
	geom = new THREE.BoxGeometry( FF_DIMENTIONS, FF_DIMENTIONS - 200, FF_DIMENTIONS, 50, 1, 50 );
	material = new THREE.MeshBasicMaterial( { color: 0xffff00, wireframe: true } );
	sea = new THREE.Mesh( geom, material );
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
		geom.vertices[i].y = FF_DIMENTIONS / 2 + lookupFlowField(geom.vertices[i]).length() * 200;
	});

	geom.verticesNeedUpdate = true;
	geom.normalsNeedUpdate = true;
	geom.computeFaceNormals();
	geom.computeVertexNormals();
}