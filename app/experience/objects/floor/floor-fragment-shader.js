import { FLOOR_MAX_OFFSET } from '../../constants.js';
const FRAGMENT_SHADER =

`
varying vec3 vNormal;
varying vec3 vPosition;
float maxOffsetPosition = ${FLOOR_MAX_OFFSET}.0;
vec3 colorOne = vec3(151.0 / 255.0, 113.0 / 255.0, 173.0 / 255.0);
vec3 colorTwo = vec3(184.0 / 255.0, 151.0 / 255.0, 101.0 / 255.0);

void main() {
	vec3 light = vec3(0.5, 0.2, 1.0);
	light = normalize(light);

	float dProd = max(0.0, dot(vNormal, light));
	dProd /= 2.0;
	dProd += 0.5;
	float control = (vPosition.z + maxOffsetPosition) / (maxOffsetPosition * 2.0);
	vec3 color = mix(colorOne, colorTwo, control);
	color *= dProd;

	gl_FragColor = vec4(color, 1.0);
}

`;
export default FRAGMENT_SHADER;