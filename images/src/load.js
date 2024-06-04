import {
	existsSync,
	readdirSync,
	readFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { WIDTH, HEIGHT } from './config.js';

export default async function loadImages(dir, options) {
	const files = readdirSync(dir);
	const images = [];
	for await (const file of files) {
		const buffer = readFileSync(dir + '/' + file);
		const md5 = createHash('md5').update(buffer).digest('hex');
		let img = sharp(buffer, options);
		const meta = await img.metadata();
		const cachePath = `generated/.cache/${md5}.${meta.format}`; // file.split('.')[1]
		const data = {
			frames: meta.pages,
			delay: meta.delay,
			loops: meta.loop,
		};
		if (existsSync(cachePath)) {
			console.log('  %s is cached', file)
			images.push({
				...data,
				buffer: readFileSync(cachePath)
			});
		} else {
			console.log('  processing %s', file);
			img = img
				.resize(WIDTH, HEIGHT)
				.modulate({ brightness: 0.75 });
			await img.toFile(cachePath);
			images.push({
				...data,
				buffer: await img.toBuffer()
			});
		}
		

	}
	return images;
}