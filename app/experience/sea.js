const THREE = require('three');
import _ from 'lodash';
import { FF_DIMENTIONS, FF_RESOLUTION, TOUCH_RADIUS } from './CONSTANTS.js';
import { scene } from './scene.js';
import { lookup as lookupFlowField } from './flow-field.js';
import { intersectableObjects } from './input-handler.js';
import { convertToRange } from '../lib/maths.js';

let geom, materials, sea, touchpad;
const topVerts = [];
const touchedPos = new THREE.Vector3(0, 0, 0);

const canvas = document.createElement('canvas');
canvas.className = 'touch-map';
const ctx = canvas.getContext('2d');
canvas.width = canvas.height = 100;
canvas.style.position = 'fixed';
canvas.style.zIndex = 111;
// canvas.style.display = 'none';
document.body.appendChild(canvas);

export const init = () => {
	geom = new THREE.BoxGeometry( FF_DIMENTIONS, FF_DIMENTIONS - 300, FF_DIMENTIONS, 50, 1, 50 );

	materials = [
		new THREE.MeshStandardMaterial( { color: 0x42abed, wireframe: false, opacity: 0.3, transparent: true, fog: false, side: THREE.DoubleSide } ),
		new THREE.MeshStandardMaterial( { color: 0x42abed, wireframe: false, opacity: 0.3, transparent: true, fog: false, side: THREE.DoubleSide } ),
		new THREE.MeshStandardMaterial( { color: 0x15aacc, wireframe: false, opacity: 0.8, transparent: true, metalness: 0.6, roughness: 0.3, fog: false, side: THREE.DoubleSide } ), //top
		new THREE.MeshStandardMaterial( { color: 0x42abed, wireframe: false, opacity: 0.3, transparent: true, fog: false, side: THREE.DoubleSide } ),
		new THREE.MeshStandardMaterial( { color: 0x42abed, wireframe: false, opacity: 0.3, transparent: true, fog: false, side: THREE.DoubleSide } ),
		new THREE.MeshStandardMaterial( { color: 0x42abed, wireframe: false, opacity: 0.3, transparent: true, fog: false, side: THREE.DoubleSide } ),
	]
	sea = new THREE.Mesh( geom, materials );
	// sea.castShadow = true;
	sea.receiveShadow = true;
	scene.add( sea );


	const touchpad = new THREE.Mesh(
		new THREE.PlaneGeometry( FF_DIMENTIONS, FF_DIMENTIONS ),
		new THREE.MeshStandardMaterial( { color: 0xff0000, wireframe: true } ),
	);
	intersectableObjects.push(touchpad);
	touchpad.rotation.x = Math.PI / -2;
	scene.add( touchpad );
	touchpad.position.set(0, FF_DIMENTIONS / 2 + 100, 0);
	touchpad.onIntersect = onIntersect;
	touchpad.material.visible = false;

	window.gui.add(materials[2], 'metalness');
	window.gui.add(materials[2], 'roughness');
	document.getElementsByClassName('dg')[0].addEventListener('mousemove', e => e.stopPropagation());

	const up = new THREE.Vector3(0, 1, 0);
	geom.faces.forEach(f => {
		if (f.normal.equals(up)) {
			if (!_.includes(topVerts, f.a)) topVerts.push(f.a);
			if (!_.includes(topVerts, f.b)) topVerts.push(f.b);
			if (!_.includes(topVerts, f.c)) topVerts.push(f.c);
		}
	});
}

const onIntersect = (intersects) => {
	touchedPos.copy(intersects[0].point);
	drawTouchMap(convertToRange(touchedPos.x, [-FF_DIMENTIONS / 2, FF_DIMENTIONS / 2], [0, 100]), convertToRange(touchedPos.z, [-FF_DIMENTIONS / 2, FF_DIMENTIONS / 2], [0, 100]));
}

const drawTouchMap = (x, y) => {
	ctx.beginPath();
	ctx.arc(x, y, TOUCH_RADIUS, 0, 2 * Math.PI, false);

	const grad = ctx.createRadialGradient(x, y, 0, x, y, TOUCH_RADIUS / 2);
	grad.addColorStop(0.15, 'rgba(255, 255, 255, 1)');
	grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
	ctx.fillStyle = grad;
	ctx.fill();
}

export const update = () => {
	
	ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	topVerts.forEach((i) => {

		const touchMap = ctx.getImageData(convertToRange(geom.vertices[i].x, [-FF_DIMENTIONS / 2, FF_DIMENTIONS / 2], [0, 100]), convertToRange(geom.vertices[i].z, [-FF_DIMENTIONS / 2, FF_DIMENTIONS / 2], [0, 100]), 1, 1).data;
		const impression = (touchMap[0] / 255) * 77 * -1;
		
		geom.vertices[i].y = (FF_DIMENTIONS / 2 + lookupFlowField(geom.vertices[i]).length() * 300) + impression;
	});

	geom.verticesNeedUpdate = true;
	geom.normalsNeedUpdate = true;
	geom.computeFaceNormals();
	geom.computeVertexNormals();
}