const THREE = require('three');
import dat from '../vendor/dat.gui.min.js';
import _ from 'lodash';
import { camera } from './camera.js';
import { intersectableObjects } from './input-handler.js';
import Group from './objects/Group.js';
import Anchor from './objects/Anchor.js';
import Skybox from './objects/Skybox.js';
import { ANCHOR_SPREAD, ANCHOR_ANGLE_SPREAD, GROUP_RADIUS } from './constants.js';
import { groups, paths } from './data/CONTENT_STRUCTURE';
import { lights } from './lighting.js';

export let scene, boxMesh, skybox, sceneRadius, directionalLightHelper, anchorRefs = {};
// const directionalLightTarget = new THREE.Vector3();

// Less random spread angles perhaps????
const randomAngle = () => {
	return (Math.random() * Math.PI / 2 - Math.PI / 4);
}

export const init = () => {
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x55524a, 0.002);
	scene.add(camera);
	lights.forEach( light => scene.add(light) );
	scene.add(lights[1].target);
	const up = new THREE.Vector3(0, 1, 0);
	paths.forEach((path, iP) => {
		const pathDirection = new THREE.Vector3(1, 0, 0).applyAxisAngle(up, (iP / paths.length) * Math.PI * 2);

		const pathStart = new THREE.Vector3().copy(pathDirection).multiplyScalar(ANCHOR_SPREAD);
		const tmpPrevLevelPosition = new THREE.Vector3().copy(pathStart);
		// const tmpAxis = new THREE.Vector3();
		let prevAnchorDepth = 0;
		let prevLevelAnchorPositions = [];
		let thisLevelCount = 1;
		let thisLevelItterator = 0;
		const colors = Math.random() * 0xffffff;

		path.paths.forEach((anchorData, iA) => {
			thisLevelItterator++;
			if (anchorData.depth !== prevAnchorDepth) {
				thisLevelCount = _.filter(path, _anchorData => _anchorData.depth === anchorData.depth).length;
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
				colors: path.colors,
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
		const group = new Group({ position: new THREE.Vector3(0, 0, 0), paths: paths });
		scene.add(group);
	});

	// scene.add(new THREE.AxisHelper(130));

	const sceneRadius = new THREE.Box3().setFromObject(scene).getBoundingSphere().radius;
	skybox = new Skybox({ radius: sceneRadius * 1.33 });
	scene.add(skybox);

	camera.position.set(0, sceneRadius, 0);





	directionalLightHelper = new THREE.DirectionalLightHelper(lights[1], 50);
	scene.add(directionalLightHelper);
}

export const update = (delta) => {
	for (let key in anchorRefs) {
		anchorRefs[key].update();
	}

	// camera.updateMatrixWorld();
	// lights[1].target.position.copy(camera.position).negate();
	lights[1].position.copy(camera.position);
	lights[1].target.position.copy(camera.position).add(camera.getWorldDirection());
	directionalLightHelper.update();
}

