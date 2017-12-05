const THREE = require('three');
import { JSONLoader, FBXLoader } from './loader.js';
import { camera } from './camera.js';
import { intersectableObjects } from './input-handler.js';
import { lights } from './lighting.js';

export let scene, character, floor, mixer, action = {};

const arrAnimations = [
	'idle',
	'walk',
	'run',
	'hello',
];

export const init = () => {
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x3f5972, 0.0003);
	scene.add(camera);
	lights.forEach(light => scene.add(light));

	scene.add(new THREE.AxisHelper(165));

	// const loader = new THREE.JSONLoader();
	// JSONLoader.load('/assets/models/ShakingHandsClipped-2.json', onLoadedModel);
	// loader.load('/assets/models/eva-animated.json', onLoadedModel);
	// colladaLoader.load('/assets/models/shake-hands.dae', onLoadedModel);
	FBXLoader.load('/assets/models/ShakingHandsClipped.fbx', onLoadedModel, (progress) => {
		console.log('progress');
	}, (err) => {
		console.warn(err);
	});

	floor = new THREE.Mesh(
		new THREE.PlaneGeometry(12000, 12000),
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
	floor.material.map.repeat.set(60, 60);
	floor.material.bumpMap.wrapS = THREE.RepeatWrapping;
	floor.material.bumpMap.wrapT = THREE.RepeatWrapping;
	floor.material.bumpMap.repeat.set(60, 60);
	floor.material.roughnessMap.wrapS = THREE.RepeatWrapping;
	floor.material.roughnessMap.wrapT = THREE.RepeatWrapping;
	floor.material.roughnessMap.repeat.set(60, 60);
	floor.material.bumpScale = 8;

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

// // JSON
// const onLoadedModel = (geom, materials) => {
// 	console.log(geom, materials);
// 	materials.forEach(m => {
// 		m.skinning = true;
// 	});

// 	character = new THREE.SkinnedMesh(
// 		geom,
// 		materials,
// 	);
// 	character.castShadow = true;
// 	character.scale.set(165, 165, 165);
// 	scene.add(character);

// 	mixer = new THREE.AnimationMixer(character);
// 	action.pay = mixer.clipAction(geom.animations[0]);
// 	action.pay.setEffectiveWeight(1);

// 	action.pay.play();
// };


// // COLLADA
// const onLoadedModel = (collada) => {
// 	character = collada.skins[0];
// 	character.castShadow = true;
// 	// character.scale.set(165, 165, 165);
// 	scene.add(character);

// 	mixer = new THREE.AnimationMixer(character);
// 	action.hello = mixer.clipAction(character.geom.animations[0]);
// 	action.idle = mixer.clipAction(character.geom.animations[0]);
// 	action.walk = mixer.clipAction(character.geom.animations[0]);
// 	action.run = mixer.clipAction(character.geom.animations[0]);

// 	action.hello.setEffectiveWeight(1);
// 	action.idle.setEffectiveWeight(1);
// 	action.walk.setEffectiveWeight(1);
// 	action.run.setEffectiveWeight(1);

// 	action.hello.play();
// };


// FBX
const onLoadedModel = (character) => {
	console.log(character);
	character.children.forEach(c => c.castShadow = true);
	character.castShadow = true;
	character.scale.set(0.51, 0.51, 0.51);
	scene.add(character);

	mixer = new THREE.AnimationMixer(character);
	action.shake = mixer.clipAction(character.animations[0]);
	action.shake.setLoop(THREE.LoopPingPong);
	action.shake.setEffectiveTimeScale(0.2);

	action.shake.play();
};

export const update = (delta) => {
	if (mixer) mixer.update(delta / 16.6666);
};