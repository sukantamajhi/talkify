import Axios from "axios";

// Set config defaults when creating the instance
const axios = Axios.create({
	baseURL: "http://localhost:5000/api",
	headers: {
		"Content-Type": "application/json",
	},
});

axios.interceptors.request.use(
	(config) => {
		// Modify request before sending
		// You can add auth tokens here if needed
		const token = localStorage.getItem("token");
		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

axios.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		// Handle error globally
		if (error.response?.status === 401) {
			// Handle unauthorized errors, e.g., redirect to login page
			console.error("Unauthorized, please login again.");
			localStorage.removeItem("token");
			window.location.replace("/");
		}
		return Promise.reject(error);
	}
);

export default axios;
