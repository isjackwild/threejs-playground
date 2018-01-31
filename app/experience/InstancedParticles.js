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
	const startTime = Date.now();

	positions.push( 5, -5, 0 );
	positions.push( -5, 5, 0 );
	positions.push( 0, 0, 5 );

	const tmpV4 = new THREE.Vector4();
	let mesh, geometry;
	let frame = 0;
	let renderTarget1, renderTarget2, originsTexture, simulationMaterial;

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

	const fragmentSimulationShader = `
		precision highp float;

		uniform sampler2D tPositions;
		uniform sampler2D tOrigins;
		uniform sampler2D tPerlin;
		varying vec2 vUv;
		varying vec3 vColor;

		uniform float uTime;
		uniform float uStartTime;

		float NOISE_SCALE = 1.0;
		float WIND_STRENGTH = 0.02;
		float NOISE_SPEED = 0.001;

		// void main() {

		// 	vec4 pos = texture2D(tPositions, vUv);

		// 	vec2 lookUp = (pos.xy * NOISE_SCALE);
		// 	lookUp = fract(lookUp);

		// 	vec4 noise = texture2D(tPerlin, lookUp);
		// 	pos.xyz += (noise.xyz - 0.5) * (WIND_STRENGTH * 2.0);
		// 	pos = fract(pos);

		// 	// if (pos.x < 0.0) pos.x = 1.0;
		// 	// if (pos.y < 0.0) pos.y = 1.0;
		// 	// if (pos.z < 0.0) pos.z = 1.0;

		// 	// if (pos.x > 1.0) pos.x = 0.0;
		// 	// if (pos.y > 1.0) pos.y = 0.0;
		// 	// if (pos.z > 1.0) pos.z = 0.0;

		// 	gl_FragColor = vec4(pos.xyz, 1.0);
		// }

		void main() {
			float timePassed = (uTime - uStartTime) / 1000.0 * 0.1;
			vec4 pos = texture2D(tPositions, vUv);
			
			vec2 lookUp = vec2(0.0, 0.0);
			vec3 noise = texture2D(tPerlin, lookUp).rgb - 0.5;

			vec3 GRAVITY = vec3(0.0, noise.r * 0.1, 0.0);
			
			pos += vec4(GRAVITY, 0.0);
			pos = fract(pos);

			gl_FragColor = vec4(pos.xyz, 1.0);
			// gl_FragColor = vec4(timePassed, timePassed, timePassed, 1.0);
		}
	`;

	const vertexShader = `
		precision highp float;

		uniform vec3 color;
		uniform sampler2D tPositions;

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
			vec3 vcV = cross( orientation.xyz, vPosition );
			vPosition = vcV * ( 2.0 * orientation.w ) + ( cross( orientation.xyz, vcV ) * 2.0 + vPosition );
			
			vec4 data = texture2D( tPositions, uv );
			vec3 particlePosition = (data.xyz - 0.5) * 1000.0;

			vColor = data.xyz;

			gl_Position = projectionMatrix * modelViewMatrix * vec4(  vPosition + particlePosition, 1.0 );
		}
	`;

	const fragmentShader = `
		precision highp float;

		uniform float uTime;
		uniform float uStartTime;
		uniform float uBlah;

		varying vec3 vPosition;
		varying vec3 vColor;

		float TIME_TRANSITION = 10000.0;

		void main() {
			float timePassed = uTime - uStartTime;
			// float timePassed = 5000.0;
			float val = timePassed / TIME_TRANSITION;

			gl_FragColor = vec4(fract(uBlah), fract(uBlah), fract(uBlah), 1.0);
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

		const renderTarget1 = new THREE.WebGLRenderTarget(SIZE, SIZE, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.UnsignedByteType,
			depthBuffer: false,
			stencilBuffer: false,
		});

		const renderTarget2 = renderTarget1.clone();
		const copyShader = new GPGPU.CopyShader();

		gpgpu.pass(copyShader.setTexture(originsTexture).material, renderTarget1);
		const perlinTexture = new THREE.TextureLoader().load('/assets/textures/100-to-0-512.png');
		perlinTexture.minFilter = perlinTexture.magFilter = THREE.NearestFilter;

		console.log(perlinTexture);

		return { renderTarget1, renderTarget2, originsTexture, perlinTexture };
	};

	const createSimulationMaterial = (originsTexture, positionsTexture, perlinTexture) => {
		const simulationMaterial = new THREE.ShaderMaterial({
			uniforms: {
				tPositions: { type: 't', value: positionsTexture },
				tOrigins: { type: 't', value: originsTexture },
				tPerlin: { type: 't', value: perlinTexture },
				uTime: { type: 'f', value: 0.0 },
				uStartTime: { type: 'f', value: parseFloat(Date.now()) },
			},
			vertexShader: vertexSimulationShader,
			fragmentShader: fragmentSimulationShader,
			side: THREE.DoubleSide,
			transparent: true,
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
			uTime: { type: 'f', value: 0 },
			uStartTime: { type: 'f', value: parseFloat(Date.now()) },
			color: { type: 'c', value: new THREE.Color(0x3db230) },
			tPositions: { type: 't', value: positionSimulationTexture },
			uBlah: { type: 'f', value: 0.0 },
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
		const secsPast = (Date.now() - startTime) / 1000;

		simulationMaterial.uniforms.uTime.value = parseFloat(Date.now());
		mesh.material.uniforms.uTime.value = parseFloat(Date.now());
		mesh.material.uniforms.uBlah.value = secsPast * 0.1;
		simulationMaterial.needsUpdate = true;
		mesh.material.needsUpdate = true;
		// console.log((simulationMaterial.uniforms.uTime.value - simulationMaterial.uniforms.uStartTime.value) / 1000);


		if (frame % 2 === 0) {
			simulationMaterial.uniforms.tPositions.value = renderTarget1.texture;
			gpgpu.pass(simulationMaterial, renderTarget2);
			mesh.material.uniforms.tPositions.value = renderTarget2.texture;
		} else {
			simulationMaterial.uniforms.tPositions.value = renderTarget2.texture;
			gpgpu.pass(simulationMaterial, renderTarget1);
			mesh.material.uniforms.tPositions.value = renderTarget1.texture;
		}
		mesh.material.needsUpdate = true;

		frame++;
	};

	const simTextures = createSimulationTextures();
	renderTarget1 = simTextures.renderTarget1;
	renderTarget2 = simTextures.renderTarget2;
	originsTexture = simTextures.originsTexture;
	const perlinTexture = simTextures.perlinTexture;

	simulationMaterial = createSimulationMaterial(originsTexture, renderTarget1, perlinTexture);
	geometry = createGeometry();
	mesh = createMesh(geometry, renderTarget1);

	const debugMesh = new THREE.Mesh(
		new THREE.PlaneGeometry( 512, 512 ),
		new THREE.MeshBasicMaterial({ map: renderTarget1, side: THREE.DoubleSide, transparent: true }),
		// new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
	);
	mesh.add(debugMesh);


	return { mesh, update };
};

export default InstancedParticles;
