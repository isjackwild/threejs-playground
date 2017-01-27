const THREE = require('three');
import TweenLite from 'gsap';
import { SCALE_WITH_LEVEL, BASE_RADIUS, ACTIVE_OPACITY, INACTIVE_OPACITY, FOCUSED_OPACITY, CAMERA_MOVE_SPEED } from '../CONSTANTS.js';
import { intersectableObjects } from '../input-handler.js';
import { moveToSphere } from '../controls.js';

const fibonacciSphere = (samples = 1, randomize = false) => {
	let rand = 1;
	if (randomize) rand = Math.random() * samples;

	const points = [];
	const offset = 2 / samples;
	const increment = Math.PI * (3 - Math.sqrt(5));

	for (let i = 0; i < samples; i++) {
		const y = ((i * offset) - 1) + offset / 2;
		const r = Math.sqrt(1 - Math.pow(y, 2));
		const phi = ((i + rand) % samples) * increment;

		const x = Math.cos(phi) * r;
		const z = Math.sin(phi) * r;

		points.push({ x, y, z });
	}

	return points;
}

class ClipSphere extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { level, position } = args;
		
		this.level = level;
		// this.scaleFactor = Math.pow(SCALE_WITH_LEVEL, level);
		this.scalar = 1 / SCALE_WITH_LEVEL;
		this.position.copy(position);
		this.scale.multiplyScalar(this.scalar);
		this.isFocused = false;
		this.isEnabled = (this.level === 0 ? true : false);
		this.isCameraCurrent = false;
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
		this.material = new THREE.MeshLambertMaterial({
			color: 0xffffff,
			opacity: (this.level === 0 ? ACTIVE_OPACITY : INACTIVE_OPACITY),
			transparent: true,
			// wireframe: true,
		});
		// this.material.side = THREE.DoubleSide;
		// this.geometry.computeFaceNormals();
		if (this.level < 4) this.addChildren();

		intersectableObjects.push(this);
	}

	addChildren() {
		const childCount = 5;
		const points = fibonacciSphere(childCount);

		for (let i = 0; i < childCount; i++) {
			// TODO: Distribute using cellular noise
			const distFromCenter = BASE_RADIUS * 0.66;
			// const position = new THREE.Vector3(Math.random() * 2 - 1,  Math.random() * 2 - 1,  Math.random() * 2 - 1).normalize().multiplyScalar(distFromCenter);
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
		this.isEnabled = true;
		TweenLite.to(
			this.material,
			CAMERA_MOVE_SPEED,
			{
				opacity: ACTIVE_OPACITY,
				ease: Sine.EaseInOut,
			}
		);
	}

	deactivate() {
		this.isEnabled = false;
		TweenLite.to(
			this.material,
			CAMERA_MOVE_SPEED,
			{
				opacity: INACTIVE_OPACITY,
				ease: Sine.EaseInOut,
			}
		);
	}

	onFocus() {
		if (!this.isEnabled) return;
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
		if (!this.isEnabled) return;
		TweenLite.to(
			this.material,
			0.1,
			{
				opacity: ACTIVE_OPACITY,
				ease: Sine.EaseInOut,
			}
		);
		this.isFocused = false;
	}

	onClick() {
		if (!this.isEnabled) return;
		moveToSphere(this);
	}
}

export default ClipSphere;