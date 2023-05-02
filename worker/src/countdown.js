import spacetime from 'spacetime';
import { EVENT_DATE } from './config';

export function getTotalTimeLeft(timezone) {
	const event = spacetime(EVENT_DATE);
	const now = spacetime.now(timezone);
	let diff = now.diff(event, 'seconds');
	return {
		days: Math.floor(diff / 86400),
		hours: Math.floor((diff %= 86400) / 3600),
		minutes: Math.floor((diff %= 3600) / 60),
		seconds: Math.floor((diff %= 60))
	};
}