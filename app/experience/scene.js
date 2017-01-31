const THREE = require('three');
import { camera } from './camera.js';
import { intersectableObjects } from './input-handler.js';
import Group from './objects/Group.js';
import Anchor from './objects/Anchor.js';
import { ANCHOR_SPREAD, GROUP_RADIUS } from './constants.js';
import { groups, paths } from './data/CONTENT_STRUCTURE';
import { lights } from './lighting.js';

export let scene, boxMesh, anchorRefs = {};

export const init = () => {
	scene = new THREE.Scene();
	scene.add(camera);
	lights.forEach( light => scene.add(light) );

	paths.forEach((path, iP) => {
		const color = Math.random() * 0xffffff;
		path.forEach((anchorData, iA) => {
			const position = new THREE.Vector3((ANCHOR_SPREAD * iA) + ANCHOR_SPREAD + GROUP_RADIUS, 0, 0);
			const args = {
				...anchorData,
				position,
				color,
			}
			const anchor = new Anchor(args);
			anchorRefs[anchorData.id] = anchor;
			scene.add(anchor);
		});
	});

	groups.forEach((paths) => {
		const group = new Group({ position: new THREE.Vector3(0, 0, 0), paths });
		scene.add(group);
	});

	scene.add(new THREE.AxisHelper(130));
}

export const update = (delta) => {
}