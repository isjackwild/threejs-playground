const THREE = require('three');
import { moveToAnchor } from '../controls.js';
import { camera } from '../camera.js';
import { fibonacciSphere } from '../UTIL.js';
import textLabel from './text-label.js';
import JumpPoint from './JumpPoint.js';
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
	varying vec2 vUv;

	void main() {
		float strength = 8.0;

    	float x = (vUv.x + 4.0) * (vUv.y + 4.0) * 10.0;
		vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01) - 0.005) * strength;

		gl_FragColor = vec4(color + grain.xyz, opacity);
	}`;



class Anchor extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { position, colors, jumpPoints, id } = args;
		
		this.contentId = id;
		this.jumpPoints = jumpPoints;
		this.position.copy(position);
		this.colors = colors;
		this.size = ANCHOR_BASE_WIDTH + (ANCHOR_WIDTH_PER_LINK * this.jumpPoints.length);
		// this.setup();
	}
	
	setup() {
		this.geometry = new THREE.CubeGeometry(this.size, this.size, this.size);
		// this.material = new THREE.MeshLambertMaterial({
		// 	color: this.color,
		// 	opacity: 1,
		// 	transparent: true,
		// 	wireframe: true,
		// 	visible: false,
		// });

		this.material = new THREE.ShaderMaterial({
			uniforms: {
				color: {
					type: "c",
					value: new THREE.Color(this.colors.anchor)
				},
				opacity: {
					type: "f",
					value: 0.5
				}
			},
			vertexShader: VERTEX_SHADER,
			fragmentShader: NOISE_FRAGMENT_SHADER,
			// depthTest: false,
			// depthWrite: false,
			side: THREE.DoubleSide,
			transparent: true
		});


		this.material.side = THREE.DoubleSide;
		// this.label = textLabel(this);
		this.addJumpPoints();
	}

	addJumpPoints() {
		const points = fibonacciSphere(this.jumpPoints.length, true);

		this.jumpPoints.forEach((anchorId, i) => {
			const distFromCenter = this.size * 0.5;
			const { x, y, z } = points[i];
			// const position = new THREE.Vector3(x, y, z).multiplyScalar(distFromCenter);

			const jumpPoint = new JumpPoint({ anchorId, distFromCenter });
			this.add(jumpPoint);
			jumpPoint.setup();
		});
	}

	onEnter() {
		this.children.forEach(jumpPoint => jumpPoint.activate());
	}

	onExit() {
		this.children.forEach(jumpPoint => jumpPoint.deactivate());
	}

	update() {
		// this.label.update();
	}
}

export default Anchor