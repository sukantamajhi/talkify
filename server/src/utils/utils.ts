import path from "path";
import { compileTemplate } from "../services/EmailService";
import logger from "../../logger";
import { UserProjection } from "./Projections/UserProjection";
import { CommonMessages } from "./messages";
import UserModel, { IUser } from "../models/UserModel";
import jwt from "jsonwebtoken";
import envConfig from "./envConfig";

interface IConvertHtmlToHbs {
	templateName: string;
	data: Record<string, any>;
}

export const convertHtmlToHbs = async ({
	templateName,
	data,
}: IConvertHtmlToHbs): Promise<string | null> => {
	try {
		const templatePath = path.join(
			__dirname,
			`../email-templates/${templateName}.html`
		);

		// Compile email template
		const emailHtml = await compileTemplate(templatePath, data);

		return emailHtml;
	} catch (error) {
		logger.error(error, "<<-- Error in convertHtmlToHbs");
		return null;
	}
};

export const JWTTokenVerification = (token: string) => {
	return new Promise<IUser>(async (resolve, reject) => {
		try {
			const decodedToken: any = jwt.verify(token, envConfig.jwtSecret);
			logger.info(decodedToken, "<<-- decodedToken");
			if (decodedToken?.email) {
				const user = await UserModel.findOne(
					{
						email: decodedToken.email,
						isActive: true,
					},
					UserProjection
				);
				if (!user) {
					return reject({
						error: true,
						code: "INVALID_TOKEN",
						message: CommonMessages.INVALID_TOKEN,
					});
				} else {
					return resolve(user);
				}
			}
		} catch (error) {
			logger.error(error, "<<-- Error in JWTTokenVerification");
			return reject({
				error: true,
				code: "INVALID_TOKEN",
				message: CommonMessages.INVALID_TOKEN,
			});
		}
	});
};
