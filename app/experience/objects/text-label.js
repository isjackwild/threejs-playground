import { toXYCoords } from '../UTIL.js';
import { camera } from '../camera.js';

const textLabel = (parent) => {
	const span = document.createElement('span');
	span.innerHTML = parent.contentId;

	const { x, y } = toXYCoords(parent, camera);
	span.style.position = 'fixed';
	span.style.left = `${x}px`;
	span.style.top = `${y}px`;
	document.body.appendChild(span);

	const update = () => {
		const { x, y } = toXYCoords(parent, camera);
		span.style.left = `${x}px`;
		span.style.top = `${y}px`;
	}

	return { update }
}

export default textLabel