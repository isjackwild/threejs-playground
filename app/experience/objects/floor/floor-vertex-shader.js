import { FLOOR_MAX_OFFSET, NOISE_SCALE } from '../../constants.js';

const VERTEX_SHADER =
`

#define MAX_IMPRESSION 7.0
#define IMPRESSION_RADIUS 20.0

varying vec3 vNormal;
varying vec3 vPosition;
varying float vImpression;
uniform vec3 uTouch;
uniform float uTime;

void main() {
	vNormal = normal;
	vPosition = position;

	// noise.simplex3(x * NOISE_SCALE, y * NOISE_SCALE, noiseTime) * FLOOR_MAX_OFFSET;

	float noise = snoise(vec3(vPosition.xy * ${NOISE_SCALE}, uTime)) * ${FLOOR_MAX_OFFSET};
	vPosition.z += noise;

	vImpression = max(0.0, IMPRESSION_RADIUS - distance(position, uTouch)) / IMPRESSION_RADIUS;
	vImpression = smoothstep(0.0, 1.0, vImpression);

	vImpression = smoothstep(1.0, 0.15, distance(position, uTouch) / IMPRESSION_RADIUS);

	vPosition.z -= vImpression * MAX_IMPRESSION;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}

`;

export default VERTEX_SHADER;