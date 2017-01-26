const THREE = require('three');
import { SCALE_WITH_LEVEL, BASE_RADIUS } from '../CONSTANTS.js';

class ClipSphere extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { level, position } = args;
		
		this.level = level;
		this.scalar = 1 / Math.pow(SCALE_WITH_LEVEL, level);
		this.position.copy(position);
		this.scale.multiplyScalar(this.scalar);

		this.setup();
	}

	setup() {
		this.geometry = new THREE.SphereGeometry(BASE_RADIUS);
		this.material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

		if (this.level < 4) this.addChildren();
	}

	addChildren() {
		const distFromCenter = Math.random() * BASE_RADIUS * this.scalar;
		const position = new THREE.Vector3(Math.random() * 2 - 1,  Math.random() * 2 - 1,  Math.random() * 2 - 1).normalize().multiplyScalar(distFromCenter);

		const child = new ClipSphere({ 
			level: this.level + 1,
			position,
		});
		this.add(child);
	}
}

export default ClipSphere;