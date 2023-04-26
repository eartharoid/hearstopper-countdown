export default async function scheduled(event, env, ctx) {
	ctx.waitUntil(
		(async () => {
			console.log('Hello World! (scheduled');
		})()
	);
}