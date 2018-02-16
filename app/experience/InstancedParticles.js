const THREE = require('three');
import GPGPU from '../lib/GPGPU';
import _ from 'lodash';
import { renderer } from './loop';
import createTextMap from './CanvasTextMap.js';

const LOREM = "non gravida tellus ullamcorper non. Cras vulputate vestibulum diam vel euismod. Morbi non nibh quam. Nunc mi justo, interdum sed egestas vitae, molestie vel ex. Pellentesque scelerisque sagittis tellus, eu tempor mi hendrerit in. Vivamus tincidunt cursus urna. Proin ut nisl eu magna dapibus suscipit ut sodales tortor. Praesent pharetra, metus a tincidunt varius, mauris diam efficitur augue, eget malesuada dolor purus non enim. Curabitur interdum lorem et nulla porta, eu hendrerit turpis dictum. Quisque vel euismod dolor, sit amet porttitor nisl. Donec eu auctor urna. Aenean vehicula dui vitae nibh iaculis facilisis. Sed eleifend nibh a turpis sagittis, vel auctor erat convallis. Pellentesque porttitor neque sit amet arcu bibendum tempus. Etiam consequat purus magna. Maecenas sollicitudin neque eget molestie volutpat. Ut at tellus arcu. Nam rhoncus tincidunt semper. Vivamus id lacinia est. Fusce feugiat ipsum nec aliquam fringilla. Integer in ornare sapien, nec dapibus libero. Nunc at eleifend tortor, sit amet porta erat. Pellentesque ornare, dolor vitae semper iaculis, erat enim dapibus est, in fermentum magna enim ac sem. Proin quis tempor justo. Sed sed tristique nunc. Mauris elementum nisi in volutpat ultrices. Duis vel nisl lectus. Sed congue eros ac blandit venenatis. In lacinia dui nisl, non porttitor purus suscipit et. Nam varius sem ut odio placerat mattis. Cras consectetur arcu at felis scelerisque tincidunt."

const InstancedParticles = () => {
	const gpgpu = new GPGPU(renderer);

	// const SIZE = 32;
	const letters = _.filter([...LOREM], l => l.match(/[a-zA-Z0-9]/i));
	const ceilSqRt = Math.ceil(Math.sqrt(letters.length));
	const INSTANCES = letters.length;
	const PARTICLE_SIZE = 2;
	const positions = [];
	const offsets = [];
	const dataUvs = [];
	const uvOffsets = [];
	const orientationsStart = [];
	const orientationsEnd = [];
	const startTime = Date.now();

	positions.push( PARTICLE_SIZE, PARTICLE_SIZE, 0 );
	positions.push( PARTICLE_SIZE, -PARTICLE_SIZE, 0 );
	positions.push( -PARTICLE_SIZE, -PARTICLE_SIZE, 0 );
	positions.push( -PARTICLE_SIZE, PARTICLE_SIZE, 0 );

	const tmpV4 = new THREE.Vector4();
	let mesh, geometry;
	let frame = 0;
	let renderTarget1, renderTarget2, originsTexture, simulationMaterial;

	for (let i = 0; i < INSTANCES; i++) {
		const oX = (Math.random() - 0.5) * 10;
		const oY = (Math.random() - 0.5) * 10;
		const oZ = (Math.random() - 0.5) * 10;
		// offsets.push(oX, oY, oZ);
		offsets.push(0.0, 0.0, 0.0);
		tmpV4.set( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 ).normalize();
		orientationsStart.push( tmpV4.x, tmpV4.y, tmpV4.z, tmpV4.w );

		tmpV4.set( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 ).normalize();
		orientationsEnd.push( tmpV4.x, tmpV4.y, tmpV4.z, tmpV4.w );

		const du = i / INSTANCES;
		const dv = 0.0;
		dataUvs.push(du, dv);

		// const x = i % widthSegs;
		// const y = ~~ (i / heightSegs);

		const u = i % ceilSqRt;
		const v = ~~ (i / ceilSqRt);
		uvOffsets.push(u, v);
	}

	console.log(uvOffsets);

	const vertexSimulationShader = `
		precision mediump float;
		varying vec2 vUv;

		void main() {
			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}
	`;

	const fragmentSimulationShader = `
		precision mediump float;

		uniform sampler2D tPositions;
		uniform sampler2D tOrigins;
		uniform sampler2D tPerlin;
		varying vec2 vUv;
		varying vec3 vColor;

		uniform float uTimePassed;
		uniform float uCorrection;

		float NOISE_SCALE = 0.1;
		float WIND_STRENGTH = 0.01;
		float NOISE_SPEED = 0.09;
		// float MAX_VELOCITY = 0.01;
		float MAX_VELOCITY = 0.004;

		vec3 GRAVITY = vec3(0.0, -0.1, 0.0);

		void main() {
			vec3 velocity = texture2D(tPositions, vec2(vUv.x, 1.0)).xyz;
			vec3 pos = texture2D(tPositions, vec2(vUv.x, 0.0)).xyz;

			float x = fract((pos.x * NOISE_SCALE) + (uTimePassed * NOISE_SPEED) + pos.z);
			float y = fract((pos.y * NOISE_SCALE) + (uTimePassed * NOISE_SPEED));
			
			vec2 lookUp = vec2(x, y);
			vec3 noise = texture2D(tPerlin, lookUp).rgb - 0.5;
			float weight = texture2D(tOrigins, lookUp).a;

			vec3 wind = vec3(normalize(noise) * WIND_STRENGTH);

			vec3 acceleration = vec3(0.0);
			acceleration += GRAVITY;
			acceleration += wind;
			acceleration *= weight;
			acceleration *= uCorrection;
				
			velocity += acceleration;

			vec3 mappedVelocity = normalize(velocity - 0.5);
			pos += mappedVelocity * MAX_VELOCITY;

			if (pos.y < 0.0) {
				vec3 origin = texture2D(tOrigins, vec2(vUv.x, 0.0)).xyz;
				pos.x = origin.x;
				pos.y = 1.0;
				pos.z = origin.z;
			} else if (pos.y > 1.0) {
				vec3 origin = texture2D(tOrigins, vec2(vUv.x, 0.0)).xyz;
				pos.x = origin.x;
				pos.y = 0.0;
				pos.z = origin.z;
			}

			pos.x = fract(pos.x);
			pos.z = fract(pos.z);

			if (vUv.y < 0.5) {
				gl_FragColor = vec4(pos, 1.0);
			} else {
				gl_FragColor = vec4(velocity, 1.0);
			}


		}
	`;

	const vertexShader = `
		precision mediump float;

		uniform vec3 color;
		uniform sampler2D tPositions;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec2 uv;
		attribute vec2 uvOffsets;
		attribute vec2 dataUv;
		attribute vec3 position;
		attribute vec3 offset;
		attribute vec3 particlePosition;
		attribute vec4 orientationStart;
		attribute vec4 orientationEnd;

		varying vec3 vPosition;
		varying vec3 vColor;
		varying vec2 vUv;
		varying vec2 vUvOffsets;

		void main(){
			vPosition = position;
			vec4 orientation = normalize( orientationStart );
			vec3 vcV = cross( orientation.xyz, vPosition );
			vPosition = vcV * ( 2.0 * orientation.w ) + ( cross( orientation.xyz, vcV ) * 2.0 + vPosition );
			
			vec4 data = texture2D( tPositions, vec2(dataUv.x, 0.0));
			vec3 particlePosition = (data.xyz - 0.5) * 1000.0;
			vUv = uv;
			vUvOffsets = uvOffsets;

			vColor = data.xyz;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition + particlePosition + offset, 1.0 );
		}
	`;

	const fragmentShader = `
		precision mediump float;

		uniform sampler2D map;
		uniform float uUvScale;

		varying vec2 vUvOffsets;
		varying vec3 vPosition;
		varying vec3 vColor;
		varying vec2 vUv;

		float TIME_TRANSITION = 10000.0;

		void main() {
			vec4 color = texture2D(map, (vUv * uUvScale) + (vUvOffsets * uUvScale));

			// gl_FragColor = vec4(color);
			gl_FragColor = vec4(vUv.x, 0.0, vUv.y, 1.0);
		}
	`;

	const createSimulationTextures = () => {
		// const data = new Uint8Array(4 * INSTANCES * 2);
		const data = new Float32Array(4 * INSTANCES * 2);

		for (let i = 0; i < data.length * 0.5; i += 4) {
			// POSITION
			data[i] = Math.random();
			data[i + 1] = Math.random();
			data[i + 2] = Math.random();
			// data[i + 3] = (1 - (Math.random() * 0.3)) * 255; // store the weight in the origin texture
			data[i + 3] = 0;


			// VELOCITY
			data[i + data.length * 0.5] = 0;
			data[i + data.length * 0.5 + 1] = 0;
			data[i + data.length * 0.5 + 2] = 0;
			data[i + data.length * 0.5 + 3] = 0;
		}

		const originsTexture = new THREE.DataTexture(data, INSTANCES, 2, THREE.RGBAFormat, THREE.FloatType);
		originsTexture.minFilter = THREE.NearestFilter;
		originsTexture.magFilter = THREE.NearestFilter;
		originsTexture.generateMipmaps = false;
		originsTexture.needsUpdate = true;

		const renderTarget1 = new THREE.WebGLRenderTarget(INSTANCES, 2, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.UnsignedByteType,
			depthBuffer: false,
			stencilBuffer: false,
			transparent: false,
		});

		const renderTarget2 = renderTarget1.clone();
		const copyShader = new GPGPU.CopyShader();

		gpgpu.pass(copyShader.setTexture(originsTexture).material, renderTarget1);
		const perlinTexture = new THREE.TextureLoader().load('/assets/textures/perlin-512.png');
		perlinTexture.minFilter = perlinTexture.magFilter = THREE.NearestFilter;

		return { renderTarget1, renderTarget2, originsTexture, perlinTexture };
	};

	const createSimulationMaterial = (originsTexture, positionsTexture, perlinTexture) => {
		const simulationMaterial = new THREE.ShaderMaterial({
			uniforms: {
				tPositions: { type: 't', value: positionsTexture },
				tOrigins: { type: 't', value: originsTexture },
				tPerlin: { type: 't', value: perlinTexture },
				uTimePassed: { value: 0.0 },
				uCorrection: { value: 1.0 },
			},
			vertexShader: vertexSimulationShader,
			fragmentShader: fragmentSimulationShader,
			side: THREE.DoubleSide,
			transparent: true,
		});

		return simulationMaterial;
	};

	const createGeometry = () => {
		const plane = new THREE.PlaneBufferGeometry(25, 25, 1, 1);
		const geometry = new THREE.InstancedBufferGeometry();
		geometry.maxInstancedCount = INSTANCES;
		geometry.attributes.position = plane.attributes.position;
		geometry.index = plane.index;
		geometry.attributes.uv = plane.attributes.uv;

		geometry.addAttribute( 'uvOffsets', new THREE.InstancedBufferAttribute( new Float32Array( uvOffsets ), 2 ) );
		geometry.addAttribute( 'dataUv', new THREE.InstancedBufferAttribute( new Float32Array( dataUvs ), 2 ) );
		geometry.addAttribute( 'offset', new THREE.InstancedBufferAttribute( new Float32Array( offsets ), 3 ) );
		geometry.addAttribute( 'orientationStart', new THREE.InstancedBufferAttribute( new Float32Array( orientationsStart ), 4 ) );
		geometry.addAttribute( 'orientationEnd', new THREE.InstancedBufferAttribute( new Float32Array( orientationsEnd ), 4 ) );

		return geometry;
	};

	const createMesh = (geometry, positionSimulationTexture) => {
		const map = createTextMap(letters);
		const uniforms = {
			color: { type: 'c', value: new THREE.Color(0x3db230) },
			tPositions: { type: 't', value: positionSimulationTexture },
			uUvScale: { value: 1 / ceilSqRt },
			// map: { type: 't', value: new THREE.TextureLoader().load('/assets/textures/grid.png') },
			map: { type: 't', value: map },
		};

		const material = new THREE.RawShaderMaterial({
			uniforms,
			vertexShader,
			fragmentShader,
			side: THREE.DoubleSide,
			format: THREE.RGBAFormat,
			type: THREE.UnsignedByteType,
			transparent: true,
			// blending: THREE.AdditiveBlending,
			depthTest: false,
			depthWrite: false,
		});

		return new THREE.Mesh(geometry, material);
	};


	const update = (correction) => {
		const secsPast = (Date.now() - startTime) / 1000;
		simulationMaterial.uniforms.uTimePassed.value = secsPast;
		simulationMaterial.uniforms.uCorrection.value = correction;
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
		// mesh.material.needsUpdate = true;

		frame++;
	};

	const simTextures = createSimulationTextures();
	renderTarget1 = simTextures.renderTarget1;
	renderTarget2 = simTextures.renderTarget2;
	originsTexture = simTextures.originsTexture;
	const perlinTexture = simTextures.perlinTexture;

	simulationMaterial = createSimulationMaterial(originsTexture, renderTarget1, perlinTexture);
	geometry = createGeometry();
	mesh = createMesh(geometry, perlinTexture);

	const debugMesh = new THREE.Mesh(
		new THREE.PlaneGeometry( 512 * 2, 512 * 0.5 ),
		new THREE.MeshBasicMaterial({ map: renderTarget1.texture, side: THREE.DoubleSide, transparent: true }),
		// new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
	);
	mesh.add(debugMesh);


	return { mesh, update };
};

export default InstancedParticles;
