const THREE = require('three');
import { moveToAnchor } from '../controls.js';
import { anchorRefs } from '../scene.js';
import { intersectableObjects } from '../input-handler.js';
import { JUMP_POINT_RADIUS, FOCUS_OPACITY, OPACITY } from '../CONSTANTS.js';

class JumpPoint extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { position, anchorId } = args;
		this.isActive = false;
		this.anchorId = anchorId;
		this.position.copy(position);
		this.setup();
	}
	
	setup() {
		this.anchor = anchorRefs[this.anchorId]
		this.geometry = new THREE.SphereGeometry(JUMP_POINT_RADIUS, 20, 20);
		this.material = new THREE.MeshLambertMaterial({
			color: 0xff00ff,
			opacity: OPACITY,
			transparent: true,
			wireframe: true,
		});

		intersectableObjects.push(this); //TODO only add to intersectable objects when activated
	}

	addLines() {
		const material = new THREE.MeshLambertMaterial({
			color: 0xffffff,
		});
		const lineGeom = new THREE.Geometry();
		const lineEnd = new THREE.Vector3().copy(this.anchor.position);
		this.parent.updateMatrixWorld();
		this.updateMatrixWorld();
		this.worldToLocal(lineEnd);
		lineGeom.vertices.push(
			new THREE.Vector3(0, 0, 0),
			lineEnd,
		);
		this.line = new THREE.Line(lineGeom, material);
		this.add(this.line);
	}

	activate() {
		this.isActive = true;
	}

	deactivate() {
		this.isActive = false; //TODO remove from intersectable objects array
	}

	onFocus() {
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
		moveToAnchor(this.anchor);
		this.anchor.onEnter();
		this.parent.onExit();
	}
}

export default JumpPoint