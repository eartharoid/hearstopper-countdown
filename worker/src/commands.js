import {
	BUTTON_EMOJI,
	BUTTON_LABEL,
	BUTTON_URL,
	CDN,
	COLOUR,
	EVENT_ARRIVED,
	EVENT_DATE,
	EVENT_NAME,
	EVENT_UNTIL,
} from './config';
import { getTotalTimeLeft } from './countdown';
import {
	InteractionResponseType,
	MessageComponentTypes,
} from 'discord-interactions';
import { getApplicationCommands } from './helpers';
import { json } from 'itty-router-extras';
import timezones from './timezones';

export const COUNTDOWN_COMMAND = {
	type: 1,
	name: 'countdown',
	description: `Check how long is left until ${EVENT_UNTIL}`,
	handle: async (interaction, { env }) => {
		const { timezone } = await env.SETTINGS.get('user:' + interaction.member.user.id, { type: 'json' }) || { timezone: 'UTC' };
		const { days, hours, minutes, seconds } = getTotalTimeLeft(timezone);
		const unix = Math.floor(new Date(EVENT_DATE).getTime() / 1000);

		if (days < 0) {
			return json({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
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
						image: { url: `${CDN}/0.png` },
						footer: { text: 'Made by eartharoid' },
					}]
				}
			});
		} else if (days === 0) {
			return json({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					embeds: [{
						color: COLOUR,
						title: `:face_holding_back_tears: Only ${hours} hours left!`,
						description: `There are **${days} days**, **${hours} hours**, **${minutes} minutes**, and **${seconds} seconds** left until ${EVENT_UNTIL} (<t:${unix}:R>).`,
						image: { url: `${CDN}/1.png` },
						footer: { text: `Timezone: ${timezone}` },
						timestamp: new Date().toISOString(),
					}]
				}
			});
		} else {
			return json({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					embeds: [{
						color: COLOUR,
						title: `${days} days left`, // :calendar_spiral:
						description: `There are **${days} days**, **${hours} hours**, **${minutes} minutes**, and **${seconds} seconds** left until ${EVENT_UNTIL} at <t:${unix}:F>.`,
						footer: { text: `Timezone: ${timezone}` },
						timestamp: new Date().toISOString(),
					}]
				}
			});
		}
	},
};

export const TIMEZONE_COMMAND = {
	type: 1,
	name: 'timezone',
	description: 'Set your timezone',
	options: [
		{
			type: 3,
			name: 'timezone',
			description: 'Your timezone',
			required: true,
			min_length: 3,
			autocomplete: true,
		}
	],
	handle: async (interaction, { env, ctx }) => {
		const timezone = interaction.data.options.find(option => option.name === 'timezone').value;

		if (!timezones.includes(timezone)) {
			return json({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					embeds: [{
						color: COLOUR,
						title: ':x: Error',
						description: `Please enter a valid timezone.`,
						footer: { text: 'Made by eartharoid' }
					}],
				}
			});
		}

		await env.SETTINGS.put('user:' + interaction.member.user.id, JSON.stringify({ timezone }));
		const commands = await getApplicationCommands(env, ctx);
		const countdownCommandId = commands.find(command => command.name === 'countdown').id;
		return json({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				embeds: [{
					color: COLOUR,
					title: ':white_check_mark: Timezone set',
					description: `The </countdown:${countdownCommandId}> command will now respond in your timezone, \`${timezone}\`.\n*Note: it may take up to a minute for your changes to take effect.*`,
					footer: { text: 'Made by eartharoid' }
				}],
			}
		});
	},
};

