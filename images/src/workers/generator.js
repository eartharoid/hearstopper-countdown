import {
	expose,
	Transfer,
} from 'threads/worker';
import {
	Observable,
	Subject
} from "threads/observable";
import { format } from 'node:util';
import { GifUtil } from 'gifwrap';
import GIFEncoder from 'gif-encoder-2';
// import Jimp from 'jimp';
import { WIDTH, HEIGHT } from '../config.js';
import { createImageData } from '../utils.js';
import Renderer from '../render.js';
// ! `sharp` MUST be imported AFTER `canvas` (Renderer) to avoid conflict:
// https://github.com/Automattic/node-canvas/issues/1386
// https://github.com/Automattic/node-canvas/issues/930
import sharp from 'sharp';

let subject = new Subject();
const debug = (...args) => subject.next(format(...args));

expose({
	tail() {
		return Observable.from(subject);
	},
	end() {
		subject.complete();
		subject = new Subject();
	},
	async createGIF(bg, days) {
		debug('generating %d.gif', days);
		bg = Buffer.from(bg);
		const { frames } = await GifUtil.read(bg.buffer);
		const renderer = new Renderer();
		const encoder = new GIFEncoder(WIDTH, HEIGHT);
		encoder.setQuality(5); // 1 (best/slowest) - 30 (worst/fastest)
		encoder.setRepeat(bg.loops);
		encoder.start();
		for (let f = 0; f < frames.length; f++) {
			encoder.setDelay(bg.delay[f]);
			const frame = frames[f];
			const trimmed = sharp(frame.bitmap.data)
				.trim({
					threshold: 0,
					background: '#000000'
				});
			const { width, height } = await trimmed.metadata();
			const image = createImageData(await trimmed.toBuffer(), width, height);
			const ctx = renderer.renderFrame(image, days);
			encoder.addFrame(ctx);
		}
		encoder.finish();
		const buffer = encoder.out.getData();
		return Transfer(buffer.buffer);
	},
	async createPNG(bg, days) {
		debug('generating %d.png', days);
		bg = Buffer.from(bg);
		const renderer = new Renderer();
		const image = createImageData(bg.buffer, WIDTH, HEIGHT);
		const buffer = renderer.renderFrame(image, days).canvas.toBuffer();
		return Transfer(buffer.buffer);
	}
});