const THREE = require('three');
import _ from 'lodash';

const createMap = (letters) => {
	const LETTER_BOUNDING_BOX = 200;

	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');

	document.body.appendChild(canvas);
	canvas.style.width = '300px';
	canvas.style.height = '300px';
	canvas.style.top = '0';
	canvas.style.left = '0';
	canvas.style.position = 'absolute';
	canvas.style.opacity = 1;
	canvas.style.backgroundColor = 'orange';


	const ceilSqRt = Math.ceil(Math.sqrt(letters.length));

	canvas.width = canvas.height = LETTER_BOUNDING_BOX * ceilSqRt;
	context.font = `${LETTER_BOUNDING_BOX}px Times New Roman`;
	context.fillStyle = "#ffffff";
	context.strokeStyle = "#ffffff";
	// context.font = "35pt bold arial";
	context.textBaseline = 'middle';
	context.textAlign = 'center';

	console.log(context.font, context.textBaseline, context.textAlign);

	let i = 0;
	while (letters.length) {
		const x = ((i % ceilSqRt) * LETTER_BOUNDING_BOX) + (LETTER_BOUNDING_BOX * 0.5);
		const y = (LETTER_BOUNDING_BOX * ceilSqRt) - ((~~ (i / ceilSqRt)) * LETTER_BOUNDING_BOX) + (LETTER_BOUNDING_BOX * 0.5);

		const letter = letters.pop();

		console.log('fillText');

		context.fillText(letter, x, y);
		context.fillRect(x - (LETTER_BOUNDING_BOX * 0.5), y - (LETTER_BOUNDING_BOX * 0.5), LETTER_BOUNDING_BOX, LETTER_BOUNDING_BOX);

		i++;
	}

	const texture = new THREE.CanvasTexture(canvas);
	console.log(texture);
	return texture;
};

export default createMap;
