import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import path from "path";
import logger from "../../logger";
import UserModel, {IUser} from "../models/UserModel";
import {compileTemplate} from "../services/EmailService";
import envConfig from "./envConfig";
import {CommonMessages} from "./messages";
import {UserProjection} from "./Projections/UserProjection";
import {genTokenPayload} from "./types";

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

export function generateToken(
	payload: genTokenPayload,
): string {
	try {
		const stringPayload = JSON.stringify(payload);
		return CryptoJS.AES.encrypt(stringPayload, envConfig.jwtSecret).toString();
	} catch (error) {
		logger.error(error, "Error in generateToken");
		throw error;
	}
}

export function decodeToken(token: string): unknown {
	try {
		const bytes = CryptoJS.AES.decrypt(token, envConfig.jwtSecret);
		return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
	} catch (error) {
		logger.error(error, "Error in decodeToken");
		throw error;
	}
}

export function isTokenExpired(expiryDate: number): boolean {
	try {
		// Check if the 'exp' field is present in the payload
		if (!expiryDate) {
			throw new Error("Token does not have an expiry date.");
		}

		// Get the current timestamp
		const currentTimestamp = Math.floor(Date.now() / 1000);

		// Compare the token's expiry timestamp with the current timestamp
		return expiryDate < currentTimestamp;
	} catch (error) {
		logger.error(error, "Error in isTokenExpired");
		throw error;
	}
}