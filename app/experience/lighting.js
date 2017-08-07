const THREE = require('three');

export const lights = [];
lights[0] = new THREE.DirectionalLight( 0xffffff, 1 );
lights[0].position.set(-555, 1500, 333);
lights[0].castShadow = true;
lights[0].shadow.camera = new THREE.PerspectiveCamera();
lights[0].shadow.camera.far = 2000;
lights[1] = new THREE.AmbientLight( 0xffffff, 1 );