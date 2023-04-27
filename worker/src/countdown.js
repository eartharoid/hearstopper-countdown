import spacetime from 'spacetime';
import { EVENT_DATE } from './config';

export function getActualDaysLeftIncludingToday() {
	const event = spacetime(EVENT_DATE);
	const now = spacetime.now();
	const days = now.diff(event, 'days');
	if (days === -1) return -1;
	if (days === 0) return now.isSame(event, 'day') ? 0 : 1;
	if (days === undefined) return -1;
	return days + 1;
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