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
import { DISCORD_API } from './config';

const router = Router();

router.get('/', (request, env) => {
	return text(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

router.get('/auth', (request, env) => {
	const url = new URL(DISCORD_API + '/oauth2/authorize');
	url.searchParams.set('client_id', env.DISCORD_APPLICATION_ID);
	url.searchParams.set('redirect_uri', env.ORIGIN + '/auth/callback');
	url.searchParams.set('response_type', 'code');
	url.searchParams.set('scope', 'applications.commands webhook.incoming');
	// return text(url.toString());
	return Response.redirect(url.toString());
});

router.get('/auth/callback', async (request, env, ctx) => {
	const { code } = request.query;
	if (!code) return error(400, 'Bad Request');
	const response = await fetch(DISCORD_API + '/oauth2/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: env.DISCORD_APPLICATION_ID,
			client_secret: env.DISCORD_SECRET,
			grant_type: 'authorization_code',
			code: code,
			redirect_uri: env.ORIGIN + '/auth/callback',
		}).toString(),
	});
	const data = await response.json();
	const webhooks = await env.SETTINGS.get('__webhooks', { type: 'json' });
	webhooks.push({
		channelId: data.webhook.channel_id,
		guildId: data.webhook.guild_id,
		url: data.webhook.url,
	});
	ctx.waitUntil(env.SETTINGS.put('__webhooks', JSON.stringify(webhooks)));
	return json(data);
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

export default router.handle;