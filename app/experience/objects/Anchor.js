const THREE = require('three');
import { moveToAnchor } from '../controls.js';
import { fibonacciSphere } from '../UTIL.js';
import JumpPoint from './JumpPoint.js';
import { ANCHOR_RADIUS, OPACITY, FOCUS_OPACITY } from '../CONSTANTS.js';

class Anchor extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { position, color, jumpPoints } = args;
		
		this.jumpPoints = jumpPoints;
		this.position.copy(position);
		this.color = color;
		this.setup();
	}
	
	setup() {
		this.geometry = new THREE.SphereGeometry(ANCHOR_RADIUS, 20, 20);
		this.material = new THREE.MeshLambertMaterial({
			color: this.color,
			opacity: 0.6,
			transparent: true,
			wireframe: true,
		});

		this.addJumpPoints();
	}

	addJumpPoints() {
		const points = fibonacciSphere(this.jumpPoints.length, true);

		this.jumpPoints.forEach((anchorId, i) => {
			const distFromCenter = ANCHOR_RADIUS * 0.7;
			const { x, y, z } = points[i];
			const position = new THREE.Vector3(x, y, z).multiplyScalar(distFromCenter);

			const jumpPoint = new JumpPoint({ position, anchorId });
			this.add(jumpPoint);
		});
	}

	onEnter() {
		this.children.forEach(jumpPoint => jumpPoint.activate());
	}

	onExit() {
		this.children.forEach(jumpPoint => jumpPoint.deactivate());
	}
}

export default Anchor