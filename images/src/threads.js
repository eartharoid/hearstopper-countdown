import createDebug from 'debug';
import { spawn, Pool, Worker } from 'threads';
import os from 'node:os';

export default async function useThreads(options) {
	const debug = createDebug(`images:${options.workerName}`);
	debug('Spawning %s thread pool', options.workerName);
	const pool = Pool(
		() => spawn(new Worker(options.workerPath)),
		{
			name: options.workerName,
			size: os.cpus().length - 1
		}
	);

	for (const task of options.tasks) {
		pool
			.queue(async (worker) => {
				worker.tail().subscribe(message => debug(message));
				const response = await task.task(worker);
				worker.end();
				return response;
			})
			.then(task.callback);
	}
	await pool.completed();
	await pool.terminate();
	debug('Terminated %s thread pool', options.workerName);
}