const THREE = require('three');
import TweenLite from 'gsap';
import { SCALE_WITH_LEVEL, BASE_RADIUS, ACTIVE_OPACITY, INACTIVE_OPACITY, FOCUSED_OPACITY, PARENT_ACTIVE_OPACITY, CAMERA_MOVE_SPEED } from '../CONSTANTS.js';
import { intersectableObjects } from '../input-handler.js';
import { moveToSphere } from '../controls.js';
import { fibonacciSphere } from '../UTIL.js';


class ClipSphere extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { level, position } = args;
		
		this.level = level;
		// this.scaleFactor = Math.pow(SCALE_WITH_LEVEL, level);
		this.scalar = 1 / SCALE_WITH_LEVEL;
		this.restPosition = position;
		if (this.level < 2) this.position.copy(position);
		this.scale.multiplyScalar(this.scalar);
		this.isFocused = false;
		this.isActive = (this.level === 0 ? true : false);
		this.isRotating = (this.level === 0 ? true : false);
		this.isCameraCurrent = false;
		this.rotationAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
		this.rotationAxisNegated = new THREE.Vector3().copy(this.rotationAxis).multiplyScalar(-1);
		this.rotationIncrement = ((Math.random() / 2) + 1) / 750;
		this.update = this.update.bind(this);
		this.setup();
	}

	setup() {
		this.geometry = new THREE.SphereGeometry(BASE_RADIUS, 20, 20);
		// const color = (() => {
		// 	switch (this.level) {
		// 		case 0:
		// 			return 0xff0000;
		// 		case 1:
		// 			return 0x00ff00;
		// 		case 2:
		// 			return 0x0000ff;
		// 		case 3:
		// 			return 0xff00ff;
		// 		default:
		// 			return 0xffffff;
		// 	}
		// })();
		// this.color = color;
		const opacity = (() => {
			if (this.level === 0) return ACTIVE_OPACITY;
			if (this.level === 1) return PARENT_ACTIVE_OPACITY;
			return INACTIVE_OPACITY;
		})();
		this.material = new THREE.MeshLambertMaterial({
			color: 0xffffff,
			opacity,
			transparent: true,
			// wireframe: true,
		});
		if (this.level < 1) this.addChildren();

		intersectableObjects.push(this);
	}

	update(delta) {
		if (this.isRotating) {
			this.rotationAxis.applyAxisAngle(this.rotationAxisNegated, this.rotationIncrement * delta)
			this.rotateOnAxis(this.rotationAxis, this.rotationIncrement * delta);
		}
		this.children.forEach(child => child.update(delta));
	}

	addChildren() {
		if (this.level > 3) return;
		const childCount = 12;
		const points = fibonacciSphere(childCount, true);

		for (let i = 0; i < childCount; i++) {
			const distFromCenter = BASE_RADIUS * 0.66;
			const { x, y, z } = points[i];
			const position = new THREE.Vector3(x, y, z).multiplyScalar(distFromCenter);
			const child = new ClipSphere({ 
				level: this.level + 1,
				position,
			});
			this.add(child);
		}
	}

	activate() {
		this.isRotating = true;
		TweenLite.to(
			this.material,
			CAMERA_MOVE_SPEED,
			{
				opacity: this.children.length ? ACTIVE_OPACITY : PARENT_ACTIVE_OPACITY,
				ease: Sine.EaseInOut,
				onComplete: () => { this.isActive = true; }
			}
		);

		this.children.forEach(child => child.onParentActivated());
	}

	deactivate() {
		this.isActive = false;
		TweenLite.to(
			this.material,
			CAMERA_MOVE_SPEED,
			{
				opacity: INACTIVE_OPACITY,
				ease: Sine.EaseInOut,
			}
		);

		this.children.forEach(child => child.onParentDeactivated());
	}

	onParentActivated() {
		const { x, y, z} = this.restPosition;
		const delay = CAMERA_MOVE_SPEED * 0.33
		TweenLite.to(
			this.position,
			CAMERA_MOVE_SPEED * 0.9,
			{ x, y, z, delay, ease: Back.easeOut.config(2) }
		);
		TweenLite.to(
			this.material,
			CAMERA_MOVE_SPEED,
			{ opacity: PARENT_ACTIVE_OPACITY, delay, ease: Sine.EaseInOut }
		);
	}

	onParentDeactivated() {
		const { x, y, z} = this.restPosition;
		const ease = Sine.EaseInOut;
		TweenLite.to(
			this.material,
			CAMERA_MOVE_SPEED,
			{ opacity: INACTIVE_OPACITY, ease }
		);
	}

	onEnter() {
		this.isRotating = false;
		if (this.parent instanceof ClipSphere) {
			this.parent.deactivate();
			this.parent.children.forEach(child => child.deactivate());
		} else {
			this.deactivate();
		}
		this.children.forEach((child) => {
			child.addChildren();
			requestAnimationFrame(() => {
				child.activate();
			});
		});
	}

	onFocus() {
		if (!this.isActive) return;
		TweenLite.to(
			this.material,
			0.1,
			{
				opacity: FOCUSED_OPACITY,
				ease: Sine.EaseInOut,
			}
		);
		this.isFocused = true;
	}

	onBlur() {
		if (!this.isActive) return;
		TweenLite.to(
			this.material,
			0.1,
			{
				opacity: this.children.length ? ACTIVE_OPACITY : PARENT_ACTIVE_OPACITY,
				ease: Sine.EaseInOut,
			}
		);
		this.isFocused = false;
	}

	onClick() {
		if (!this.isActive) return;
		this.onEnter();
		moveToSphere(this);
	}
}

export default ClipSphere;