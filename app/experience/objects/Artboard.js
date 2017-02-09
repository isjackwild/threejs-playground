const THREE = require('three');
import { moveToAnchor } from '../controls.js';
import { camera } from '../camera.js';
import { moveToPosition } from '../controls.js';
import { fibonacciSphere } from '../UTIL.js';
import textLabel from './text-label.js';
import { intersectableObjects } from '../input-handler.js';
// import JumpPoint from './JumpPoint.js';
import { ANCHOR_BASE_WIDTH, ANCHOR_WIDTH_PER_LINK, OPACITY, FOCUS_OPACITY } from '../CONSTANTS.js';


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
		this.background.material = new THREE.MeshLambertMaterial({
			color: 0xff00ff,
			opacity: 0.8,
			transparent: true,
		});
		this.background.material.side = THREE.DoubleSide;
		this.add(this.background);
	}

	setupTargets() {
		this.anchorsTo.forEach((anchorTo, i) => {
			const target = new THREE.Mesh();
			target.geometry = new THREE.PlaneGeometry(ANCHOR_BASE_WIDTH / 5, ANCHOR_BASE_WIDTH / 5);
			target.material = new THREE.MeshLambertMaterial({
				color: 0x0000ff,
				opacity: 0.8,
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

