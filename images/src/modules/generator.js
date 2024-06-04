import createDebug from 'debug';
import { createWriteStream } from 'node:fs';
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

const debug = createDebug('images:generator');

export async function createGIF(bg, days) {
	debug('generating %d.gif', days);
	const { frames } = await GifUtil.read(bg.buffer);
	const renderer = new Renderer();
	const encoder = new GIFEncoder(WIDTH, HEIGHT);
	encoder.createReadStream().pipe(createWriteStream(`generated/animated/${days}.gif`));
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
}

export async function createPNG(bg, days) {
	debug('generating %d.png', days);
	const renderer = new Renderer();
	const image = createImageData(bg.buffer, WIDTH, HEIGHT);
	const png = renderer.renderFrame(image, days).canvas.createPNGStream();
	png.pipe(createWriteStream(`generated/static/${days}.png`));
}