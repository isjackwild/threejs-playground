const THREE = require('three');
import { Noise } from 'noisejs';
import Easing from '../EASINGS.js';

const VERTEX_SHADER = `
  varying vec2 vUv;
  varying float colMix;

  void main() {
  	colMix = 1.0;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NOISE_FRAGMENT_SHADER = `
	uniform vec3 colorTo;
	uniform vec3 colorFrom;
	uniform float opacity;
	uniform float grainStrength;

	varying vec2 vUv;
	varying float colMix;

	void main() {
		float strength = grainStrength;
		vec3 color = mix(colorTo, colorFrom, colMix);

    	float x = (vUv.x + 4.0) * (vUv.y + 4.0) * 10.0;
		vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01) - 0.005) * strength;

		gl_FragColor = vec4(colorTo + grain.xyz, opacity);
	}`;

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

function assignUVs(geometry) {

    geometry.faceVertexUvs[0] = [];

    geometry.faces.forEach(function(face) {

        var components = ['x', 'y', 'z'].sort(function(a, b) {
            return Math.abs(face.normal[a]) > Math.abs(face.normal[b]);
        });

        var v1 = geometry.vertices[face.a];
        var v2 = geometry.vertices[face.b];
        var v3 = geometry.vertices[face.c];

        geometry.faceVertexUvs[0].push([
            new THREE.Vector2(v1[components[0]], v1[components[1]]),
            new THREE.Vector2(v2[components[0]], v2[components[1]]),
            new THREE.Vector2(v3[components[0]], v3[components[1]])
        ]);

    });

    geometry.uvsNeedUpdate = true;
}

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

		this.geometry = new THREE.Geometry({
			dynamic: true,
		});
		const tmp = new THREE.Vector3(0, 0, 0);
		const tmp2 = new THREE.Vector3(0, 0, 0);
		const up = new THREE.Vector3(0, 1, 0);
		const maxWidth = 22;

		const noise = new Noise(Math.random());
		const SCALE = 0.0005;
		const NOISE_OFFSET_MAX = 40;
		const step = Math.PI * 2 / points.length;

		const angleTo = this.from.position.angleTo(this.to.position);
		const directionalNormal = new THREE.Vector3().copy(this.to.position).sub(this.from.position).normalize().applyAxisAngle(up, Math.PI / 2);
		// const directionalNormal = new THREE.Vector3(1, 0, 0);

		const colourMixAttrs = [];

		points.forEach((point, i) => {
			const mix = i / points.length;
			colourMixAttrs.push(mix, mix);
			tmp.copy(point);

			const valX = noise.simplex3(tmp.x * SCALE - 100, tmp.y * SCALE - 100, tmp.z * SCALE - 100);
			const valY = noise.simplex3(tmp.x * SCALE, tmp.y * SCALE, tmp.z * SCALE);
			const valZ = noise.simplex3(tmp.x * SCALE + 100, tmp.y * SCALE + 100, tmp.z * SCALE + 100);
			const offset = new THREE.Vector3(valX, valY, valZ).multiplyScalar(NOISE_OFFSET_MAX);
			tmp.add(offset);

			const control = (Math.cos(((i * step) - Math.PI)) / 2) + 0.5;
			const thisWidth = maxWidth * Easing.Sinusoidal.EaseInOut(control);
			
			// directionalNormal.multiplyScalar(this.width / 2);

			tmp2.copy(directionalNormal);
			tmp2.multiplyScalar(thisWidth / 2);
			// tmp2.set(thisWidth / 2, 0, 0);
			// tmp2.applyAxisAngle(up, angleTo);
			const v1 = new THREE.Vector3().copy(tmp).add(tmp2);
			const v2 = new THREE.Vector3().copy(tmp).sub(tmp2);
			this.geometry.vertices.push(v1, v2);
		});

		for (let i = 0; i < this.geometry.vertices.length; i++) {
			if (i % 2 == 0 && i > 1) {
				const face1 = new THREE.Face3(i - 2, i, i + 1);
				const face2 = new THREE.Face3(i - 2, i - 1, i + 1);
				this.geometry.faces.push(face1, face2);
			} 
		}

		assignUVs(this.geometry);
		this.geometry.computeFaceNormals();
		this.geometry.computeVertexNormals();
		this.geometry.computeVertexNormals();
		// this.geometry.computeFlatVertexNormals();
		this.geometry.verticesNeedUpdate = true;
		this.geometry.elementsNeedUpdate = true;
		this.geometry.uvsNeedUpdate = true;
		this.geometry.normalsNeedUpdate = true;

		// this.material = new THREE.MeshBasicMaterial({
		// 	color: 0xff0000,
		// 	opacity: 1,
		// 	// transparent: true,
		// 	// wireframe: true,
		// 	side: THREE.DoubleSide,
		// });
		// 
		
		// this.geometry.computeBoundingBox();
		// const max = this.geometry.boundingBox.max;
		// const min = this.geometry.boundingBox.min;
		// const offset = new THREE.Vector2(0 - min.x, 0 - min.y);
		// const range = new THREE.Vector2(max.x - min.x, max.y - min.y);
		// const faces = this.geometry.faces;

		// faces.forEach((face, i) => {
		// 	const v1 = face.a;
		// 	const v2 = face.b;
		// 	const v3 = face.c;

		// 	this.geometry.faceVertexUvs[0].push([
		// 		new THREE.Vector2((v1.x + offset.x)/range.x, (v1.y + offset.y)/range.y),
		// 		new THREE.Vector2((v2.x + offset.x)/range.x, (v2.y + offset.y)/range.y),
		// 		new THREE.Vector2((v3.x + offset.x)/range.x, (v3.y + offset.y)/range.y)
		// 	]);
		// });

		

		this.material = new THREE.ShaderMaterial({
			uniforms: {
				colorFrom: {
					type: "c",
					value: new THREE.Color(this.from.colors.anchor)
				},
				colorTo: {
					type: "c",
					value: new THREE.Color(this.to.colors.anchor)
				},
				opacity: {
					type: "f",
					value: 1
				},
				grainStrength: {
					type: "f",
					value: 13.0,
				}
			},
			// attributes: {
			// 	colorMix: {
			// 		type: "f",
			// 		value: colourMixAttrs,
			// 	}
			// },
			vertexShader: VERTEX_SHADER,
			fragmentShader: NOISE_FRAGMENT_SHADER,
			side: THREE.DoubleSide,
			transparent: true,
		});

		requestAnimationFrame(() => {
			this.geometry.computeFaceNormals();
			this.geometry.computeVertexNormals();
			this.geometry.computeVertexNormals();
			// this.geometry.computeFlatVertexNormals();
			this.geometry.verticesNeedUpdate = true;
			this.geometry.elementsNeedUpdate = true;
			this.geometry.uvsNeedUpdate = true;
			this.geometry.normalsNeedUpdate = true;
		})
	}

	update() {
	}
}

export default CameraPath