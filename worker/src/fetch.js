import { Router } from 'itty-router';
import {
	error,
	json,
	text,
} from 'itty-router-extras';
import {
	InteractionResponseType,
	InteractionType,
	verifyKey,
} from 'discord-interactions';
import {
	COUNTDOWN_COMMAND,
	TIMEZONE_COMMAND,
} from './commands';
import timezones from './timezones';

const router = Router();

router.get('/', (request, env) => {
	return text(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

router.post('/interaction', async (request, env, ctx) => {
	const body = await request.clone().arrayBuffer();
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	const isValidRequest = verifyKey(
		body,
		signature,
		timestamp,
		env.DISCORD_PUBLIC_KEY
	);

	if (!isValidRequest) {
		console.error('Bad Request Signature');
		return error(401, 'Bad Request Signature');
	}

	const interaction = await request.json();

	switch (interaction.type) {
		case InteractionType.PING: {
			console.log('Handling Ping request');
			return json({
				type: InteractionResponseType.PONG,
			});
		}
		case InteractionType.APPLICATION_COMMAND: {
			const commands = [
				COUNTDOWN_COMMAND,
				TIMEZONE_COMMAND
			];
			const command = commands.find(command => command.name === interaction.data.name && command.type === interaction.data.type);
			return await command.handle(interaction, { env, ctx });
		}
		case InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE: {
			const option = interaction.data.options.find(option => option.focused === true);
			if (option.name === 'timezone') {
				const choices = option.value ? timezones.filter(tz => tz.match(new RegExp(option.value, 'i'))) : timezones;
				return json({
					type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
					data: {
						choices: choices.slice(0, 25).map(choice => ({
							name: choice,
							value: choice,
						}))
					}
				});
			} else {
				console.error('Unknown Autocomplete Option');
				return error(400, 'Unknown Autocomplete Option');
			}
		}
		default: {
			console.error('Unknown Interaction Type');
			return error(400, 'Unknown Interaction Type');
		}
	}
});

router.all('*', () => error(404, 'Not Found'));

export default async function fetch(request, env, ctx) {
	return router.handle(request, env, ctx).catch(err => {
		console.error({
			url: request.url,
			error: err,
		});
		return error(500, 'Internal Serverless Error');
	});
}