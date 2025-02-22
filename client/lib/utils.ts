import {AxiosResponse} from "axios";
import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function isDev() {
	return process.env.NODE_ENV === "development";
}


export const setLocalStorageValue = (key: string, value: any) => {
	if (typeof window === "undefined") return null;

	if (typeof value !== "string") {
		localStorage.setItem(key, JSON.stringify(value));
	} else {
		localStorage.setItem(key, value);
	}
};

export function getLocalStorageValue(key: string): any {
	// if (typeof window === "undefined") return null;
	const data = localStorage.getItem(key);
	if (!data) return null;
	try {
		return JSON.parse(data);
	} catch {
		return data;
	}
}

export const isClient = typeof window !== "undefined";

export function getInitials(fullName: string) {
	const nameParts = fullName.split(" ");

	// If the full name has both first and surname
	if (nameParts.length >= 2) {
		const firstNameInitial = nameParts[0][0]?.toUpperCase(); // First letter of the first name
		const surnameInitial = nameParts[1][0]?.toUpperCase(); // First letter of the surname
		return firstNameInitial + surnameInitial;
	}

	// In case there's only one part (e.g., single name)
	return nameParts[0][0]?.toUpperCase();
}

export const isResSuccess = (response: AxiosResponse<any, any>) => response.status.toString().startsWith("2")
