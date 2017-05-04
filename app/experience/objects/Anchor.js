const THREE = require('three');
import { moveToAnchor } from '../controls.js';
import { camera } from '../camera.js';
import { moveToPosition, moveAlongJumpPath } from '../controls.js';
import { fibonacciSphere } from '../UTIL.js';
import textLabel from './text-label.js';
import Artboard from './Artboard.js';
import { intersectableObjects } from '../input-handler.js';
// import JumpPoint from './JumpPoint.js';
import { ANCHOR_BASE_WIDTH, ANCHOR_WIDTH_PER_LINK, OPACITY, FOCUS_OPACITY } from '../CONSTANTS.js';


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
	uniform float grainStrength;

	varying vec2 vUv;

	void main() {
		float strength = grainStrength;

    	float x = (vUv.x + 4.0) * (vUv.y + 4.0) * 10.0;
		vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01) - 0.005) * strength;

		gl_FragColor = vec4(color + grain.xyz, opacity);
	}`;


class Anchor extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { position, id, jumpPoints, colors } = args;

		this._aId = id;

		this.isActive = false;
		this.colors = colors;
		this.anchorsToIds = jumpPoints;
		this.anchorsTo = [];
		this.anchorsFrom = [];
		this.pathsOut = {};

		this.position.copy(position);
	}
	
	setup() {
		this.setupDebugMesh();
		if (this.anchorsTo.length) this.setupArtboard();
		intersectableObjects.push(this);
	}

	setupDebugMesh() {
		// this.geometry = new THREE.CubeGeometry(ANCHOR_BASE_WIDTH, ANCHOR_BASE_WIDTH, ANCHOR_BASE_WIDTH);
		this.geometry = new THREE.SphereGeometry(ANCHOR_BASE_WIDTH, 20, 20);
		// this.material = new THREE.MeshStandardMaterial({
		// 	color: this.colors.anchor, 
		// 	opacity: 1,
		// 	// transparent: true,
		// 	side: THREE.DoubleSide,
		// 	roughness: 0.8,
		// 	metalness: 0.5,
		// 	// wireframe: true,
		// 	// visible: false,
		// });

		this.material = new THREE.ShaderMaterial({
			uniforms: {
				color: {
					type: "c",
					value: new THREE.Color(this.colors.anchor)
				},
				opacity: {
					type: "f",
					value: 0.9,
				},
				grainStrength: {
					type: "f",
					value: 3.0,
				}
			},
			vertexShader: VERTEX_SHADER,
			fragmentShader: NOISE_FRAGMENT_SHADER,
			transparent: true,
			side: THREE.BackSide,
		});
	}

	setupArtboard() {
		this.artboard = new Artboard({
			anchorsTo: this.anchorsTo,
			onClickTarget: this.onClickTarget.bind(this)
		});
		this.add(this.artboard);

		const averagePositionsTo = new THREE.Vector3();
		this.anchorsTo.forEach(anchor => averagePositionsTo.add(anchor.position));

		this.updateMatrixWorld();
		this.worldToLocal(averagePositionsTo);
		this.artboard.position.copy(averagePositionsTo).normalize().multiplyScalar(ANCHOR_BASE_WIDTH / 2);
		this.artboard.lookAt(averagePositionsTo);
	}

	onFocus() {
	}

	onBlur() {
	}

	onClick() {
		if (!this.isActive) return;
		this.isActive = false;
		moveToPosition(this.position);
	}

	onClickTarget(anchorToId) {
		const path = this.pathsOut[anchorToId];
		moveAlongJumpPath(path);
	}
}

export default Anchor