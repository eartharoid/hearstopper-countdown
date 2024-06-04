import {
	CDN,
	DISCORD_API
} from './config';

export function getCountdownImageURL(days) {
	if (days === 1 || days === 5 || days % 10 === 0) {
		return `${CDN}/${days}-compressed.gif`;
	} else {
		return `${CDN}/${days}.png`;
	}
}

export async function getApplicationCommands(env, ctx) {
	const key = '__cache:application.commands';
	const cached = await env.SETTINGS.get(key, { type: 'json', cacheTtl: 86400 });
	if (cached) {
		return cached;
	} else {
		const response = await fetch(`${DISCORD_API}/applications/${env.DISCORD_APPLICATION_ID}/commands`, {
			headers: {
				'Authorization': `Bot ${env.DISCORD_TOKEN}`,
			}
		});
		const commands = await response.json();
		ctx.waitUntil(env.SETTINGS.put(key, JSON.stringify(commands), { expirationTtl: 172800 }));
		return commands;
	}

}

export async function getApplicationUser(env, ctx) {
	const key = '__cache:application.user';
	const cached = await env.SETTINGS.get(key, { type: 'json', cacheTtl: 172800 });
	if (cached) {
		return cached;
	} else {
		const response = await fetch(`${DISCORD_API}/users/@me`, {
			headers: {
				'Authorization': `Bot ${env.DISCORD_TOKEN}`,
			}
		});
		const commands = await response.json();
		ctx.waitUntil(env.SETTINGS.put(key, JSON.stringify(commands), { expirationTtl: 604800 }));
		return commands;
	}

}