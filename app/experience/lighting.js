const THREE = require('three');

export const lights = [];
lights[0] = new THREE.AmbientLight( 0xffffff, 0.4 );
lights[1] = new THREE.DirectionalLight( 0xffffff, 0.8 );