const THREE = require('three');
import { Noise } from 'noisejs';

import { NOISE_SCALE, NOISE_STEP, FLOOR_MAX_OFFSET, FLOOR_SIZE, TOUCH_RADIUS } from '../../constants.js';
import FRAGMENT_SHADER from './floor-fragment-shader.js';
import VERTEX_SHADER from './floor-vertex-shader.js';
import NOISE_3D from './noise-3d-glsl.js';

import { intersectableObjects } from '../../input-handler.js';

let noiseTime = 0; 
const noise = new Noise(Math.random());
const geom = new THREE.PlaneGeometry( FLOOR_SIZE, FLOOR_SIZE, 50, 50 );
let isIntersected = false;


geom.vertices.forEach((vert) => {
	const { x, y } = vert;
	vert.z = noise.simplex3(x * NOISE_SCALE, y * NOISE_SCALE, noiseTime) * FLOOR_MAX_OFFSET;
});
geom.normalsNeedUpdate = true;
console.log(geom);

// const material = new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true } );
const material = new THREE.ShaderMaterial({
	vertexShader: VERTEX_SHADER,
	fragmentShader: NOISE_3D + FRAGMENT_SHADER,
	// uniforms: {
	// 	uTouch: { value: new THREE.Vector3() },
	// }
});
export const mesh = new THREE.Mesh( geom, material );
intersectableObjects.push(mesh);
mesh.rotation.x = Math.PI / -2;



const canvas = document.createElement('canvas');
canvas.className = 'touch-map';
const ctx = canvas.getContext('2d');
canvas.width = canvas.height = FLOOR_SIZE;
document.body.appendChild(canvas);


export const update = (delta) => {
	noiseTime += NOISE_STEP * delta;
	geom.vertices.forEach((vert, i) => {
		const { x, y } = vert;
		
		const n = noise.simplex3(x * NOISE_SCALE, y * NOISE_SCALE, noiseTime) * FLOOR_MAX_OFFSET;

		const touchMap = ctx.getImageData(x + FLOOR_SIZE / 2, y + FLOOR_SIZE  / 2, 1, 1).data;
		const impression = (touchMap[0] / 255) * FLOOR_MAX_OFFSET * -1;
		if (x === 0 && y === 0) console.log(impression);
		vert.z = impression + n;
	});

	geom.verticesNeedUpdate = true;
	geom.normalsNeedUpdate = true;
	geom.computeFaceNormals();
	geom.computeVertexNormals();
}


const drawTouchMap = (x, y) => {
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
	ctx.arc(x, y, TOUCH_RADIUS, 0, 2 * Math.PI, false);

	const grad = ctx.createRadialGradient(x, y, 0, x, y, TOUCH_RADIUS / 2);
	grad.addColorStop(0.15, '#fff');
	grad.addColorStop(1.0, '#000');
	ctx.fillStyle = grad;
	ctx.fill();
}

const onIntersect = (intersects) => {
	isIntersected = true;
	const vec = intersects[0].point;
	// material.uniforms.uTouch.value.copy(vec);
	
	requestAnimationFrame(() => {
		drawTouchMap(vec.x + FLOOR_SIZE / 2, (vec.z * -1 + FLOOR_SIZE / 2));
	});
}
mesh.onIntersect = onIntersect;

const onBlur = () => {
	if (!isIntersected) return;
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	isIntersected = false;
}
mesh.onBlur = onBlur;