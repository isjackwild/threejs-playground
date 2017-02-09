const THREE = require('three');
import JumpPoint from './JumpPoint.js';
import { moveToAnchor } from '../controls.js';
import { fibonacciSphere } from '../UTIL.js';
import { intersectableObjects } from '../input-handler.js';
import { GROUP_RADIUS, OPACITY, FOCUS_OPACITY } from '../CONSTANTS.js';

class Group extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { position, paths } = args;
		// console.log(paths);
		this.paths = paths;
		this.position.copy(position);
		this.setup();
	}
	
	setup() {
		this.isActive = false;
		this.geometry = new THREE.SphereGeometry(GROUP_RADIUS, 20, 20);
		this.material = new THREE.MeshLambertMaterial({
			color: 0x000000,
			opacity: 1,
			transparent: true,
			wireframe: true,
			visible: false,
		});
		this.material.side = THREE.DoubleSide;

		intersectableObjects.push(this);
		this.addJumpPoints();
	}

	addJumpPoints() {
		const points = fibonacciSphere(this.paths.length, true);
		this.paths.forEach((path, i) => {
			const anchorId = path.paths[0].id;

			const distFromCenter = GROUP_RADIUS * 0.7;
			const { x, y, z } = points[i];
			// const position = new THREE.Vector3(x, y, z).multiplyScalar(distFromCenter);

			const jumpPoint = new JumpPoint({ anchorId, distFromCenter });
			jumpPoint.activate();
			this.add(jumpPoint);
			jumpPoint.setup();
		});
	}

	onEnter() {
		this.isActive = false;
		this.children.forEach(jumpPoint => jumpPoint.activate());
	}

	onExit() {
		this.children.forEach(jumpPoint => jumpPoint.deactivate());
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
		moveToAnchor(this);
		this.onEnter();
	}
}

export default Group