import createDebug from 'debug';
import { START, END, DEBUG, WIDTH, HEIGHT } from './config.js';
import loadImages from './load.js';;
// import { createGIF, createPNG } from './modules/generator.js';
import { writeFileSync } from 'node:fs';
import { GifUtil } from 'gifwrap';
import GIFEncoder from 'gif-encoder-2';
// import { createImageData } from './utils.js';
import Renderer from './render.js';
// ! `sharp` MUST be imported AFTER `canvas` (Renderer) to avoid conflict:
// https://github.com/Automattic/node-canvas/issues/1386
// https://github.com/Automattic/node-canvas/issues/930
// import sharp from 'sharp';


createDebug.enable(DEBUG);
const debug = createDebug('images');

debug('Loading backgrounds...');
const backgrounds = {
	animated: await loadImages('assets/images/animated', {
		animated: true,
		limitInputPixels: 0,
		pages: -1,
	}),
	static: await loadImages('assets/images/static'),
};

debug('Loaded %d animated backgrounds', backgrounds.animated.length);
debug('Loaded %d static backgrounds', backgrounds.static.length);

let abg = 0;
let sbg = 0;

for (let days = START; days <= END; days++) {
	debug('Generating %d.png', days);
	const bg = backgrounds.static[sbg];
	const renderer = new Renderer();
	// const image = createImageData(bg.buffer, WIDTH, HEIGHT);
	// const png = renderer.renderFrame(image, days).canvas.createPNGStream();
	// png.pipe(createWriteStream(`generated/static/${days}.png`));
	const canvas = renderer.renderFrame(bg.buffer, days).canvas;
	writeFileSync(`generated/static/${days}.png`, canvas.toBuffer());
	sbg++;
	if (sbg === backgrounds.static.length) sbg = 0;
	if (days === 1 || days === 5 || days % 10 === 0) {
		debug('Generating %d.gif', days);
		const bg = backgrounds.animated[abg];
		if (sbg === backgrounds.static.length) sbg = 0;
		const { frames } = await GifUtil.read(bg.buffer);
		const renderer = new Renderer();
		const encoder = new GIFEncoder(WIDTH, HEIGHT);
		// encoder.createReadStream().pipe(createWriteStream(`generated/animated/${days}.gif`));
		encoder.setQuality(5); // 1 (best/slowest) - 30 (worst/fastest)
		encoder.setRepeat(bg.loops);
		encoder.start();
		for (let f = 0; f < frames.length; f++) {
			encoder.setDelay(bg.delay[f]);
			const frame = frames[f];
			// const trimmed = sharp(frame.bitmap.data)
			// 	.trim({
			// 		threshold: 0,
			// 		background: '#000000'
			// 	});
			// const { width, height } = await trimmed.metadata();
			// const image = createImageData(await trimmed.toBuffer(), width, height);
			const ctx = renderer.renderFrame(frame.bitmap.data, days);
			encoder.addFrame(ctx);
		}
		encoder.finish();
		writeFileSync(`generated/animated/${days}.gif`, encoder.out.getData());
		abg++;
		if (abg === backgrounds.animated.length) abg = 0;
	}
}

debug('WAIT FOR WRITE STREAMS TO COMPLETE');