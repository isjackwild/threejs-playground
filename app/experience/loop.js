const THREE = require('three');
import { init as initScene, update as updateScene, scene } from './scene.js';
import { init as initCamera, camera } from './camera.js';
import { init as initControls, update as updateControls, controls } from './controls.js';
import { update as updateFlowField, lookup as lookupFlowField } from './flow-field.js';
import { init as initInput } from './input-handler.js';
import { init as initFlowField } from './flow-field.js';
import { Fish } from './fish.js';

import { FF_DIMENTIONS } from './CONSTANTS.js';

let canvas;
let raf, then, now, delta;
let currentCamera, currentScene;
let fishes = [];
export let renderer;

export const init = () => {
	canvas = document.getElementsByClassName('canvas')[0];
	setupRenderer();
	initCamera();
	initControls();
	initScene();
	initInput();
	// initFlowField();

	for (let i = 0; i < 150; i++) {
		const x = Math.random() * FF_DIMENTIONS - FF_DIMENTIONS / 2;
		const y = Math.random() * FF_DIMENTIONS - FF_DIMENTIONS / 2;
		const z = Math.random() * FF_DIMENTIONS - FF_DIMENTIONS / 2;
		fishes.push(Fish(new THREE.Vector3(x, y, z)));
	}

	currentCamera = camera;
	currentScene = scene;
	now = new Date().getTime();
	animate();
}

export const kill = () => {
	cancelAnimationFrame(raf);
}

const setupRenderer = () => {
	renderer = new THREE.WebGLRenderer({
		canvas,
		antialias: true,
	});
	renderer.setClearColor(0x000000);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
}

export const onResize = (w, h) => {
	if (renderer) renderer.setSize(w, h);
}

const update = (delta) => {
	updateScene(delta);
	fishes.forEach(f => {
		// f.applyForce(lookupFlowField(f.pos).multiplyScalar(10));
		f.wander();
		// f.align(fishes);
		f.seperate(fishes);
		// f.cohesion(fishes);
		f.update(delta);
	});
	updateFlowField(delta);
	updateControls(delta);
}

const render = () => {
	renderer.render(currentScene, currentCamera);
}

const animate = () => {
	then = now ? now : null;
	now = new Date().getTime();
	delta = then ? (now - then) / 16.666 : 1;

	update(delta);
	render();
	raf = requestAnimationFrame(animate);
}
