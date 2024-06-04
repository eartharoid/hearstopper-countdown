import {
	createCanvas,
} from 'canvas';
import { WIDTH, HEIGHT, FONT } from './config.js';
import { createImageData } from './utils.js';

// registerFont('assets/fonts/HEAVYRUST.ttf', { family: 'HEAVYRUST' });

export default class Renderer {
	constructor() {
		this.previous = null;
	}

	renderFrame(bg, days) {
		const canvas = createCanvas(WIDTH, HEIGHT);
		const ctx = canvas.getContext('2d');

		// load previous background
		if (this.previous) {
			ctx.putImageData(createImageData(this.previous, WIDTH, HEIGHT), 0, 0);
		}

		ctx.putImageData(bg, 0, 0);
		this.previous = canvas.toBuffer();

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
				ctx.fillText('Season 3', WIDTH / 2, 0.28 * HEIGHT);
				ctx.fillText('is out!', WIDTH / 2, 0.52 * HEIGHT);
				break;
			case 1:
				ctx.font = `72px ${FONT}`;
				ctx.fillText('season 3 arrives', 400, 0.28 * HEIGHT);
				ctx.font = `196px ${FONT}`;
				ctx.fillText('Tomorrow!', WIDTH / 2, 0.445 * HEIGHT);
				break;
			default:
				ctx.font = `256px ${FONT}`;
				ctx.fillText(days.toString(), WIDTH / 2, 0.295 * HEIGHT);
				ctx.font = `96px ${FONT}`;
				ctx.fillText('days until season 3', WIDTH / 2, 0.525 * HEIGHT);
		}

		return ctx;
	}
}