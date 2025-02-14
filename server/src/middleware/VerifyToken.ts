import { Response } from "express";
import { CommonMessages } from "../utils/messages";
import { IUser } from "../models/UserModel";
import { IRequest } from "../utils/types";
import logger from "../../logger";
import { JWTTokenVerification } from "../utils/utils";

const verifyToken = async (
	req: IRequest,
	res: Response,
	next: Function
): Promise<any> => {
	try {
		const authHeader = req.headers.authorization || req.cookies?.token;
		const jwtFormat = /^Bearer\s(.+)$/;
		const jwtToken = authHeader?.match(jwtFormat)?.[1] as string;
		logger.info(jwtToken, "<<-- JWT Token");

		if (!jwtToken) {
			return res.status(401).json({
				error: true,
				code: "INVALID_TOKEN",
				message: CommonMessages.INVALID_TOKEN,
			});
		} else {
			const user: IUser = (await JWTTokenVerification(jwtToken)) as IUser;
			req.user = user;

			next();
		}
	} catch (error) {
		logger.error(error, "<<-- Error in verifing token");
		return res.status(401).json({
			error: true,
			code: "INVALID_TOKEN",
			message: CommonMessages.INVALID_TOKEN,
		});
	}
};

export default verifyToken;
