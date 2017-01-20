import { FLOOR_MAX_OFFSET } from '../../constants.js';
const FRAGMENT_SHADER =

`
#ifdef GL_ES
precision mediump float;
#endif

#define SHADOW_STRENGTH 0.15
#define MAX_OFFSET_POSITION ${(FLOOR_MAX_OFFSET * 0.7)}

varying vec3 vNormal;
varying vec3 vPosition;
vec3 colorOne = vec3(70.0 / 255.0, 140.0 / 255.0, 200.0 / 255.0);
vec3 colorTwo = vec3(255.0 / 255.0, 255.0 / 255.0, 255.0 / 255.0);

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
	vec3 light = vec3(0.5, 0.5, 1.0);
	light = normalize(light);

	float dProd = max(0.0, dot(vNormal, light)) * SHADOW_STRENGTH;
	dProd = 1.0 - dProd;
	float control = (vPosition.z + MAX_OFFSET_POSITION) / (MAX_OFFSET_POSITION * 2.0);
	vec3 color = mix(colorOne, colorTwo, control);
	color *= dProd;
	
	float random = rand(vec2(vPosition.z, vPosition.z));
	random *= 2.0;
	random -= 1.0;
	random *= 0.03;
	color += random;

	float noise = snoise(vPosition / 18.0) / 10.0;
	color += noise;

	gl_FragColor = vec4(color, 1.0);
}

`;
export default FRAGMENT_SHADER;