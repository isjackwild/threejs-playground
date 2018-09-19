import _ from 'lodash';
import PubSub from 'pubsub-js';

import { camera } from './camera.js';
import { targets } from './scene.js';

const mouseVector = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
export const ray = raycaster.ray;
export const intersectableObjects = [];
const zeroVec = new THREE.Vector2(0, 0);


export const init = () => {
	addEventListeners();
}

const addEventListeners = () => {
	if (window.mobile) {
		window.addEventListener('deviceorientation', _.throttle(onDeviceOrientation, 33));
		window.addEventListener('touchstart', onClick);
	} else {
		window.addEventListener('mousemove', _.throttle(onMouseMove, 33));
		window.addEventListener('click', onClick);
	}
}

const onMouseMove = ({ clientX, clientY }) => {
	const x = 2 * (clientX / window.innerWidth) - 1;
	const y = 1 - 2 * (clientY / window.innerHeight);
	mouseVector.set(x, y, camera.position.z);
	raycaster.setFromCamera(mouseVector, camera);
	castFocus();
}

const onDeviceOrientation = ({ clientX, clientY }) => {
	raycaster.setFromCamera(zeroVec, camera);
	castFocus();
}

const onClick = ({ clientX, clientY, touches }) => {
	let x, y;
	if (touches) {
		console.log(touches[0]);
		x = 2 * (touches[0].clientX / window.innerWidth) - 1;
		y = 1 - 2 * (touches[0].clientY / window.innerHeight);
	} else {
		x = 2 * (clientX / window.innerWidth) - 1;
		y = 1 - 2 * (clientY / window.innerHeight);
	}
	mouseVector.set(x, y, camera.position.z);
	raycaster.setFromCamera(mouseVector, camera);
	castClick();
}

const castFocus = () => {
	let found = false;
	intersectableObjects.forEach((obj) => {
		const intersects = raycaster.intersectObject( obj, false );
	});
}

const castClick = () => {
	intersectableObjects.forEach((obj) => {
		const intersects = raycaster.intersectObject( obj, false );
	});
}
