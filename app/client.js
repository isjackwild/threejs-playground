import MobileDetect from 'mobile-detect';
const dat = require('./lib/dat.gui.min.js');
import { init as initLoop, renderer, onResize as onResizeRenderer } from './experience/loop.js';
import { onResize as onResizeCamera } from './experience/camera.js';
import _ from 'lodash';

window.app = window.app || {};


const kickIt = () => {
	window.gui = new dat.GUI();
	if (window.location.search.indexOf('debug') > -1) app.debug = true;
	const md = new MobileDetect(window.navigator.userAgent);
	window.mobile = md.mobile() ? true : false;

	addEventListeners();
	onResize();
	initLoop();
}

const onResize = () => {
	window.app.width = window.innerWidth;
	window.app.height = window.innerHeight;

	onResizeRenderer(window.app.width, window.app.height);
	onResizeCamera(window.app.width, window.app.height);
}

const addEventListeners = () => {
	window.addEventListener('resize', _.throttle(onResize, 16.666));
}


if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', kickIt);
} else {
	window.attachEvent('onload', kickIt);
}