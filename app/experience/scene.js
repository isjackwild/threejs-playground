const THREE = require('three');
import { camera } from './camera.js';
import { intersectableObjects } from './input-handler.js';
import { lights } from './lighting.js';

export let scene, character, floor;

const arrAnimations = [
	'idle',
	'walk',
	'run',
	'hello',
];

export const init = () => {
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x000000, 0.004);
	console.log(scene);
	scene.add(camera);
	lights.forEach( light => scene.add(light) );

	scene.add(new THREE.AxisHelper(30));

	const loader = new THREE.JSONLoader();
	loader.load('/assets/models/eva-animated.json', onLoadedModel);

	floor = new THREE.Mesh(
		new THREE.PlaneGeometry(5000, 5000),
		new THREE.MeshBasicMaterial({ color: 0xe1e6ed }),
	);
	floor.receiveShadow = true;
	floor.rotation.x = Math.PI * -0.5;
	console.log(floor);

	const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
	box.position.set(0, 2, 0);
	box.castShadow = true;
	scene.add(box);

	scene.add(new THREE.DirectionalLightHelper(lights[1], 5));

	scene.add(floor);
};

const onLoadedModel = (geom, materials) => {
	materials.forEach(m => {
		m.skinning = true;
	});

	character = new THREE.SkinnedMesh(
		geom,
		materials,
	);
	character.castShadow = true;
	console.log(character);
	scene.add(character);
};

export const update = (delta) => {

};