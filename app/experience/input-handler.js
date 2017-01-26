const THREE = require('three');
import _ from 'lodash';
import PubSub from 'pubsub-js';

import { camera } from './camera.js';

const mouseVector = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
console.log(raycaster);
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
	const x = (clientX / window.innerWidth) * 2 - 1;
	const y = (clientY / window.innerHeight) * 2 + 1;
	mouseVector.set(x, y);
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
		x = (touches[0].clientX / window.innerWidth) * 2 - 1;
		y = (touches[0].clientY / window.innerHeight) * 2 + 1;
	} else {
		x = (clientX / window.innerWidth) * 2 - 1;
		y = (clientY / window.innerHeight) * 2 + 1;
	}
	mouseVector.set(x, y, 0.5);
	raycaster.setFromCamera(mouseVector, camera);
	castClick();
}

const castFocus = () => {
	intersectableObjects.forEach((obj, i) => {
		const intersects = raycaster.intersectObject( obj, false );
		// if (i === 0) console.log(intersects);
		if (intersects.length) return obj.onFocus();
		obj.onBlur();
	});
}

const castClick = () => {
	intersectableObjects.forEach((obj) => {
		const intersects = raycaster.intersectObject( obj, false );
		if (intersects.length) return obj.onClick();
	});
}
