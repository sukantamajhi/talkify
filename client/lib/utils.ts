import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function isDev() {
	return process.env.NODE_ENV === "development";
}

export function setCookey(key: string, value: string, days: number) {
	const date = new Date();
	date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
	document.cookie = `${key}=${value};expires=${date.toUTCString()};path=/`;
}

export function getCookey(key: string) {
	const name = `${key}=`;
	const decodedCookie = decodeURIComponent(document.cookie);
	const ca = decodedCookie.split(";");
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
