const THREE = require('three');
import { SCALE_WITH_LEVEL, BASE_RADIUS } from '../CONSTANTS.js';
import { intersectableObjects } from '../input-handler.js';
import { moveToSphere } from '../controls.js';

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
		this.isEnabled = true;
		this.setup();
	}

	setup() {
		this.geometry = new THREE.SphereGeometry(BASE_RADIUS, 20, 20);
		const color = (() => {
			switch (this.level) {
				case 0:
					return 0xff0000;
				case 1:
					return 0x00ff00;
				case 2:
					return 0x0000ff;
				case 3:
					return 0xff00ff;
				default:
					return 0xffffff;
			}
		})();
		this.color = color;
		this.material = new THREE.MeshLambertMaterial( { color, wireframe: true } );
		// this.material.side = THREE.DoubleSide;
		// this.geometry.computeFaceNormals();
		if (this.level < 4) this.addChildren();

		intersectableObjects.push(this);
	}

	addChildren() {
		const childCount = Math.ceil(Math.random() * 3) + 1;

		for (let i = 0; i < childCount; i++) {
			// TODO: Distribute using cellular noise
			const distFromCenter = BASE_RADIUS * 0.75;
			const position = new THREE.Vector3(Math.random() * 2 - 1,  Math.random() * 2 - 1,  Math.random() * 2 - 1).normalize().multiplyScalar(distFromCenter);
			const child = new ClipSphere({ 
				level: this.level + 1,
				position,
			});
			this.add(child);
		}
	}

	onFocus() {
		this.isFocused = true;
		// this.material.color.setHex(0xffffff);
	}

	onBlur() {
		this.isFocused = false;
		// this.material.color.setHex(this.color);
	}

	onClick() {
		moveToSphere(this);
	}
}

export default ClipSphere;