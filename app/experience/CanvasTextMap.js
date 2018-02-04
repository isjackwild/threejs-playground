import _ from 'lodash';

const createMap = (text) => {
	const LETTER_BOUNDING_BOX = 50;

	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');

	document.body.appendChild(canvas);
	canvas.style.width = '500px';
	canvas.style.height = '500px';
	canvas.style.top = '0';
	canvas.style.left = '0';
	canvas.style.position = 'absolute';
	canvas.style.backgroundColor = '#ffffff';

	const letters = _.filter([...text], l => l !== ' ' );
	const ceilSqRt = Math.ceil(Math.sqrt(letters.length));

	canvas.width = canvas.height = LETTER_BOUNDING_BOX * ceilSqRt;

	context.font = `${LETTER_BOUNDING_BOX}px Times New Roman`;
	// context.font = "35pt bold arial";
	context.textBaseline = 'middle';
	context.textAlign = 'center';

	console.log(context.font, context.textBaseline, context.textAlign)

	let i = 0;
	while (letters.length) {
		const x = ((i % ceilSqRt) * LETTER_BOUNDING_BOX) + (LETTER_BOUNDING_BOX * 0.5);
		const y = ((~~ (i / ceilSqRt)) * LETTER_BOUNDING_BOX) + (LETTER_BOUNDING_BOX * 0.5);

		const letter = letters.pop();

		context.fillText(letter, x, y);
		context.strokeRect(x - (LETTER_BOUNDING_BOX * 0.5), y - (LETTER_BOUNDING_BOX * 0.5), LETTER_BOUNDING_BOX, LETTER_BOUNDING_BOX);

		i++;
	}
};

export default createMap;
