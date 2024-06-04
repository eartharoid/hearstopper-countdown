import { expose } from 'threads/worker.js';

expose({
	async createImage(bg, days) {
		console.log('Generating image %d...', days);
		
		console.log(1);
		// const png = renderFrame(createImageData(bg.buffer), days).canvas.createPNGStream();
		const renderer = new Renderer();
		const png = renderer.renderFrame(bg.buffer, days).canvas.createPNGStream();
		console.log(2);
		png.pipe(createWriteStream('generated/static/' + days + '.png'));
		console.log(3);
		sbg++;
		console.log(4);
		if (sbg === backgrounds.static.length) sbg = 0;
		console.log(5);
		if (days % 10 === 0) {
			console.log('and animating...');
			const bg = backgrounds.animated[abg];
			const { frames } = await GifUtil.read(bg.buffer);
			// const inputGif = await GifUtil.read(bg.buffer);

			// const jimpImage = GifUtil.copyAsJimp(Jimp, frames[100]);
			// await jimpImage.write('jimp.png');
			// const b64 = await jimpImage.getBase64Async(Jimp.MIME_GIF);
			// renderFrame(b64, days).canvas.createPNGStream().pipe(createWriteStream('canvas.png'));
			// console.log(6)
			// renderFrame(new ImageData( // import { createImageData } from "canvas"
			// 	Uint8ClampedArray.from(frames[1].bitmap.data),
			// 	frames[1].bitmap.width,
			// 	frames[1].bitmap.height
			// ), days).canvas.createPNGStream().pipe(createWriteStream('test2.png'));
			// console.log(7)
			// await GifUtil.write("modified.gif", inputGif.frames, inputGif);

			const renderer = new Renderer();
			const encoder = new GIFEncoder(WIDTH, HEIGHT);
			encoder.createReadStream().pipe(createWriteStream('generated/animated/' + days + '.gif'));
			encoder.setQuality(20); // 1 (best/slowest) - 30 (worst/fastest)
			encoder.setRepeat(bg.loops);
			encoder.start();
			for (let f = 0; f < frames.length; f++) {
				// for (let f = 0; f < 10; f++) { // TODO: ^^
				console.log("f=%d", f);
				encoder.setDelay(bg.delay[f]);
				const frame = frames[f];
				// const imageData = createImageData(frame.bitmap.data, frame.bitmap.width, frame.bitmap.height);
				const jimpImage = GifUtil.copyAsJimp(Jimp, frame);
				const b64 = await jimpImage.getBase64Async(Jimp.MIME_GIF);
				const ctx = renderer.renderFrame(b64, days);
				encoder.addFrame(ctx);
			}
			encoder.finish();
			abg++;
			if (abg === backgrounds.animated.length) abg = 0;
		}

	}
});