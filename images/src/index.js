// ! `sharp` (load.js) MUST be imported **AFTER** `canvas` (render.js) to avoid conflict:
// https://github.com/Automattic/node-canvas/issues/1386
// https://github.com/Automattic/node-canvas/issues/930

import createDebug from 'debug';
import { START, END, DEBUG } from './config.js';
import loadImages from './load.js';
import { createWriteStream } from 'fs';
import { renderFrame } from './render.js';

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

// let abg = 0;
let sbg = 0;

for (let days = START; days <= END; days++) {
	debug('Generating image %d...', days);
	const bg = backgrounds.static[sbg];
	sbg++;
	if (sbg === backgrounds.static.length) sbg = 0;
	const canvas = renderFrame(bg.buffer, days);
	canvas.createPNGStream().pipe(createWriteStream(`generated/static/${days}.png`));
	if (days === 1 || days === 5 || days % 10 === 0) {
		const canvas = renderFrame(bg, days);
		canvas.createPNGStream().pipe(createWriteStream(`generated/static/${days}-overlay.png`));
	}
}

debug('WAIT FOR WRITE STREAMS TO COMPLETE');