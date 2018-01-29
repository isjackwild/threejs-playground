const THREE = require('three');
import GPGPU from '../lib/GPGPU';
import { renderer } from './loop';

const InstancedParticles = () => {
	const SIZE = 32;
	const INSTANCES = SIZE * SIZE;
	const positions = [];
	const offsets = [];
	const orientationsStart = [];
	const orientationsEnd = [];

	positions.push( 5, -5, 0 );
	positions.push( -5, 5, 0 );
	positions.push( 0, 0, 5 );

	const tmpV4 = new THREE.Vector4();
	let mesh, geometry;
	let positionSimulationTexture;

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
	}

	const vertexSimulationShader = `
		precision highp float;

		void main() {
			gl_Position vec4(.0, .0, .0, .0);
		}
	`;

	const fragmentSimulationShader = `
		precision highp float;

		void main() {
			gl_FragColor = vec4(1.0);
		}
	`;

	const vertexShader = `
		precision highp float;

		uniform float size;
		uniform float sineTime;
		uniform vec3 color;
		uniform sampler2D positionTexture;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec3 offset;
		attribute vec3 particlePosition;
		attribute vec4 orientationStart;
		attribute vec4 orientationEnd;

		varying vec3 vPosition;
		varying vec3 vColor;


		void main(){
			vPosition = position;
			vec4 orientation = normalize( mix( orientationStart, orientationEnd, sineTime ) );
			// vec4 orientation = vec4(.0, .0, .0, .0);
			vec3 vcV = cross( orientation.xyz, vPosition );
			vPosition = vcV * ( 2.0 * orientation.w ) + ( cross( orientation.xyz, vcV ) * 2.0 + vPosition );

			// vec2 uv = position.xy + vec2( size, 1.0 );
			vec2 uv = vec2(1.0, 1.0);
			// vec2 uv = off.xy;
			
			vec4 data = texture2D( positionTexture, uv );
			vec3 particlePosition = data.xyz * 1000.0;

			// vColor = data.xyz;
			vColor = color;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( offset + vPosition + particlePosition, 1.0 );
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

	const createSimulationTexture = () => {
		const gpgpu = new GPGPU( renderer );
		const data = new Uint8Array(4 * INSTANCES);

		for (let i = 0; i < data.length; i++) {
			const stride = i * 4;
			// data[stride] = (Math.random() - 0.5) * 255;
			// data[stride + 1] = (Math.random() - 0.5) * 255;
			// data[stride + 2] = (Math.random() - 0.5) * 255;
			// data[stride + 3] = 0.0;
			data[stride] = Math.floor(Math.random() * 255);
			data[stride + 1] = Math.floor(Math.random() * 255);
			data[stride + 2] = Math.floor(Math.random() * 255);
			data[stride + 3] = 0;
		}

		const originsTexture = new THREE.DataTexture(data, SIZE, SIZE, THREE.RGBAFormat);
		originsTexture.minFilter = THREE.NearestFilter;
		originsTexture.magFilter = THREE.NearestFilter;
		originsTexture.generateMipmaps = false;
		originsTexture.needsUpdate = true;

		const renderTexture1 = new THREE.WebGLRenderTarget(SIZE, SIZE, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			depthBuffer: false,
			stencilBuffer: false,
		});

		const renderTexture2 = renderTexture1.clone();
		const copyShader = new GPGPU.CopyShader();

		gpgpu.pass(copyShader.setTexture(originsTexture), renderTexture1);

		return originsTexture;
	};

	const createSimulationMaterial = () => {
	};

	const createGeometry = () => {
		const geometry = new THREE.InstancedBufferGeometry();
		geometry.maxInstancedCount = INSTANCES;

		geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'offset', new THREE.InstancedBufferAttribute( new Float32Array( offsets ), 3 ) );
		geometry.addAttribute( 'orientationStart', new THREE.InstancedBufferAttribute( new Float32Array( orientationsStart ), 4 ) );
		geometry.addAttribute( 'orientationEnd', new THREE.InstancedBufferAttribute( new Float32Array( orientationsEnd ), 4 ) );

		return geometry;
	};

	const createMesh = (geometry, positionSimulationTexture) => {
		const uniforms = {
			size: { value: 1.0 },
			color: {
				type: 'c',
				value: new THREE.Color(0x3db230),
			},
			time: { value: 1.0 },
			sineTime: { value: 1.0 },
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
		const time = Date.now();
		mesh.material.uniforms.time.value = time * 0.005;
		mesh.material.uniforms.sineTime.value = Math.sin(mesh.material.uniforms.time.value * 0.05);
	};

	positionSimulationTexture = createSimulationTexture();
	geometry = createGeometry();
	mesh = createMesh(geometry, positionSimulationTexture);

	console.log(positionSimulationTexture);

	const debugMesh = new THREE.Mesh(
		new THREE.PlaneGeometry( 512, 512 ),
		new THREE.MeshBasicMaterial({ map: positionSimulationTexture, side: THREE.DoubleSide }),
		// new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
	);
	mesh.add(debugMesh);


	return { mesh, update };
};

export default InstancedParticles;
