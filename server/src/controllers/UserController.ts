import { Response } from "express";
import { IRequest } from "../utils/types";
import { UserMessages } from "../utils/messages";
import logger from "../../logger";

export default {
	getUser: async (
		req: IRequest,
		res: Response,
		next: Function
	): Promise<any> => {
		try {
			return res.status(200).send({
				error: false,
				code: "USER_LOGGED_IN",
				message: UserMessages.USER_FETCHED,
				data: req.user,
			});
		} catch (error: any) {
			logger.error(error, "<<-- Error in login api");
			next(error);
		}
	},
};
