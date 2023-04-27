import { DISCORD_API } from './config';

export async function getApplicationCommands(env, ctx) {
	const key = '__cache:application.commands';
	const cached = await env.USERS.get(key, { type: 'json', cacheTtl: 86400 });
	if (cached) {
		return cached;
	} else {
		const response = await fetch(`${DISCORD_API}/applications/${env.DISCORD_APPLICATION_ID}/commands`, {
			headers: {
				'Authorization': `Bot ${env.DISCORD_TOKEN}`,
			}
		});
		const commands = await response.json();
		ctx.waitUntil(env.USERS.put(key, JSON.stringify(commands), { expirationTtl: 172800 }));
		return commands;
	}

}

export async function getApplicationUser(env, ctx) {
	const key = '__cache:application.user';
	const cached = await env.USERS.get(key, { type: 'json', cacheTtl: 172800 });
	if (cached) {
		return cached;
	} else {
		const response = await fetch(`${DISCORD_API}/users/@me`, {
			headers: {
				'Authorization': `Bot ${env.DISCORD_TOKEN}`,
			}
		});
		const commands = await response.json();
		ctx.waitUntil(env.USERS.put(key, JSON.stringify(commands), { expirationTtl: 604800 }));
		return commands;
	}

}