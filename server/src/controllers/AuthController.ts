import {Request, Response} from "express";
import {validationResult} from "express-validator";
import logger from "../../logger";
import authService from "../services/AuthService";
import {CommonMessages, UserMessages} from "../utils/messages";
import {IRequest} from "../utils/types";

export default {
	register: async (
		req: Request,
		res: Response,
		next: Function
	): Promise<any> => {
		// Check for validation errors
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({errors: errors.array()});
		}
		try {
			const user = await authService.register(req.body);
			return res.status(201).json({
				error: false,
				code: "USER_REGISTERED",
				message: UserMessages.USER_REGISTERED,
				data: user,
			});
		} catch (error: any) {
			next(error);
		}
	},
	login: async (
		req: Request,
		res: Response,
		next: Function
	): Promise<any> => {
		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({errors: errors.array()});
		}

		try {
			const {id, token, name, userName, email} =
				await authService.login(req.body);

			return res.status(200).send({
				error: false,
				code: "USER_LOGGED_IN",
				message: UserMessages.USER_LOGGED_IN,
				data: {id, name, userName, email},
				token,
			});
		} catch (error: any) {
			logger.error(error, "<<-- Error in login api");
			next(error);
		}
	},

	emailVerification: async (
		req: IRequest,
		res: Response,
		next: Function
	): Promise<any> => {
		try {
			const success = await authService.emailVerification(req.body)

			if (success) {
				return res.status(200).send({
					error: false,
					code: "USER_LOGGED_IN",
					message: UserMessages.EMAIL_VERIFIED,
				})
			}

		} catch (e) {
			logger.error(e, "<<-- Error in email verification controller");
			next(e);
		}
	},

	forgotPassword: async (
		req: Request,
		res: Response,
		next: Function
	): Promise<any> => {
		try {
			const message = await authService.forgotPassword(req.body.email);
			return res.status(200).json({
				error: false,
				code: "FORGOT_PASSWORD",
				message: message,
			});
		} catch (error: any) {
			next(error);
		}
	},
	resetPassword: async (
		req: Request,
		res: Response,
		next: Function
	): Promise<any> => {
		try {
			const message = await authService.resetPassword(req.body);
			return res.status(200).json({
				error: false,
				code: "PASSWORD_RESET",
				message: message,
			});
		} catch (error: any) {
			next(error);
		}
	},

	logout: async (
		req: IRequest,
		res: Response,
		next: Function
	): Promise<any> => {
		try {
			if (req.user) {
				const {email} = req.user;
				await authService.logout(email);
				return res.status(200).json({
					error: false,
					code: "USER_LOGGED_OUT",
					message: UserMessages.USER_LOGGED_OUT,
				});
			} else {
				return res.status(400).json({
					error: true,
					code: "USER_NOT_FOUND",
					message: CommonMessages.ERROR,
				});
			}
		} catch (error: any) {
			next(error);
		}
	},
};
