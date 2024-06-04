import {
	readdirSync,
} from 'node:fs';
import useThreads from './threads.js';

export default async function loadImages(dir, options) {
	const files = readdirSync(dir);
	const tasks = [];
	const images = [];
	for await (const file of files) {
		tasks.push({
			task: (preprocessor) => preprocessor.preprocess(dir + '/', file, options),
			callback: (image) => {
				image.buffer = Buffer.from(image.buffer);
				images.push(image);
			},
		});
	}
	await useThreads({
		workerName: 'preprocessor',
		workerPath: './workers/preprocessor.js',
		tasks,
	});
	return images.sort((a, b) => parseInt(a.n) - parseInt(b.n));
}