import {
	// registerFont,
	createCanvas,
	Image,
} from 'canvas';
import { WIDTH, HEIGHT, FONT } from './config.js';
// import { ImageData } from 'canvas';

// registerFont('assets/fonts/HEAVYRUST.ttf', { family: 'HEAVYRUST' });

export default class Renderer {
	constructor() {
		this.canvas = createCanvas(WIDTH, HEIGHT);
		this.ctx = this.canvas.getContext('2d');
		this.ctx.save();
	}

	renderFrame(bg, days) {
		this.ctx.restore();
		// this.ctx.putImageData(bg, 0, 0);
		const img = new Image();
		img.onload = () => this.ctx.drawImage(img, 0, 0);
		img.onerror = err => { throw err; };
		img.src = bg;
		this.ctx.save();

		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		this.ctx.fillStyle = 'white';
		this.ctx.shadowOffsetX = 4;
		this.ctx.shadowOffsetY = 4;
		this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
		this.ctx.shadowBlur = 12;

		switch (days) {
			case 0:
				this.ctx.font = `172px ${FONT}`;
				this.ctx.fillText('Season 3', WIDTH / 2, 224);
				this.ctx.fillText('is out!', WIDTH / 2, 416);
				break;
			case 1:
				this.ctx.font = `72px ${FONT}`;
				this.ctx.fillText('season 3 arrives', 400, 224);
				this.ctx.font = `196px ${FONT}`;
				this.ctx.fillText('Tomorrow!', WIDTH / 2, 356);
				break;
			default:
				this.ctx.font = `256px ${FONT}`;
				this.ctx.fillText(days.toString(), WIDTH / 2, 236);
				this.ctx.font = `96px ${FONT}`;
				this.ctx.fillText('days until season 3', WIDTH / 2, 420);
		}
		return this.ctx;
	}
}