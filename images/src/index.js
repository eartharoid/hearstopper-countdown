// ! `sharp` (load.js) MUST be imported **AFTER** `canvas` (render.js) to avoid conflict:
// https://github.com/Automattic/node-canvas/issues/1386
// https://github.com/Automattic/node-canvas/issues/930

import createDebug from 'debug';
import { START, END, DEBUG } from './config.js';
import loadImages from './load.js';
import { createWriteStream } from 'fs';
import useThreads from './threads.js';

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

const tasks = [];

for (let days = START; days <= END; days++) {
	const bg = backgrounds.static[sbg];
	tasks.push({
		task: (worker) => worker.createPNG(bg, days),
		// `buffer` is an ArrayBuffer
		callback: (buffer) => createWriteStream(`generated/static/${days}.png`).write(Buffer.from(buffer)),
	});
	sbg++;
	if (sbg === backgrounds.static.length) sbg = 0;
	if (days === 1 || days === 5 || days % 10 === 0) {
		const bg = backgrounds.animated[abg];
		if (sbg === backgrounds.static.length) sbg = 0;
		tasks.push({
			task: (generator) => generator.createGIF(bg, days),
			callback: (buffer) => createWriteStream(`generated/animated/${days}.png`).write(Buffer.from(buffer)),
		});
		abg++;
		if (abg === backgrounds.animated.length) abg = 0;
	}
}

await useThreads({
	workerName: 'generator',
	workerPath: './workers/generator.js',
	tasks,
});

debug('WAIT FOR WRITE STREAMS TO COMPLETE');