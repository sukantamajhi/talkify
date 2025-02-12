import Axios from "axios";

// Set config defaults when creating the instance
const axios = Axios.create({
	baseURL: "http://localhost:5000/api",
	headers: {
		"Content-Type": "application/json",
	},
});

export default axios;
