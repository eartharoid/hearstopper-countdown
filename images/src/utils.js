import os from 'node:os';
import { ImageData } from 'canvas';

export function chunkify(arr) {
	const n = Math.min(arr.length, Math.floor(0.5 * os.cpus().length));
	return arr.reduce(
		(acc, val, i) => (acc[i % n].push(val), acc),
		[...new Array(n)].map(() => [])
	);
}

export function createImageData(buffer, w, h) {
	return new ImageData(
		Uint8ClampedArray.from(buffer),
		w,
		h
	);
}