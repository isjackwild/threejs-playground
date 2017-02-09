const THREE = require('three');
import { Noise } from 'noisejs';


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


class CameraPath extends THREE.Line {
	constructor(args) {
		super(args);
		const { from, to } = args;

		this.from = from;
		this.to = to;

		this.setup();
	}
	
	setup() {
		this.path = createCurvedLine(this.from.position, this.to.position);

		this.geometry = new THREE.Geometry();
		this.geometry.vertices = this.path.getPoints(Math.ceil(this.path.getLength() / 5));
		const noise = new Noise(Math.random());
		const SCALE = 0.003;
		this.geometry.vertices.forEach((v) => {
			const valX = noise.simplex3(v.x * SCALE - 100, v.y * SCALE - 100, v.z * SCALE - 100);
			const valY = noise.simplex3(v.x * SCALE, v.y * SCALE, v.z * SCALE);
			const valZ = noise.simplex3(v.x * SCALE + 100, v.y * SCALE + 100, v.z * SCALE + 100);
			const offset = new THREE.Vector3(valX, valY, valZ).multiplyScalar(22);
			v.add(offset);
		});
		
		this.material = new THREE.LineBasicMaterial({
			color: 0x000000,
			opacity: 0.2,
			transparent: true,
		});
	}

	update() {
	}
}

export default CameraPath