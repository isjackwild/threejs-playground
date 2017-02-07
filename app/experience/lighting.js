const THREE = require('three');
import { camera } from './camera.js';

export const lights = [];

export const init = () => {
	lights[0] = new THREE.AmbientLight( 0xffffff, 1 );
	lights[1] = new THREE.DirectionalLight( 0xffffff, 1 );
}
