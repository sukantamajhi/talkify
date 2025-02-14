import { useState, useEffect } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
	// Get data from localStorage or use the initial value
	const storedValue = localStorage.getItem(key);
	const parsedValue = storedValue ? JSON.parse(storedValue) : initialValue;

	// State to hold the value
	const [value, setValue] = useState<T>(parsedValue);

	// Sync with localStorage when the value changes
	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);

	// Function to update the value in both state and localStorage
	const setStoredValue = (newValue: T | ((val: T) => T)) => {
		const valueToStore =
			newValue instanceof Function ? newValue(value) : newValue;
		setValue(valueToStore);
	};

	// Function to remove the value from localStorage and reset state
	const removeStoredValue = () => {
		localStorage.removeItem(key);
		setValue(initialValue);
	};

	return [value, setStoredValue, removeStoredValue] as const;
}

export default useLocalStorage;
