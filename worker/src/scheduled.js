import {
	BUTTON_EMOJI,
	BUTTON_LABEL,
	BUTTON_URL,
	CDN,
	COLOUR,
	DISCORD_CDN,
	EVENT_ARRIVED,
	EVENT_DATE,
	EVENT_IN,
	EVENT_NAME,
	EVENT_UNTIL,
} from './config';
import { getTotalTimeLeft } from "./countdown";
import { getApplicationUser } from './helpers';
import { MessageComponentTypes } from 'discord-interactions';

export default async function scheduled(event, env, ctx) {
	ctx.waitUntil(
		(async () => {
			const user = await getApplicationUser(env, ctx);
			const { days } = getTotalTimeLeft();
			const unix = Math.floor(new Date(EVENT_DATE).getTime() / 1000);

			if (days < 0) return console.log('The countdown is over, the event has passed.');

			let message;

			if (days === 0) {
				message = {
					components: [{
						type: MessageComponentTypes.ACTION_ROW,
						components: [{
							type: MessageComponentTypes.BUTTON,
							style: 5,
							label: BUTTON_LABEL,
							emoji: BUTTON_EMOJI,
							url: BUTTON_URL
						}]
					}],
					embeds: [{
						color: COLOUR,
						title: `:tada: ${EVENT_NAME} is here!`,
						description: EVENT_ARRIVED,
						image: { url: `${CDN}/${days}.png` },
						footer: { text: 'Made by eartharoid' },
					}]
				};
			} else if (days === 1) {
				message = {
					embeds: [{
						color: COLOUR,
						title: 'Only 1 day left!',
						description: `${EVENT_IN} <t:${unix}:R>.`,
						image: { url: `${CDN}/${days}.png` },
						footer: { text: 'Made by eartharoid' },
					}]
				};
			} else {
				message = {
					embeds: [{
						color: COLOUR,
						title: `${days} days left`,
						description: `There are **${days} days** left until ${EVENT_UNTIL}.`,
						image: { url: `${CDN}/${days}.png` },
						footer: { text: 'Made by eartharoid' },
					}]
				};
			}

			await fetch(env.DISCORD_WEBHOOK_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: user.username,
					avatar_url: `${DISCORD_CDN}/avatars/${user.id}/${user.avatar}.png `,
					...message,
				})
			});
		})()
	);
}