const THREE = require('three');
import { NOISE_SCALE, NOISE_STEP, FLOOR_MAX_OFFSET } from '../../constants.js';
import { Noise } from 'noisejs';
import FRAGMENT_SHADER from './floor-fragment-shader.js';
import VERTEX_SHADER from './floor-vertex-shader.js';


console.log(FRAGMENT_SHADER, VERTEX_SHADER);

let noiseTime = 0; 
const noise = new Noise(Math.random());
const geom = new THREE.PlaneGeometry( 100, 100, 50, 50 );

geom.vertices.forEach((vert) => {
	const { x, y } = vert;
	vert.z = noise.simplex3(x * NOISE_SCALE, y * NOISE_SCALE, noiseTime) * FLOOR_MAX_OFFSET;
});
geom.normalsNeedUpdate = true;
console.log(geom);

// const material = new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true } );
const material = new THREE.ShaderMaterial({
	vertexShader: VERTEX_SHADER,
	fragmentShader: FRAGMENT_SHADER,
});
console.log(material);
export const mesh = new THREE.Mesh( geom, material );
mesh.rotation.x = Math.PI / -2;

export const update = (delta) => {
	noiseTime += NOISE_STEP * delta;
	// console.log(noiseTime);
	geom.vertices.forEach((vert) => {
		const { x, y } = vert;
		vert.z = noise.simplex3(x * NOISE_SCALE, y * NOISE_SCALE, noiseTime) * FLOOR_MAX_OFFSET;
		geom.verticesNeedUpdate = true;
		geom.normalsNeedUpdate = true;
	});
	geom.computeFaceNormals();
	geom.computeVertexNormals();
}