import {
	COUNTDOWN_COMMAND,
	TIMEZONE_COMMAND,
} from './src/commands.js';

const url = `https://discord.com/api/v10/applications/${process.env.DISCORD_APPLICATION_ID}/commands`;
const body = JSON.stringify([COUNTDOWN_COMMAND, TIMEZONE_COMMAND]);
const response = await fetch(url, {
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
	},
	method: 'PUT',
	body,
});

if (response.ok) {
	console.log('Registered commands');
} else {
	const text = await response.text();
	console.error(text);
}
