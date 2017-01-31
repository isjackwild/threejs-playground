const THREE = require('three');
import TweenLite from 'gsap';
import { BASE_RADIUS, OPACITY, FOCUSED_OPACITY, CAMERA_MOVE_SPEED } from '../CONSTANTS.js';



class Anchor extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { position } = args;
		
		this.position.copy(position);
		this.isFocused = false;
		this.update = this.update.bind(this);
		this.setup();
	}

	setup() {
		this.geometry = new THREE.SphereGeometry(BASE_RADIUS, 20, 20);
		this.material = new THREE.MeshLambertMaterial({
			color: 0xffffff,
			opacity: OPACITY,
			transparent: true,
			wireframe: true,
		});
	}

	update(delta) {
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
				opacity: OPACITY,
				ease: Sine.EaseInOut,
			}
		);
		this.isFocused = false;
	}
}

export default Anchor;