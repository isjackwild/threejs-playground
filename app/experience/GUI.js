const THREE = require('three');
import dat from '../vendor/dat.gui.min.js';
import { lights } from './lighting.js';
import { skybox, scene } from './scene.js';
import { renderer } from './loop.js';

const gui = new dat.GUI();


export const init = () => {
	console.log('GUI');
}
