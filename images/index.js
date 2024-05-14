import {
	readdirSync,
	readFileSync,
	createWriteStream,
} from 'node:fs';
import {
	registerFont,
	createCanvas,
	Image,
} from 'canvas';
// `sharp` MUST be imported AFTER `canvas` to avoid conflict:
// https://github.com/Automattic/node-canvas/issues/1386
// https://github.com/Automattic/node-canvas/issues/930
import sharp from 'sharp';

// config
const START = 0;
const END = 150;
const WIDTH = 800;
const HEIGHT = 600;
const FONT = 'HEAVYRUST';

console.log('Loading backgrounds...');
const backgrounds = await Promise.all(
	readdirSync('assets/images')
		.map(file => sharp(readFileSync('assets/images/' + file))
			.resize(WIDTH, HEIGHT)
			.modulate({ brightness: 0.75 })
			.toBuffer()
		)
);
console.log('Loaded %d backgrounds', backgrounds.length);

// registerFont('assets/fonts/HEAVYRUST.ttf', { family: 'HEAVYRUST' });

for (let i = START; i <= END; i++) {
	console.log('Generating image %d...', i);

	const canvas = createCanvas(WIDTH, HEIGHT);
	const ctx = canvas.getContext('2d');

	const img = new Image();
	img.onload = () => ctx.drawImage(img, 0, 0);
	img.onerror = err => { throw err; };
	img.src = backgrounds[Math.floor(Math.random() * backgrounds.length)];

	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = 'white';
	ctx.shadowOffsetX = 4;
	ctx.shadowOffsetY = 4;
	ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
	ctx.shadowBlur = 12;

	switch (i) {
		case 0:
			ctx.font = `172px ${FONT}`;
			ctx.fillText('Season 3', WIDTH/2, 224);
			ctx.fillText('is out!', WIDTH/2, 416);
			break;
		case 1:
			ctx.font = `72px ${FONT}`;
			ctx.fillText('season 3 arrives', 400, 224);
			ctx.font = `196px ${FONT}`;
			ctx.fillText('Tomorrow!', WIDTH/2, 356);
			break;
		default:
			ctx.font = `256px ${FONT}`;
			ctx.fillText(i.toString(), WIDTH/2, 236);
			ctx.font = `96px ${FONT}`;
			ctx.fillText('days until season 3', WIDTH/2, 420);
	}

	canvas.createPNGStream().pipe(createWriteStream('generated/' + i + '.png'));
}

console.log('Finishing writing files...');
