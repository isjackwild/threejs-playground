const THREE = require('three');
import dat from '../vendor/dat.gui.min.js';
import { lights } from './lighting.js';
import { skybox, scene, anchorRefs, ribbonRefs } from './scene.js';
import { renderer } from './loop.js';

const gui = new dat.GUI();


export const init = () => {
	console.log('GUI');

	const colorControls = {
		renderer: "#dddddd",
	}

	const ribbonControls = {
		roughness: 0.5,
		metalness: 0.5,
	}

	const anchorControls = {
		roughness: 0.5,
		metalness: 0.5,
	}

	const lightAmbient = gui.addFolder('Light--Ambient');
	lightAmbient.add(lights[0], 'intensity', 0, 1);


	const lightDirectional = gui.addFolder('Light--Directional');
	lightDirectional.add(lights[1], 'intensity', 0, 1);
	// lightDirectional.addColor(colorControls, 'directionalLight').onChange((value) => {
	// 	const newColor = new THREE.Color(value);
	// 	lights[1].color = newColor;
	// });

	const rendr = gui.addFolder('Renderer');
	rendr.addColor(colorControls, 'renderer').onChange((value) => {
		const newColor = new THREE.Color(value);
		renderer.setClearColor(newColor);
		scene.fog.color = newColor;
		skybox.material.uniforms.color.value = newColor;
	});
	renderer.setClearColor(new THREE.Color(colorControls.renderer));
	scene.fog.color = new THREE.Color(colorControls.renderer);
	skybox.material.uniforms.color.value = new THREE.Color(colorControls.renderer);

	const ribbons = gui.addFolder('Ribbons');
	ribbons.add(ribbonControls, 'roughness', 0, 1).onChange((value) => {
		ribbonRefs.forEach(r => r.material.roughness = value);
	});
	ribbons.add(ribbonControls, 'metalness', 0, 1).onChange((value) => {
		ribbonRefs.forEach(r => r.material.metalness = value);
	});

	const anchors = gui.addFolder('Anchors');
	anchors.add(anchorControls, 'roughness', 0, 1).onChange((value) => {
		for (let key in anchorRefs) {
			const anchor = anchorRefs[key];
			anchor.material.roughness = value;
		}
	});
	anchors.add(anchorControls, 'metalness', 0, 1).onChange((value) => {
		for (let key in anchorRefs) {
			const anchor = anchorRefs[key];
			anchor.material.metalness = value;
		}
	});
}




// export const init = () => {
// 	console.log('GUI');

// 	const colorControls = {
// 		skybox: "#55524a",
// 		directionalLight: "#ffffff",
// 		renderer: "#243869",
// 	}


// 	const lightAmbient = gui.addFolder('Light--Ambient');
// 	lightAmbient.add(lights[0], 'intensity', 0, 1);


// 	const lightDirectional = gui.addFolder('Light--Directional');
// 	lightDirectional.add(lights[1], 'intensity', 0, 1);
// 	lightDirectional.addColor(colorControls, 'directionalLight').onChange((value) => {
// 		const newColor = new THREE.Color(value);
// 		lights[1].color = newColor;
// 	});

	
// 	// const skyboxMaterial = gui.addFolder('Skybox');
// 	// skyboxMaterial.add(skybox.material, 'metalness', 0, 1);
// 	// skyboxMaterial.add(skybox.material, 'roughness', 0, 1);
// 	// skyboxMaterial.addColor(colorControls, 'skybox').onChange((value) => {
// 	// 	const newColor = new THREE.Color(value);
// 	// 	skybox.material.color = newColor;
// 	// });
// 	// skybox.material.color = new THREE.Color(colorControls.skybox);


// 	const rendr = gui.addFolder('Renderer');
// 	rendr.addColor(colorControls, 'renderer').onChange((value) => {
// 		const newColor = new THREE.Color(value);
// 		renderer.setClearColor(newColor);
// 		scene.fog.color = newColor;
// 		skybox.material.uniforms.color.value = newColor;
// 	});
// 	renderer.setClearColor(new THREE.Color(colorControls.renderer));
// 	scene.fog.color = new THREE.Color(colorControls.renderer);
// 	// skybox.material.uniforms.color.value = new THREE.Color(colorControls.renderer);
// }
