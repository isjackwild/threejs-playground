const THREE = require('three');
import dat from '../vendor/dat.gui.min.js';
import _ from 'lodash';
import { camera } from './camera.js';
import { intersectableObjects } from './input-handler.js';
// import Group from './objects/Group.js';
import Anchor from './objects/Anchor.js';
import CameraPath from './objects/CameraPath';
import Skybox from './objects/Skybox.js';
import { ANCHOR_SPREAD, ANCHOR_ANGLE_SPREAD, GROUP_RADIUS } from './constants.js';
import { threads } from './data/CONTENT_STRUCTURE';
import { lights } from './lighting.js';
import { controls } from './controls.js';

export let scene, boxMesh, skybox, sceneRadius, directionalLightHelper, anchorRefs = {};
// const directionalLightTarget = new THREE.Vector3();

// Less random spread angles perhaps????
const randomAngle = () => {
	return (Math.random() * Math.PI / 2 - Math.PI / 4);
}

export const init = () => {
	scene = new THREE.Scene();
	// scene.fog = new THREE.FogExp2(0x55524a, 0);
	scene.add(camera);
	lights.forEach( light => scene.add(light) );
	scene.add(lights[1].target);
	const up = new THREE.Vector3(0, 1, 0);

	scene.add(new THREE.AxisHelper(100));

	console.log('init scene');
	addAnchors();
	addCameraPaths();

	for (let key in anchorRefs) {
		anchorRefs[key].setup();
	}

	const sceneRadius = new THREE.Box3().setFromObject(scene).getBoundingSphere().radius;
	skybox = new Skybox({ radius: sceneRadius * 1.5 });
	scene.add(skybox);

	addDots(sceneRadius);
}

const addDots = (sceneRadius) => {
	const SPACING = 350;
	const step = Math.ceil(sceneRadius / step);
	for (let x = -sceneRadius; x < sceneRadius; x += SPACING) {
		for (let y = -sceneRadius; y < sceneRadius; y += SPACING) {
			for (let z = -sceneRadius; z < sceneRadius; z += SPACING){
				const dot = new THREE.Mesh();
				dot.geometry = new THREE.SphereGeometry(2);
				dot.material = new THREE.MeshBasicMaterial({
					color: 0xffffff,
				});
				dot.position.set(x, y, z);
				scene.add(dot);
			}
		}
	}
}

const addAnchors = () => {
	let prevAnchorDepth = 0;
	let prevLevelAnchorPositions = [];
	let thisLevelCount = 1;
	let thisLevelItterator = 0;

	const up = new THREE.Vector3(0, 1, 0);
	const pathDirection = new THREE.Vector3(1, 0, 0);
	const pathStart = new THREE.Vector3().copy(pathDirection).multiplyScalar(ANCHOR_SPREAD);
	const tmpPrevLevelPosition = new THREE.Vector3().copy(pathStart);

	threads.forEach((thread, iP) => {
		const pathDirection = new THREE.Vector3(1, 0, 0).applyAxisAngle(up, (iP / threads.length) * Math.PI * 2);

		const pathStart = new THREE.Vector3().copy(pathDirection).multiplyScalar(ANCHOR_SPREAD);
		const tmpPrevLevelPosition = new THREE.Vector3().copy(pathStart);
		// const tmpAxis = new THREE.Vector3();
		let prevAnchorDepth = 0;
		let prevLevelAnchorPositions = [];
		let thisLevelCount = 1;
		let thisLevelItterator = 0;
		const colors = Math.random() * 0xffffff;

		thread.anchors.forEach((anchorData, iA) => {
			thisLevelItterator++;
			if (anchorData.depth !== prevAnchorDepth) {
				thisLevelCount = _.filter(thread.anchors, _anchorData => _anchorData.depth === anchorData.depth).length;
				// console.log(thisLevelCount);
				thisLevelItterator = 0;
				prevAnchorDepth = anchorData.depth;
				tmpPrevLevelPosition.set(0, 0, 0);
				prevLevelAnchorPositions.forEach(v => tmpPrevLevelPosition.add(v));
				tmpPrevLevelPosition.multiplyScalar(1 / prevLevelAnchorPositions.length);
				prevLevelAnchorPositions = []
			}

			// const random = (Math.random() * ANCHOR_SPREAD / 4) - ANCHOR_SPREAD / 2;
			const advance = new THREE.Vector3().copy(pathDirection).multiplyScalar((iA === 0 ? 0 : ANCHOR_SPREAD));
			if (iA === 0) {
				advance.y += (Math.random() * ANCHOR_SPREAD / 2) - ANCHOR_SPREAD / 4;
			} else {
				advance.y += (Math.random() * ANCHOR_SPREAD) - ANCHOR_SPREAD / 2;
			}
			// tmpAxis.set(0, randomAngle(), randomAngle());
			// advance.applyAxisAngle(up, randomAngle());
			
			const totalSpread = thisLevelCount - 1 * ANCHOR_ANGLE_SPREAD;
			const angle = thisLevelCount === 1 ? 0 : ((thisLevelItterator / (thisLevelCount - 1)) * totalSpread) - totalSpread / 2;
			advance.applyAxisAngle(up, angle);
			
			const position = new THREE.Vector3().copy(tmpPrevLevelPosition).add(advance);
			prevLevelAnchorPositions.push(position);

			const args = {
				...anchorData,
				position,
				colors: thread.colors,
			}
			const anchor = new Anchor(args);
			anchorRefs[anchorData.id] = anchor;
			scene.add(anchor);

			if (iA === 0) anchor.isActive = true; 
		});
	});
}

const addCameraPaths = () => {
	for (let key in anchorRefs) {
		const anchorFrom = anchorRefs[key];
		const anchorsToIds = anchorFrom.anchorsToIds;
		const positionFrom = anchorFrom.position;

		anchorsToIds.forEach((anchorId) => {
			const anchorTo = anchorRefs[anchorId];
			const positionTo = anchorTo.position;

			const cameraPath = new CameraPath({
				from: anchorFrom,
				to: anchorTo,
			});
			scene.add(cameraPath);

			
			anchorFrom.anchorsTo.push(anchorTo);
			anchorFrom.pathsOut[anchorId] = cameraPath.path;
			anchorTo.anchorsFrom.push(anchorFrom);
		});
	}
}

export const update = (delta) => {
}

