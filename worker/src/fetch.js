import { Router } from 'itty-router';
import {
	error,
	json
} from 'itty-router-extras';
import {
	InteractionResponseType,
	InteractionType,
	verifyKey,
} from 'discord-interactions';

const router = Router();

router.get('/', (request, env) => {
	return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

router.post('/interaction', async (request, env) => {
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	const body = await request.clone().arrayBuffer();
	const isValidRequest = verifyKey(
		body,
		signature,
		timestamp,
		env.DISCORD_PUBLIC_KEY
	);

	if (!isValidRequest) {
		console.error('Invalid Request');
		return error(401, 'Bad Request Signature');
	}

	const message = await request.json();

	switch (message.type) {
		case InteractionType.PING: {
			console.log('Handling Ping request');
			return json({
				type: InteractionResponseType.PONG,
			});
		}
		case InteractionType.APPLICATION_COMMAND: {
			break;
		}
		case InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE: {
			break;
		}
		default: {
			console.error('Unknown Interaction Type');
			return error(400, 'Unknown Interaction Type');
		}
	}
});

router.all('*', () => error(404, 'Not Found'));

export default async function fetch(request, env, ctx) {
	return router.handle(request, env).catch(err => {
		console.error({
			url: request.url,
			error: err,
		});
		return error(500, 'Internal Serverless Error');
	});
}