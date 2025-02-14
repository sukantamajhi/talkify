import Axios from "axios";
import { getLocalStorageValue } from "./utils";

// Set config defaults when creating the instance
const axios = Axios.create({
	baseURL: "http://localhost:5000/api",
	headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${getLocalStorageValue("token")}`, // get token from cookie
	},
});

export default axios;
