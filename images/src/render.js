
import {
	// registerFont,
	createCanvas,
	Image,
} from 'canvas';
import { WIDTH, HEIGHT, FONT } from './config.js';

// registerFont('assets/fonts/HEAVYRUST.ttf', { family: 'HEAVYRUST' });

export function renderFrame(bg, days) {
	const canvas = createCanvas(WIDTH, HEIGHT);
	const ctx = canvas.getContext('2d');
	
	if (bg) {
		const img = new Image();
		img.onload = () => ctx.drawImage(img, 0, 0);
		img.onerror = err => { throw err; };
		img.src = bg;
	}

	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = 'white';
	ctx.shadowOffsetX = 4;
	ctx.shadowOffsetY = 4;
	ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
	ctx.shadowBlur = 12;

	switch (days) {
		case 0:
			ctx.font = `172px ${FONT}`;
			ctx.fillText('Season 3', WIDTH / 2, 174);
			ctx.fillText('is out!', WIDTH / 2, 366);
			break;
		case 1:
			ctx.font = `72px ${FONT}`;
			ctx.fillText('season 3 arrives', 400, 174);
			ctx.font = `196px ${FONT}`;
			ctx.fillText('Tomorrow!', WIDTH / 2, 306);
			break;
		default:
			ctx.font = `256px ${FONT}`;
			ctx.fillText(days.toString(), WIDTH / 2, 186);
			ctx.font = `96px ${FONT}`;
			ctx.fillText('days until season 3', WIDTH / 2, 370);
	}
	return canvas;
}