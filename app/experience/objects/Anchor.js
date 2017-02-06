const THREE = require('three');
import { moveToAnchor } from '../controls.js';
import { camera } from '../camera.js';
import { fibonacciSphere } from '../UTIL.js';
import textLabel from './text-label.js';
import JumpPoint from './JumpPoint.js';
import { ANCHOR_BASE_WIDTH, ANCHOR_WIDTH_PER_LINK, OPACITY, FOCUS_OPACITY } from '../CONSTANTS.js';



class Anchor extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { position, color, jumpPoints, id } = args;
		
		this.contentId = id;
		this.jumpPoints = jumpPoints;
		this.position.copy(position);
		this.color = color;
		this.size = ANCHOR_BASE_WIDTH + (ANCHOR_WIDTH_PER_LINK * this.jumpPoints.length);
		// this.setup();
	}
	
	setup() {
		this.geometry = new THREE.CubeGeometry(this.size, this.size, this.size);
		this.material = new THREE.MeshLambertMaterial({
			color: this.color,
			opacity: 1,
			transparent: true,
			wireframe: true,
		});
		this.material.side = THREE.DoubleSide;
		this.label = textLabel(this);
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
		this.label.update();
	}
}

export default Anchor