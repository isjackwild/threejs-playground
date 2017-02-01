const THREE = require('three');
import { camera } from './camera.js';
import { intersectableObjects } from './input-handler.js';
import Group from './objects/Group.js';
import Anchor from './objects/Anchor.js';
import { ANCHOR_SPREAD, GROUP_RADIUS } from './constants.js';
import { groups, paths } from './data/CONTENT_STRUCTURE';
import { lights } from './lighting.js';

export let scene, boxMesh, anchorRefs = {};

const randomAngle = () => {
	return (Math.random() * Math.PI - Math.PI / 2);
}

export const init = () => {
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x000000, 0.001);
	scene.add(camera);
	lights.forEach( light => scene.add(light) );

	paths.forEach((path, iP) => {
		const pathDirection = new THREE.Vector3(1, 0, 0);
		const pathStart = new THREE.Vector3().copy(pathDirection).multiplyScalar(ANCHOR_SPREAD);
		const tmpPrevLevelPosition = new THREE.Vector3().copy(pathStart);
		const tmpAxis = new THREE.Vector3();
		let prevAnchorDepth = 0;
		let prevLevelAnchorPositions = [];

		path.forEach((anchorData, iA) => {
			if (anchorData.depth !== prevAnchorDepth) {
				prevAnchorDepth = anchorData.depth;
				tmpPrevLevelPosition.set(0, 0, 0);
				prevLevelAnchorPositions.forEach(v => tmpPrevLevelPosition.add(v));
				tmpPrevLevelPosition.multiplyScalar(1 / prevLevelAnchorPositions.length);
				prevLevelAnchorPositions = []
			}

			const random = (Math.random() * ANCHOR_SPREAD / 4) - ANCHOR_SPREAD / 2;
			const advance = new THREE.Vector3((iA === 0 ? 0 : ANCHOR_SPREAD + random), 0, 0);
			
			tmpAxis.set(0, randomAngle(), randomAngle());
			advance.applyAxisAngle(tmpAxis, randomAngle());
			const position = new THREE.Vector3().copy(tmpPrevLevelPosition).add(advance);
			prevLevelAnchorPositions.push(position);

			const args = {
				...anchorData,
				position,
				color: 0xffffff,
			}
			const anchor = new Anchor(args);
			anchorRefs[anchorData.id] = anchor;
			scene.add(anchor);
		});
	});

	for (let key in anchorRefs) {
		anchorRefs[key].setup();
	}

	groups.forEach((paths) => {
		const group = new Group({ position: new THREE.Vector3(0, 0, 0), paths });
		scene.add(group);
	});

	scene.add(new THREE.AxisHelper(130));
}

export const update = (delta) => {
}