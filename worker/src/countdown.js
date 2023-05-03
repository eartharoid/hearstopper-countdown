import spacetime from 'spacetime';
import { EVENT_DATE } from './config';

export function getDaysLeftIncludingToday() {
	const event = new Date(EVENT_DATE);
	const now = new Date();
	const diff = Math.floor((event.getTime() - now.getTime()) / 1000);
	if (diff < -86400) return -1;
	else if (diff < 0) return 0;
	else return Math.ceil(diff / 86400);
}
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