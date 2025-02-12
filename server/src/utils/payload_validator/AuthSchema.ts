import { checkSchema } from "express-validator";
import { IRequest } from "../types";
import { Response } from "express";

const registrationSchema = checkSchema({
	email: {
		isEmail: {
			errorMessage: "Invalid email format",
		},
		notEmpty: {
			errorMessage: "Email is required",
		},
	},
	name: {
		notEmpty: {
			errorMessage: "Name is required",
		},
		isString: {
			errorMessage: "Name must be a string",
		},
	},
	password: {
		isLength: {
			options: { min: 6 },
			errorMessage: "Password must be at least 6 characters long",
		},
		notEmpty: {
			errorMessage: "Password is required",
		},
	},
});

const loginSchema = checkSchema({
	email: {
		optional: true,
		isEmail: {
			errorMessage: "Invalid email format",
		},
	},
	username: {
		optional: true,
		isString: {
			errorMessage: "Username must be a string",
		},
	},
	phoneNumber: {
		optional: true,
		isString: {
			errorMessage: "Phone number must be a string",
		},
	},
	password: {
		isLength: {
			options: { min: 6 },
			errorMessage: "Password must be at least 6 characters long",
		},
		notEmpty: {
			errorMessage: "Password is required",
		},
	},
});

// Custom validation rule to ensure at least one of email, username, or phoneNumber is provided
const ensureOneOfEmailUsernamePhone = (
	req: IRequest,
	res: Response,
	next: Function
): any => {
	const { email, username, phoneNumber } = req.body;
	if (!email && !username && !phoneNumber) {
		return res.status(400).json({
			error: "At least one of email, username, or phone number is required",
		});
	}
	next();
};

const resetPasswordSchema = checkSchema({
	email: {
		isEmail: {
			errorMessage: "Invalid email format",
		},
		notEmpty: {
			errorMessage: "Email is required",
		},
	},
});

export {
	registrationSchema,
	loginSchema,
	ensureOneOfEmailUsernamePhone,
	resetPasswordSchema,
};
