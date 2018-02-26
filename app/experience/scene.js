// import { Scene, BoxGeometry, PlaneGeometry, MeshBasicMaterial, Mesh, AxisHelper, DoubleSide, VideoTexture } from 'three';
import * as THREE from 'three';
import { camera } from './camera.js';
import { intersectableObjects } from './input-handler.js';
import { lights } from './lighting.js';
import Skybox from './Skybox';
import Landscape from './Landscape';

export let scene, boxMesh, skybox, screen;


export const init = () => {
	scene = new THREE.Scene();
	scene.add(camera);
	lights.forEach( light => scene.add(light) );

	skybox = Skybox();
	scene.add(skybox.mesh);

	scene.add(new THREE.AxisHelper(1000));
	const floor = new THREE.Mesh(
		new THREE.PlaneGeometry(10000, 10000, 1),
		new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: true }),
	);
	floor.rotation.x = Math.PI * 0.5;
	scene.add(floor);

	scene.add(Landscape().mesh);

	const video = document.createElement('video');
	video.autoplay = true;
	video.loop = true;
	video.muted = true;
	video.src = 'assets/video/tree.mp4';
	video.onload = () => console.log('loaded');
	const map = new THREE.VideoTexture(video);
	map.minFilter = THREE.LinearFilter;
	map.magFilter = THREE.LinearFilter;
	map.format = THREE.RGBFormat;

	screen = new THREE.Mesh(
		new THREE.PlaneGeometry(16 * 100, 9 * 100, 1),
		new THREE.MeshBasicMaterial({
			color: 0xffffff,
			side: THREE.DoubleSide,
			map
		}),
	);
	scene.add(screen);
	screen.position.z = 2000;
	screen.position.y = 9 * 100 * 0.5;
};

export const update = (delta) => {
};
