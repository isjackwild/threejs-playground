const THREE = require('three');


const VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NOISE_FRAGMENT_SHADER = `
	uniform vec3 color;

	varying vec2 vUv;

	void main() {
		float strength = 9.0;

    	float x = (vUv.x + 4.0) * (vUv.y + 4.0) * 10.0;
		vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01) - 0.005) * strength;

		gl_FragColor = vec4(color + grain.xyz, 1.0);
	}`;


const FRAGMENT_SHADER = `
  uniform vec3 color;
  uniform float opacity;

  varying vec2 vUv;

  void main() {
    float strength = 9.0;

    float x = (vUv.x + 4.0) * (vUv.y + 4.0) * 10.0;

    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fade = smoothstep(0.1, 50.0, depth);

    gl_FragColor = vec4(color, vUv.x * fade * opacity);
  }`;



class Skybox extends THREE.Mesh {
	constructor(args) {
		super(args);
		this.radius = args.radius;
		this.setup();
	}

	setup() {
		this.geometry = new THREE.SphereGeometry(this.radius, 20, 20);
		// this.material = new THREE.MeshStandardMaterial({
		// 	color: 0x9fc2c6,
		// 	// color: 0xcccccc,
		// 	roughness: 0.7,
		// 	metalness: 0.8,
		// 	// fog: false,
		// 	// transparent: true,
		// 	// wireframe: true,
		// 	visible: false,
		// });

		this.material = new THREE.ShaderMaterial({
			uniforms: {
				color: {
					type: "c",
					value: new THREE.Color(0xffffff)
				},
				opacity: {
					type: "f",
					value: 1
				}
			},
			vertexShader: VERTEX_SHADER,
			fragmentShader: NOISE_FRAGMENT_SHADER,
			depthTest: false,
			depthWrite: false,
			side: THREE.DoubleSide,
			transparent: true
		});
		this.material.shading = THREE.SmoothShading;
		this.material.side = THREE.BackSide;
	}
}

export default Skybox;