export const CommonMessages = {
	ERROR: "Something went wrong. Please try again later.",
	INVALID_TOKEN: "Access Denied!",
	NOT_FOUND: "The resource you requested could not be found.",
	INVALID_INPUT: "The input provided is invalid.",
	UNAUTHORIZED: "You are not authorized to access this resource.",
	FORBIDDEN: "Access to this resource is forbidden.",
};

export const UserMessages = {
	USER_ALREADY_EXISTS: "User already exists",
	USER_NOT_FOUND: "User not found",
	INVALID_CREDENTIALS: "Invalid credentials",
	USER_REGISTERED: "User registered successfully",
	USER_LOGGED_IN: "User logged in successfully",
	USER_LOGGED_OUT: "User logged out successfully",
	USER_DELETED: "User deleted successfully",
	USER_UPDATED: "User updated successfully",
	USER_FETCHED: "User fetched successfully",
	EMAIL_VERIFIED_FAILED: "Email verification failed",
	EMAIL_VERIFIED: "Email verification successful",
};

export const RoomMessages = {
	ROOM_ALREADY_EXISTS: "Room already exists",
	ROOM_NOT_FOUND: "Room not found",
	ROOM_CREATED: "Room created successfully",
	ROOM_UPDATED: "Room updated successfully",
	ROOM_DELETED: "Room deleted successfully",
	ROOMS_FETCHED: "Rooms fetched successfully",
	ROOM_FETCHED: "Room fetched successfully",
};

export const ERRORS = {
	INTERNAL_SERVER_ERROR: {
		error: true,
		code: "INTERNAL_SERVER_ERROR",
		message: "Something went wrong. Please try again later.",
	},
	USER_ALREADY_EXISTS: {
		error: true,
		code: "USER_ALREADY_EXISTS",
		message: "User already exists",
	},
	USER_NOT_FOUND: {
		error: true,
		code: "USER_NOT_FOUND",
		message: "User not found",
	},
	INVALID_CREDENTIALS: {
		error: true,
		code: "INVALID_CREDENTIALS",
		message: "Invalid credentials",
	},
	TOKEN_GENERATION_ERROR: {
		error: true,
		code: "TOKEN_GENERATION_ERROR",
		message: "Error generating token",
	},
	// Generate same for rooms
	ROOM_ALREADY_EXISTS: {
		error: true,
		code: "ROOM_ALREADY_EXISTS",
		message: "Room already exists",
	},
	ROOM_NOT_FOUND: {
		error: true,
		code: "ROOM_NOT_FOUND",
		message: "Room not found",
	},
	INVALID_ROOM: {
		error: true,
		code: "INVALID_ROOM",
		message: "Invalid room",
	},
	INVALID_ROOM_ID: {
		error: true,
		code: "INVALID_ROOM_ID",
		message: "Invalid room ID",
	},
	INVALID_ROOM_NAME: {
		error: true,
		code: "INVALID_ROOM_NAME",
		message: "Invalid room name",
	},
	INVALID_ROOM_DESCRIPTION: {
		error: true,
		code: "INVALID_ROOM_DESCRIPTION",
		message: "Invalid room description",
	},
	INVALID_ROOM_STATUS: {
		error: true,
		code: "INVALID_ROOM_STATUS",
		message: "Invalid room status",
	},
	INVALID_ROOM_MESSAGES: {
		error: true,
		code: "INVALID_ROOM_MESSAGES",
		message: "Invalid room messages",
	},
};
