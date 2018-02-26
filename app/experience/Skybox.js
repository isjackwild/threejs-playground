const THREE = require('three');

const Skybox = () => {
	const uniforms = {
      color1: {
        type: "c",
        value: new THREE.Color(0xbccde3), //light blue
      },
      color2: {
        type: "c",
        // value: new THREE.Color(0x6588af), //blue
        // value: new THREE.Color(0x142C53), //blue
        value: new THREE.Color(0x698cc5), //blue
      },
    };
    
	const fragmentShader = `
		uniform vec3 color1;
		uniform vec3 color2;
		varying vec2 vUv;

		// float rand (float n) {
		// 	return fract(sin(n)*1.0);
		// }

		// float noise(float x) {
		// 	float i = floor(x);
		// 	float f = fract(x);
			
		// 	float n = rand(i);
		// 	n = mix(rand(i), rand(i + 1.0), smoothstep(0.,1.,f));

		// 	return n;
		// }

		// 2D Random
		float random (in vec2 st) {
		    return fract(sin(dot(st.xy,
		                         vec2(12.9898,78.233)))
		                 * 43758.5453123);
		}

		// 2D Noise based on Morgan McGuire @morgan3d
		// https://www.shadertoy.com/view/4dS3Wd
		float noise (in vec2 st) {
		    vec2 i = floor(st);
		    vec2 f = fract(st);

		    // Four corners in 2D of a tile
		    float a = random(i);
		    float b = random(i + vec2(1.0, 0.0));
		    float c = random(i + vec2(0.0, 1.0));
		    float d = random(i + vec2(1.0, 1.0));

		    // Smooth Interpolation

		    // Cubic Hermine Curve.  Same as SmoothStep()
		    vec2 u = f*f*(3.0-2.0*f);
		    // u = smoothstep(0.,1.,f);

		    // Mix 4 coorners porcentages
		    return mix(a, b, u.x) +
		            (c - a)* u.y * (1.0 - u.x) +
		            (d - b) * u.x * u.y;
		}

		void main() {
			float TWO_PI = 3.1416 * 2.0;
			float stretchedUV = clamp(vUv.y * 1.45, 0.0, 1.0); 
			float control = (cos(stretchedUV * TWO_PI) + 1.0) * 0.5;
			// float control = clamp(vUv.y * 1.45, 0.0, 1.0);

			float x = (vUv.x + 4.0) * (vUv.y + 4.0) * 100.0;
			vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01) - 0.005) * 6.0;

			vec3 baseColor = mix(color1, color2, control);
			vec3 color = mix(baseColor, vec3(1.0, 1.0, 1.0), noise(vec2(vUv.x * 70.0, vUv.y * 800.0)) * 0.05);
			// vec3 color = vec3(noise(vUv.y * 1000.0));

			gl_FragColor = vec4(color + grain.xyz, 1.0);
		}
	`;

	const vertexShader = `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
		}
	`;

	const mesh = new THREE.Mesh(
		new THREE.SphereBufferGeometry(25000, 32, 32),
		new THREE.ShaderMaterial({
			side: THREE.DoubleSide,
			uniforms,
			fragmentShader,
			vertexShader,
		}),
	);
	mesh.material.fog = false;

	return { mesh };
};


export default Skybox;
