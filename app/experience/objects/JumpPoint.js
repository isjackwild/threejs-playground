const THREE = require('three');
import { moveToAnchor } from '../controls.js';
import { anchorRefs } from '../scene.js';
import { intersectableObjects } from '../input-handler.js';
import { JUMP_POINT_RADIUS, FOCUS_OPACITY, OPACITY } from '../CONSTANTS.js';


const cubicEaseInOut = (k) => {
	if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
	return 0.5 * ( ( k -= 2 ) * k * k + 2 );
}

const sineEaseInOut = (k) => {
	return - 0.5 * ( Math.cos( Math.PI * k ) - 1 );
}

const createCurvedLine = (start, end) => {
	const geom = new THREE.Geometry();
	const dist = start.distanceTo(end);
	const divisions = Math.ceil(dist / 10);

	for (let i = 0; i < divisions; i++) {
		const control = i / divisions;
		const control1 = cubicEaseInOut(control);
		const control2 = sineEaseInOut(control);
		const vec = new THREE.Vector3(
			end.x * control1,
			end.y * control1,
			end.z * control,
		);
		geom.vertices.push(vec);
	}

	return geom;
}

class JumpPoint extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { anchorId, distFromCenter } = args;
		this.isActive = false;
		this.distFromCenter = distFromCenter;
		this.anchorId = anchorId;
		this.anchor = anchorRefs[this.anchorId];
	}
	
	setup() {
		this.position.copy(this.anchor.position).normalize().multiplyScalar(this.distFromCenter);
		this.geometry = new THREE.SphereGeometry(JUMP_POINT_RADIUS, 20, 20);
		this.material = new THREE.MeshLambertMaterial({
			color: this.anchor.color,
			opacity: 1,
			transparent: true,
			wireframe: true,
		});

		intersectableObjects.push(this); //TODO only add to intersectable objects when activated
		this.addLines();
	}

	addLines() {
		const material = new THREE.LineBasicMaterial({
			color: 0x000000,
			linewidth: 15,
		});
		const lineEnd = new THREE.Vector3().copy(this.anchor.position);
		this.parent.updateMatrixWorld();
		this.updateMatrixWorld();
		this.worldToLocal(lineEnd);
		const lineGeom = createCurvedLine(new THREE.Vector3(0, 0, 0), lineEnd);
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
		moveToAnchor(this.anchor);
		this.anchor.onEnter();
		this.parent.onExit();
	}
}

export default JumpPoint