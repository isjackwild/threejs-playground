const THREE = require('three');
import { Noise } from 'noisejs';
import { moveToAnchor, moveAlongJumpPath } from '../controls.js';
import { anchorRefs, scene } from '../scene.js';
import { intersectableObjects } from '../input-handler.js';
import { JUMP_POINT_RADIUS, FOCUS_OPACITY, OPACITY } from '../CONSTANTS.js';


const cubicEaseInOut = (k) => {
	if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
	return 0.5 * ( ( k -= 2 ) * k * k + 2 );
}

const sineEaseInOut = (k) => {
	return - 0.5 * ( Math.cos( Math.PI * k ) - 1 );
}

// const createCurvedLine = (start, end) => {
// 	const geom = new THREE.Geometry();
// 	const dist = start.distanceTo(end);
// 	const divisions = Math.ceil(dist / 10);
// 	console.log(divisions)

// 	for (let i = 0; i < divisions; i++) {
// 		const control = i / divisions;
// 		const control1 = cubicEaseInOut(control);
// 		const control2 = sineEaseInOut(control);
// 		const vec = new THREE.Vector3(
// 			end.x * control1,
// 			end.y * control1,
// 			end.z * control,
// 		);
// 		geom.vertices.push(vec);
// 	}

// 	return geom;
// }


const createCurvedLine = (start, end, ctx) => {
	const dir = new THREE.Vector3().copy(end).sub(start);
	const dist = dir.length();
	dir.normalize();
	dir.applyAxisAngle(new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random()).normalize(), 0.3);
	dir.multiplyScalar(dist / 3);

	const divisions = Math.ceil(dist / 5);
	const points = [];

	const cpOne = new THREE.Vector3().copy(start).add(dir);
	const cpTwo = new THREE.Vector3().copy(end).sub(dir);

	// const helperOne = new THREE.Mesh(new THREE.SphereGeometry(7), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
	// const helperTwo = new THREE.Mesh(new THREE.SphereGeometry(7), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
	// helperOne.position.copy(cpOne);
	// helperTwo.position.copy(cpTwo);
	// ctx.add(helperOne);
	// ctx.add(helperTwo);

	const curve = new THREE.CubicBezierCurve3(start, cpOne, cpTwo, end);
	const geom = new THREE.Geometry();
	geom.vertices = curve.getPoints(divisions);

	// const noise = new Noise(Math.random());
	// const SCALE = 0.003;
	// geom.vertices.forEach((v) => {
	// 	const valX = noise.simplex3(v.x * SCALE - 100, v.y * SCALE - 100, v.z * SCALE - 100);
	// 	const valY = noise.simplex3(v.x * SCALE, v.y * SCALE, v.z * SCALE);
	// 	const valZ = noise.simplex3(v.x * SCALE + 100, v.y * SCALE + 100, v.z * SCALE + 100);
	// 	const offset = new THREE.Vector3(valX, valY, valZ).multiplyScalar(22);
	// 	v.add(offset);
	// });

	return { geom, curve };
}


const VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NOISE_FRAGMENT_SHADER = `
	uniform vec3 color;
	uniform float opacity;
	varying vec2 vUv;

	void main() {
		float strength = 6.0;

    	float x = (vUv.x + 4.0) * (vUv.y + 4.0) * 10.0;
		vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01) - 0.005) * strength;

		gl_FragColor = vec4(color + grain.xyz, opacity);
	}`;



class JumpPoint extends THREE.Object3D {
	constructor(args) {
		super(args);
		const { anchorId, distFromCenter } = args;
		this.isActive = false;
		this.distFromCenter = distFromCenter;
		this.anchorId = anchorId;
		this.anchor = anchorRefs[this.anchorId];
	}
	
	setup() {
		this.addTargets();
		this.addLines();
	}

	addTargets() {
		const geom = new THREE.SphereGeometry(JUMP_POINT_RADIUS, 20, 20);
		// const material = new THREE.MeshLambertMaterial({
		// 	color: this.anchor.color,
		// 	opacity: 0.8,
		// 	transparent: true,
		// 	// wireframe: true,
		// });

		const material = new THREE.ShaderMaterial({
			uniforms: {
				color: {
					type: "c",
					value: new THREE.Color(this.anchor.colors.jump)
				},
				opacity: {
					type: "f",
					value: 0.8
				}
			},
			vertexShader: VERTEX_SHADER,
			fragmentShader: NOISE_FRAGMENT_SHADER,
			// depthTest: false,
			// depthWrite: false,
			side: THREE.DoubleSide,
			transparent: true
		});


		this.target = new THREE.Mesh(geom, material);
		this.target.onClick = this.onClick.bind(this);
		this.target.onFocus = this.onFocus.bind(this);
		this.target.onBlur = this.onBlur.bind(this);
		this.target.position.copy(this.anchor.position).normalize().multiplyScalar(this.distFromCenter);

		this.add(this.target);
		intersectableObjects.push(this.target); //TODO only add to intersectable objects when activated
	}

	addLines() {
		const material = new THREE.LineBasicMaterial({
			color: new THREE.Color(this.anchor.colors.line),
			transparent: true,
			opacity: 0.15,
		});
		const lineEnd = new THREE.Vector3().copy(this.anchor.position);
		this.parent.updateMatrixWorld();
		this.updateMatrixWorld();
		this.worldToLocal(lineEnd);

		const curve = createCurvedLine(new THREE.Vector3(0, 0, 0), lineEnd, this);
		this.cameraPath = curve.curve;
		this.line = new THREE.Line(curve.geom, material);
		this.add(this.line);
	}

	activate() {
		this.isActive = true;
	}

	deactivate() {
		this.isActive = false; //TODO remove from intersectable objects array
	}

	onFocus() {
		return;
		if (!this.isActive) return;
		TweenLite.to(
			this.material,
			0.1,
			{
				opacity: FOCUS_OPACITY,
				ease: Sine.EaseInOut,
			}
		);
	}

	onBlur() {
		return;
		if (!this.isActive) return;
		TweenLite.to(
			this.material,
			0.1,
			{
				opacity: OPACITY,
				ease: Sine.EaseInOut,
			}
		);
	}

	onClick() {
		if (!this.isActive) return;
		this.isActive = false;
		// moveToAnchor(this.anchor);
		moveAlongJumpPath(this);
		this.anchor.onEnter();
		this.parent.onExit();
	}
}

export default JumpPoint