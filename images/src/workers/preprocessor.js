import {
	expose,
	Transfer,
} from 'threads/worker';
import {
	Observable,
	Subject
} from "threads/observable";
import {
	existsSync,
	readFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { WIDTH, HEIGHT } from '../config.js';
import { format } from 'node:util';

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
	async preprocess(file, options) {
		const buffer = readFileSync(file);
		const md5 = createHash('md5').update(buffer).digest('hex');
		let img = sharp(buffer, options);
		const meta = await img.metadata();
		const cachePath = `generated/.cache/${md5}.${meta.format}`;
		let data = {
			frames: meta.pages,
			delay: meta.delay,
			loops: meta.loop,
			path: cachePath,
		};
		if (existsSync(cachePath)) {
			debug('%s is cached', file);
			// Buffer.buffer = ArrayBuffer
			data.buffer = readFileSync(cachePath).buffer;
		} else {
			debug('processing %s', file);
			img = img
				.resize(WIDTH, HEIGHT)
				.modulate({ brightness: 0.75 });
			if (data.frames) {
				img = img.gif({
					effort: 10
				});
			}
			await img.toFile(cachePath);
			data.buffer = (await img.toBuffer()).buffer;
		}
		return Transfer(data, [data.buffer]);
	},
});