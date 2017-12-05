const THREE = require('three');
require('../vendor/ColladaLoader.js');
require('../vendor/FBXLoader.js');

export const textureLoader = new THREE.TextureLoader();
export const colladaLoader = new THREE.ColladaLoader();
export const JSONLoader = new THREE.JSONLoader();
export const FBXLoader = new THREE.FBXLoader();
