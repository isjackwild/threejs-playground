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
		uniform float uTime;

		varying vec2 vUv;
		varying float vTime;

		void main() {
			vUv = uv;
			vTime = uTime;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}
	`;

	const fragmentSimulationShader = `
		precision highp float;

		uniform sampler2D tPositions;
		uniform sampler2D tOrigins;
		varying vec2 vUv;
		varying float vTime;

		float rand(vec2 co){
		    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
		}

		void main() {

			vec4 pos = texture2D( tPositions, vUv );
			pos.xyz -= 0.005;

			if (pos.x < 0.0) {
				pos.x = 1.0;
			}
			if (pos.y < 0.0) {
				pos.y = 1.0;
			}
			if (pos.z < 0.0) {
				pos.z = 1.0;
			}

			// if ( pos.w < 0.0 ) {
			// 	vec4 sample = texture2D( tOrigins, vUv );
			// 	pos.xyz = sample.xyz;
			// 	pos.w = 1.0;
			// } else {
			// 	pos.w -= 0.001;
			// }

			// gl_FragColor = vec4(rand(vec2(vTime * 0.0001)), rand(vec2(vTime * 0.00001)), rand(vec2(vTime * 0.000001)), 1.0);
			gl_FragColor = vec4(pos.xyz, 1.0);
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
			// vec4 orientation = vec4(.0, .0, .0, .0);
			vec3 vcV = cross( orientation.xyz, vPosition );
			vPosition = vcV * ( 2.0 * orientation.w ) + ( cross( orientation.xyz, vcV ) * 2.0 + vPosition );
			
			vec4 data = texture2D( tPositions, uv );
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

		return { renderTarget1, renderTarget2, originsTexture };
	};

	const createSimulationMaterial = (originsTexture, positionsTexture) => {
		const simulationMaterial = new THREE.ShaderMaterial({
			uniforms: {
				tPositions: { type: 't', value: positionsTexture },
				tOrigins: { type: 't', value: originsTexture },
				uTime: { value: 0 },
			},
			vertexShader: vertexSimulationShader,
			fragmentShader: fragmentSimulationShader,
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
			uTime: {
				value: 0,
			},
			color: {
				type: 'c',
				value: new THREE.Color(0x3db230),
			},
			tPositions: {
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
		simulationMaterial.needsUpdate = true;
		simulationMaterial.uniforms.uTime.value = Date.now();

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

	console.log(renderTarget1, renderTarget2, originsTexture);

	simulationMaterial = createSimulationMaterial(originsTexture, renderTarget1);
	geometry = createGeometry();
	mesh = createMesh(geometry, renderTarget1);

	const debugMesh = new THREE.Mesh(
		new THREE.PlaneGeometry( 512, 512 ),
		new THREE.MeshBasicMaterial({ map: renderTarget2.texture, side: THREE.DoubleSide, transparent: true }),
		// new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
	);
	mesh.add(debugMesh);


	return { mesh, update };
};

export default InstancedParticles;
