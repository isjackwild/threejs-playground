const THREE = require('three');

export const lights = [];
lights[0] = new THREE.DirectionalLight( 0xffa3ee, 2 );
lights[0].position.set(-555, 1500, 333);
lights[0].castShadow = true;
lights[0].shadow.camera = new THREE.PerspectiveCamera();
lights[0].shadow.camera.far = 2500;
lights[1] = new THREE.AmbientLight( 0xffffff, 1 );