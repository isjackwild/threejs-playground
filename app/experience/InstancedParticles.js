const THREE = require('three');
import GPGPU from '../lib/GPGPU';
import { renderer } from './loop';

const InstancedParticles = () => {
	const gpgpu = new GPGPU(renderer);

	const SIZE = 32;
	const INSTANCES = SIZE * SIZE;
	const positions = [];
	const offsets = [];
	const uvs = [];
	const orientationsStart = [];
	const orientationsEnd = [];

	positions.push( 5, -5, 0 );
	positions.push( -5, 5, 0 );
	positions.push( 0, 0, 5 );

	const tmpV4 = new THREE.Vector4();
	let mesh, geometry;
	let frame = 0;
	let renderTexture1, renderTexture2, originsTexture, simulationMaterial;

	for (let i = 0; i < INSTANCES; i++) {
		const oX = (Math.random() - 0.5) * 1000;
		const oY = (Math.random() - 0.5) * 2000;
		const oZ = (Math.random() - 0.5) * 1000;
		offsets.push(oX, oY, oZ);
		// offsets.push(0.0, 0.0, 0.0);
		tmpV4.set( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 ).normalize();
		orientationsStart.push( tmpV4.x, tmpV4.y, tmpV4.z, tmpV4.w );

		tmpV4.set( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 ).normalize();
		orientationsEnd.push( tmpV4.x, tmpV4.y, tmpV4.z, tmpV4.w );

		const u = (i % SIZE) / SIZE;
		const v = (Math.floor(i / SIZE)) / SIZE;
		uvs.push(u, v);
	}

	const vertexSimulationShader = `
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}
	`;

	// 'varying vec2 vUv;',
	// 'uniform sampler2D texture;',

	// 'void main() {',
	// '	gl_FragColor = texture2D( texture, vUv );',
	// '}'

	const fragmentSimulationShader = `
		uniform sampler2D tPositions;
		uniform sampler2D tOrigins;
		varying vec2 vUv;


		void main() {

			vec4 pos = texture2D( tOrigins, vUv );

			// if ( pos.w < 0.0 ) {

			// 	vec4 sample = texture2D( tOrigins, vUv );
			// 	pos.xyz = sample.xyz;
			// 	pos.w = sample.w;

			// } else {

			// 	pos.w -= 0.001;

			// }

			gl_FragColor = texture2D(tOrigins, vUv);

		}
	`;

	const vertexShader = `
		precision highp float;

		uniform vec3 color;
		uniform sampler2D positionTexture;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec2 uv;
		attribute vec3 position;
		attribute vec3 offset;
		attribute vec3 particlePosition;
		attribute vec4 orientationStart;
		attribute vec4 orientationEnd;

		varying vec3 vPosition;
		varying vec3 vColor;


		void main(){
			vPosition = position;
			vec4 orientation = normalize( orientationStart );
			// vec4 orientation = vec4(.0, .0, .0, .0);
			vec3 vcV = cross( orientation.xyz, vPosition );
			vPosition = vcV * ( 2.0 * orientation.w ) + ( cross( orientation.xyz, vcV ) * 2.0 + vPosition );
			
			vec4 data = texture2D( positionTexture, uv );
			vec3 particlePosition = (data.xyz - 0.5) * 1000.0;

			vColor = data.xyz;
			// vColor = color;

			gl_Position = projectionMatrix * modelViewMatrix * vec4(  vPosition + particlePosition, 1.0 );
		}
	`;

	const fragmentShader = `
		precision highp float;

		uniform float time;

		varying vec3 vPosition;
		varying vec3 vColor;

		void main() {
			gl_FragColor = vec4(vColor, 1.0);

		}
	`;

	const createSimulationTextures = () => {
		const data = new Uint8Array(4 * INSTANCES);

		for (let i = 0; i < data.length; i++) {
			const stride = i * 4;

			data[stride] = Math.random() * 255;
			data[stride + 1] = Math.random() * 255;
			data[stride + 2] = Math.random() * 255;
			data[stride + 3] = 1;
		}

		const originsTexture = new THREE.DataTexture(data, SIZE, SIZE);
		originsTexture.minFilter = THREE.NearestFilter;
		originsTexture.magFilter = THREE.NearestFilter;
		originsTexture.generateMipmaps = false;
		originsTexture.needsUpdate = true;

		const renderTexture1 = new THREE.WebGLRenderTarget(SIZE, SIZE, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.UnsignedByteType,
			depthBuffer: false,
			stencilBuffer: false,
		});

		const renderTexture2 = renderTexture1.clone();
		const copyShader = new GPGPU.CopyShader();

		gpgpu.pass(copyShader.setTexture(originsTexture).material, renderTexture1);
		gpgpu.pass(copyShader.setTexture(renderTexture1).material, renderTexture2);

		return { renderTexture1, renderTexture2, originsTexture };
	};

	const createSimulationMaterial = (originsTexture, positionsTexture) => {
		const simulationMaterial = new THREE.ShaderMaterial({
			uniforms: {
				tPositions: { type: 't', value: positionsTexture },
				tOrigins: { type: 't', value: originsTexture },
			},
		});

		return simulationMaterial;
	};

	const createGeometry = () => {
		const geometry = new THREE.InstancedBufferGeometry();
		geometry.maxInstancedCount = INSTANCES;

		geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'uv', new THREE.InstancedBufferAttribute( new Float32Array( uvs ), 2 ) );
		geometry.addAttribute( 'offset', new THREE.InstancedBufferAttribute( new Float32Array( offsets ), 3 ) );
		geometry.addAttribute( 'orientationStart', new THREE.InstancedBufferAttribute( new Float32Array( orientationsStart ), 4 ) );
		geometry.addAttribute( 'orientationEnd', new THREE.InstancedBufferAttribute( new Float32Array( orientationsEnd ), 4 ) );

		return geometry;
	};

	const createMesh = (geometry, positionSimulationTexture) => {
		const uniforms = {
			color: {
				type: 'c',
				value: new THREE.Color(0x3db230),
			},
			positionTexture: {
				type: 't',
				value: positionSimulationTexture,
			},
		};

		const material = new THREE.RawShaderMaterial({
			uniforms,
			vertexShader,
			fragmentShader,
			side: THREE.DoubleSide,
			transparent: false,
		});

		return new THREE.Mesh(geometry, material);
	};


	const update = () => {
		return;
		if (frame % 2 === 0) {
			simulationMaterial.uniforms.tPositions.value = renderTexture1;
			gpgpu.pass(simulationMaterial, renderTexture2);
			mesh.material.uniforms.positionTexture.value = renderTexture2;
		} else {
			simulationMaterial.uniforms.tPositions.value = renderTexture2;
			gpgpu.pass(simulationMaterial, renderTexture1);
			mesh.material.uniforms.positionTexture.value = renderTexture1;
		}
		simulationMaterial.needsUpdate = true;
		frame++;
	};

	const simTextures = createSimulationTextures();
	renderTexture1 = simTextures.renderTexture1;
	renderTexture2 = simTextures.renderTexture2;
	originsTexture = simTextures.originsTexture;

	simulationMaterial = createSimulationMaterial(originsTexture, renderTexture1);
	geometry = createGeometry();
	mesh = createMesh(geometry, renderTexture1);

	const debugMesh = new THREE.Mesh(
		new THREE.PlaneGeometry( 512, 512 ),
		new THREE.MeshBasicMaterial({ map: renderTexture2, side: THREE.DoubleSide }),
		// new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
	);
	mesh.add(debugMesh);


	return { mesh, update };
};

export default InstancedParticles;
