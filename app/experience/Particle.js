const THREE = require('three');
const MAX_VELOCITY = 50;
import { FF_DIMENTIONS, FF_RESOLUTION } from './CONSTANTS.js';

class Particle extends THREE.Vector3 {
	constructor(x, y, z) {
		super()
		// const { mass, position, life } = args;

		this.set(x, y, z);
		this.velocity = new THREE.Vector3();
		this.acceleration = new THREE.Vector3();
		this.mass = 0.003;
		this.update = this.update.bind(this);
		this.applyForce = this.applyForce.bind(this);
		this.tmp = new THREE.Vector3();
	}

	applyForce(f) {
		this.tmp.copy(f);
		this.acceleration.add(this.tmp);
	}

	update(delta) {
		this.acceleration.multiplyScalar(delta * this.mass);
		this.velocity.add(this.acceleration);
		this.velocity.clampLength(0, (MAX_VELOCITY * this.mass));
		this.add(this.velocity);

		if (this.x < -FF_DIMENTIONS.x / 2) this.x = -FF_DIMENTIONS.x / 2;
		if (this.x > FF_DIMENTIONS.x / 2) this.x = FF_DIMENTIONS.x / 2;
		if (this.y < -FF_DIMENTIONS.y / 2) this.x = -FF_DIMENTIONS.y / 2;
		if (this.y > FF_DIMENTIONS.y / 2) this.x = FF_DIMENTIONS.y / 2;
		if (this.z < -FF_DIMENTIONS.z / 2) this.z = -FF_DIMENTIONS.z / 2;
		if (this.z > FF_DIMENTIONS.z / 2) this.z = FF_DIMENTIONS.z / 2;


		this.acceleration.set(0, 0, 0);
	}
}

export default Particle;