const THREE = require('three');
export let camera;

export const init = () => {
	camera = new THREE.PerspectiveCamera(45, window.app.width / window.app.height, 1, 15000);
	camera.position.z = 700;
	camera.position.y = 165;
}

export const onResize = (w, h) => {
	if (!camera) return
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
}