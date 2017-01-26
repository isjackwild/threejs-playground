const THREE = require('three');
import { SCALE_WITH_LEVEL, BASE_RADIUS } from '../CONSTANTS.js';
import { intersectableObjects } from '../input-handler.js';

class ClipSphere extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { level, position } = args;
		
		this.level = level;
		this.scalar = 1 / Math.pow(SCALE_WITH_LEVEL, level);
		this.position.copy(position);
		this.scale.multiplyScalar(this.scalar);
		this.isFocused = false;

		this.setup();
	}

	setup() {
		this.geometry = new THREE.SphereGeometry(BASE_RADIUS, 20, 20);
		this.material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
		// this.geometry.computeFaceNormals();
		// if (this.level < 4) this.addChildren();

		intersectableObjects.push(this);
	}

	addChildren() {
		const childCount = Math.ceil(Math.random() * 3);

		for (let i = 0; i < childCount; i++) {
			// TODO: Distribute using cellular noise
			const distFromCenter = Math.random() * BASE_RADIUS * this.scalar;
			const position = new THREE.Vector3(Math.random() * 2 - 1,  Math.random() * 2 - 1,  Math.random() * 2 - 1).normalize().multiplyScalar(distFromCenter);
			const child = new ClipSphere({ 
				level: this.level + 1,
				position,
			});
			this.add(child);
		}
	}

	onFocus() {
		if (this.isFocused) return;
		this.isFocused = true;
		console.log('focus');
		// this.material.color.setHex(0x0000ff);
	}

	onBlur() {
		if (!this.isFocused) return;
		this.isFocused = false;
		console.log('blur');
		// this.material.color.setHex(0xff0000);
	}

	onClick() {
		console.log('clicked');
	}
}

export default ClipSphere;