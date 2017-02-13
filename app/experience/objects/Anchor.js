const THREE = require('three');
import { moveToAnchor } from '../controls.js';
import { camera } from '../camera.js';
import { moveToPosition, moveAlongJumpPath } from '../controls.js';
import { fibonacciSphere } from '../UTIL.js';
import textLabel from './text-label.js';
import Artboard from './Artboard.js';
import { intersectableObjects } from '../input-handler.js';
// import JumpPoint from './JumpPoint.js';
import { ANCHOR_BASE_WIDTH, ANCHOR_WIDTH_PER_LINK, OPACITY, FOCUS_OPACITY } from '../CONSTANTS.js';


class Anchor extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { position, id, jumpPoints, colors } = args;

		this._aId = id;

		this.isActive = false;
		this.colors = colors;
		this.anchorsToIds = jumpPoints;
		this.anchorsTo = [];
		this.anchorsFrom = [];
		this.pathsOut = {};

		this.position.copy(position);
	}
	
	setup() {
		this.setupDebugMesh();
		if (this.anchorsTo.length) this.setupArtboard();
		intersectableObjects.push(this);
	}

	setupDebugMesh() {
		this.geometry = new THREE.CubeGeometry(ANCHOR_BASE_WIDTH, ANCHOR_BASE_WIDTH, ANCHOR_BASE_WIDTH);
		this.material = new THREE.MeshLambertMaterial({
			color: 0x000000, 
			opacity: 0.1,
			transparent: true,
			wireframe: true,
			// visible: false,
		});
		this.material.side = THREE.DoubleSide;
	}

	setupArtboard() {
		this.artboard = new Artboard({
			anchorsTo: this.anchorsTo,
			onClickTarget: this.onClickTarget.bind(this)
		});
		this.add(this.artboard);

		const averagePositionsTo = new THREE.Vector3();
		this.anchorsTo.forEach(anchor => averagePositionsTo.add(anchor.position));

		this.updateMatrixWorld();
		this.worldToLocal(averagePositionsTo);
		this.artboard.position.copy(averagePositionsTo).normalize().multiplyScalar(ANCHOR_BASE_WIDTH / 2);
		this.artboard.lookAt(averagePositionsTo);
	}

	onFocus() {
	}

	onBlur() {
	}

	onClick() {
		console.log('click');
		if (!this.isActive) return;
		this.isActive = false;
		moveToPosition(this.position);
	}

	onClickTarget(anchorToId) {
		const path = this.pathsOut[anchorToId];
		moveAlongJumpPath(path);
	}
}

export default Anchor