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
	scene.fog = new THREE.FogExp2(0x000000, 0.00025);
	console.log(scene);
	scene.add(camera);
	lights.forEach( light => scene.add(light) );

	scene.add(new THREE.AxisHelper(200));

	const loader = new THREE.JSONLoader();
	loader.load('/assets/models/eva-animated.json', onLoadedModel);


	floor = new THREE.Mesh(
		new THREE.PlaneGeometry(15000, 15000),
		new THREE.MeshStandardMaterial({
			color: 0xe1e6ed,
			metalness: 0,
			roughness: 0.33,
			map: new THREE.TextureLoader().load('/assets/maps/floor-bump.jpg'),
			bumpMap: new THREE.TextureLoader().load('/assets/maps/floor-bump.jpg'),
			roughnessMap: new THREE.TextureLoader().load('/assets/maps/floor-roughness.jpg'),
		}),
	);
	floor.material.map.wrapS = THREE.RepeatWrapping;
	floor.material.map.wrapT = THREE.RepeatWrapping;
	floor.material.map.repeat.set(30, 30);
	floor.material.bumpMap.wrapS = THREE.RepeatWrapping;
	floor.material.bumpMap.wrapT = THREE.RepeatWrapping;
	floor.material.bumpMap.repeat.set(40, 40);
	floor.material.roughnessMap.wrapS = THREE.RepeatWrapping;
	floor.material.roughnessMap.wrapT = THREE.RepeatWrapping;
	floor.material.roughnessMap.repeat.set(30, 30);
	floor.material.bumpScale = 5;

	floor.receiveShadow = true;
	floor.rotation.x = Math.PI * -0.5;

	// const box = new THREE.Mesh(
	// 	new THREE.BoxGeometry(100, 100, 100),
	// 	new THREE.MeshStandardMaterial({ metalness: 0, roughness: 0.33 })
	// );
	// box.position.set(0, 350, 0);
	// box.castShadow = true;
	// scene.add(box);

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
	character.scale.set(165, 165, 165);
	scene.add(character);
};

export const update = (delta) => {

};