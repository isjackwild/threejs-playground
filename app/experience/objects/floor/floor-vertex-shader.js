const VERTEX_SHADER =
`

void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}

`;

export default VERTEX_SHADER;