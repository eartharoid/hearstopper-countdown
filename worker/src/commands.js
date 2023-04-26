export const DAYS_COMMAND = {
	type: 1,
	name: 'days',
	description: 'Check how many days are left until Heartstopper Season 2 is released',
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
};

