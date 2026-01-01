export const MINUTE_MS = 60_000;

export function truncateToMinute(date: Date): Date {
	return new Date(Math.floor(date.getTime() / MINUTE_MS) * MINUTE_MS);
}

export function isAfterMinute(a: Date, b: Date): boolean {
	return truncateToMinute(a).getTime() > truncateToMinute(b).getTime();
}
