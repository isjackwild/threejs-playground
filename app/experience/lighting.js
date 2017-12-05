const THREE = require('three');

export const lights = [];
lights[0] = new THREE.AmbientLight( 0xffffff, 1 );
lights[1] = new THREE.DirectionalLight();
lights[1].position.set(0, 100, -15);
lights[1].castShadow = true;
console.log(lights[1]);