const THREE = require('three');

export const lights = [];
lights[0] = new THREE.AmbientLight( 0xffffff, 0.8 );
lights[1] = new THREE.DirectionalLight(0xffffff, 0.25);
lights[1].position.set(-70, 400, -220);
lights[1].castShadow = true;
lights[1].shadow.camera = new THREE.PerspectiveCamera();
lights[1].shadow.camera.far = 5000;
console.log(lights[1]);