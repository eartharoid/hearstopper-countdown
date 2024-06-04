import createDebug from 'debug';
import { fork } from 'node:child_process';
import { resolve } from 'node:path';
import { chunkify } from './utils.js';

export default async function useForks(options) {
	const debug = createDebug(`images:${options.moduleName}`);
	const chunks = chunkify(options.tasks);
	debug('Split tasks into %d chunks', chunks.length);
	for (let i in chunks) {
		const chunk = chunks[i];
		debug('Spawning fork %d', i);
		const child = fork(
			resolve(process.cwd(), options.modulePath),
			[i.toString()],
			{
				stdio: [
					'pipe', // stdin
					'pipe', // stdout
					'pipe', // stderr
					'ipc',
				],
				env: Object.assign({}, process.env, {
					DEBUG_COLORS: 1
				}),
			}
		);
		child.stderr.pipe(process.stderr, { end: false });
		child.on('spawn', () => debug('Fork %d spawned', i));
		child.on('exit', () => debug('Fork %d exited', i));
		child.send(JSON.stringify({
			id: i,
			moduleName: options.moduleName,
			tasks: chunk,
		}));
	}
}