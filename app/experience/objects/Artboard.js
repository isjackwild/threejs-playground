const THREE = require('three');
import { moveToAnchor } from '../controls.js';
import { camera } from '../camera.js';
import { moveToPosition } from '../controls.js';
import { fibonacciSphere } from '../UTIL.js';
import textLabel from './text-label.js';
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


class Artboard extends THREE.Object3D {
	constructor(args) {
		super(args);

		const { anchorsTo, onClickTarget } = args;

		this.anchorsTo = anchorsTo;
		this.onClickTarget = onClickTarget;
		this.setup();
	}
	
	setup() {
		this.setupBackground();
		this.setupTargets();
	}

	setupBackground() {
		this.background = new THREE.Mesh();
		this.background.scale.y = 0.5625;
		this.background.geometry = new THREE.PlaneGeometry(ANCHOR_BASE_WIDTH, ANCHOR_BASE_WIDTH);
		// this.background.material = new THREE.MeshLambertMaterial({
		// 	color: 0xfcd8d6,
		// 	opacity: 0.8,
		// 	transparent: true,
		// });

		this.background.material = new THREE.ShaderMaterial({
			uniforms: {
				color: {
					type: "c",
					value: new THREE.Color(0xfcd8d6)
				},
				opacity: {
					type: "f",
					value: 0.6
				},
				grainStrength: {
					type: "f",
					value: 9,
				}
			},
			vertexShader: VERTEX_SHADER,
			fragmentShader: NOISE_FRAGMENT_SHADER,
			transparent: true,
		});
		this.background.material.side = THREE.DoubleSide;
		this.add(this.background);
	}

	setupTargets() {
		this.anchorsTo.forEach((anchorTo, i) => {
			const target = new THREE.Mesh();
			target.geometry = new THREE.PlaneGeometry(ANCHOR_BASE_WIDTH / 5, ANCHOR_BASE_WIDTH / 5);
			target.material = new THREE.ShaderMaterial({
				uniforms: {
					color: {
						type: "c",
						value: new THREE.Color(0x0194ac)
					},
					opacity: {
						type: "f",
						value: 1
					},
					grainStrength: {
						type: "f",
						value: 9,
					}
				},
				vertexShader: VERTEX_SHADER,
				fragmentShader: NOISE_FRAGMENT_SHADER,
				transparent: true,
			});
			target.material.side = THREE.DoubleSide;
			target.onClick = () => this.onClickTarget(anchorTo._aId);
			target.onFocus = () => {};
			target.onBlur = () => {};

			this.updateMatrixWorld();
			const anchorLocalDirection = this.worldToLocal(new THREE.Vector3().copy(anchorTo.position)).normalize();
			
			if (this.anchorsTo.length > 1) {
				const sectionsWidth = ANCHOR_BASE_WIDTH / this.anchorsTo.length;
				target.position.x = (i * sectionsWidth) + (sectionsWidth / 2) - (ANCHOR_BASE_WIDTH / 2);
			}

			this.add(target);
			// intersectableObjects.push(target);
		});
	}
}

export default Artboard

