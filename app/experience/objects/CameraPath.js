const THREE = require('three');
import { Noise } from 'noisejs';
import Easing from '../EASINGS.js';

console.log(Easing);

const createCurvedLine = (start, end) => {
	const dir = new THREE.Vector3().copy(end).sub(start);
	const dist = dir.length();
	dir.normalize();
	dir.applyAxisAngle(new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random()).normalize(), 0.6);
	dir.multiplyScalar(dist / 3);

	const points = [];

	const cpOne = new THREE.Vector3().copy(start).add(dir);
	const cpTwo = new THREE.Vector3().copy(end).sub(dir);

	const curve = new THREE.CubicBezierCurve3(start, cpOne, cpTwo, end);

	return curve;
}


// class CameraPath extends THREE.Line {
// 	constructor(args) {
// 		super(args);
// 		const { from, to } = args;

// 		this.from = from;
// 		this.to = to;

// 		this.setup();
// 	}
	
// 	setup() {
// 		this.path = createCurvedLine(this.from.position, this.to.position);

// 		this.geometry = new THREE.Geometry();
// 		this.geometry.vertices = this.path.getPoints(Math.ceil(this.path.getLength() / 5));
// 		const noise = new Noise(Math.random());
// 		const SCALE = 0.003;
// 		this.geometry.vertices.forEach((v) => {
// 			const valX = noise.simplex3(v.x * SCALE - 100, v.y * SCALE - 100, v.z * SCALE - 100);
// 			const valY = noise.simplex3(v.x * SCALE, v.y * SCALE, v.z * SCALE);
// 			const valZ = noise.simplex3(v.x * SCALE + 100, v.y * SCALE + 100, v.z * SCALE + 100);
// 			const offset = new THREE.Vector3(valX, valY, valZ).multiplyScalar(22);
// 			v.add(offset);
// 		});
		
// 		this.material = new THREE.LineBasicMaterial({
// 			color: 0x000000,
// 			opacity: 0.2,
// 			transparent: true,
// 		});
// 	}

// 	update() {
// 	}
// }
// 

 
class CameraPath extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { from, to } = args;

		this.from = from;
		this.to = to;

		this.setup();
	}
	
	setup() {
		this.path = createCurvedLine(this.from.position, this.to.position);

		const segs = Math.ceil(this.path.getLength() / 5);
		const points = this.path.getPoints(segs);

		this.geometry = new THREE.Geometry();
		const tmp = new THREE.Vector3(0, 0, 0);
		const maxWidth = 18;

		const step = Math.PI * 2 / points.length;
		points.forEach((point, i) => {
			const control = (Math.cos(((i * step) - Math.PI)) / 2) + 0.5;
			console.log(control);
			const thisWidth = maxWidth * Easing.Sinusoidal.EaseInOut(control);
			tmp.x = 2 + thisWidth / 2;
			const v1 = new THREE.Vector3().copy(point).add(tmp);
			const v2 = new THREE.Vector3().copy(point).sub(tmp);
			this.geometry.vertices.push(v1, v2);
		});

		for (let i = 0; i < this.geometry.vertices.length; i++) {
			if (i % 2 == 0 && i > 1) {
				const face1 = new THREE.Face3(i - 2, i, i + 1);
				const face2 = new THREE.Face3(i - 2, i - 1, i + 1);
				this.geometry.faces.push(face1, face2);
			} 
		}

		this.geometry.computeFaceNormals();
		this.geometry.computeVertexNormals();
		this.geometry.computeBoundingSphere();
		this.geometry.verticesNeedUpdate = true;


		this.material = new THREE.MeshBasicMaterial({
			color: 0xff0000,
			opacity: 1,
			// transparent: true,
			wireframe: true,
			side: THREE.DoubleSide,
		});
	}

	update() {
	}
}

export default CameraPath