// import { Scene, BoxGeometry, PlaneGeometry, MeshBasicMaterial, Mesh, AxisHelper, DoubleSide, VideoTexture } from 'three';
// import * as THREE from 'three';
// import '../vendor/FBXLoader';
import { camera } from './camera.js';
import { intersectableObjects } from './input-handler.js';
import { lights } from './lighting.js';
import Skybox from './Skybox';
import Landscape from './Landscape';

export let scene, boxMesh, skybox, screen, tv, cinema, videoMaterial;


export const init = () => {
	scene = new THREE.Scene();
	scene.add(camera);
	lights.forEach( light => scene.add(light) );

	// skybox = Skybox();
	// scene.add(skybox.mesh);

	scene.add(new THREE.AxisHelper(1000));
	const floor = new THREE.Mesh(
		new THREE.PlaneGeometry(10000, 10000, 1),
		new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: true }),
	);
	floor.rotation.x = Math.PI * 0.5;
	scene.add(floor);

	const FBXLoader = new THREE.FBXLoader();
	FBXLoader.load('assets/models/cinema-room--06.fbx', (obj) => {
		scene.add(obj);
		tv = obj.getObjectByName('TV');
		cinema = obj.getObjectByName('Cinema');
		tv.material = videoMaterial;
		cinema.material = videoMaterial;
	}, () => {
	}, (err) => {
		console.warn(err);
	});
// 
	// scene.add(Landscape().mesh);

	// const video = document.createElement('video');
	// video.autoplay = true;
	// video.loop = true;
	// video.muted = true;
	// video.src = 'assets/video/tree.mp4';
	// video.onload = () => console.log('loaded');

	const video = document.createElement('video');
	document.body.appendChild(video);
	video.style.position = 'absolute';
	video.style.opacity = 1;
	video.style.width = '100px';
	video.style.height = 'auto';
	video.playsinline = true;
	video.playsInline = true;
	video.muted = true;
	const map = new THREE.VideoTexture(video);
	map.minFilter = THREE.LinearFilter;
	map.magFilter = THREE.LinearFilter;
	map.format = THREE.RGBFormat;
	video.onloadedmetadata = function() {
		console.log(this.videoWidth, this.videoHeight);
	};
	console.log(navigator.mediaDevices.getSupportedConstraints());
	// MediaDevices.getSupportedConstraints()
	navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } }, facingMode: 'environment' })
	// navigator.mediaDevices.getUserMedia({ video: true })
		.then(function(stream) {
			console.log('user media');
			// video.src = webkitURL.createObjectURL(stream);
			video.srcObject = stream;
			window.addEventListener('touchstart', () => video.play());
			video.play();
		})
		.catch(function(err) {
			console.error(err);
		});

	videoMaterial = new THREE.MeshStandardMaterial({
		color: 0xffffff,
		side: THREE.DoubleSide,
		map
	});

	screen = new THREE.Mesh(
		new THREE.PlaneGeometry(16 * 100, 9 * 100, 1),
		videoMaterial,
	);

	scene.add(screen);
	screen.position.z = 2000;
	screen.position.y = 9 * 100 * 0.5;
};

export const update = (delta) => {
};
