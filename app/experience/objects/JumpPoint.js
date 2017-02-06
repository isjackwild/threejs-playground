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


const createCurvedLine = (start, end) => {
	const dist = start.distanceTo(end);
	const divisions = Math.ceil(dist / 10);
	const points = [];
	console.log(start, end);

	const curve = new THREE.CubicBezierCurve3(
		new THREE.Vector3().copy(start),
		new THREE.Vector3(end.x, start.y, 0),
		new THREE.Vector3(start.x, end.y, 0),
		new THREE.Vector3().copy(end)
	);
	// const curve = new THREE.LineCurve3(
	// 	new THREE.Vector3().copy(start),
	// 	new THREE.Vector3().copy(end)
	// );

	const geom = new THREE.Geometry();
	geom.vertices = curve.getPoints(divisions);

	return { geom, curve };
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

		const curve = createCurvedLine(new THREE.Vector3(0, 0, 0), lineEnd);
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
		moveToAnchor(this.anchor);
		this.anchor.onEnter();
		this.parent.onExit();
	}
}

export default JumpPoint