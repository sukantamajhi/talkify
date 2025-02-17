import UserModel, { IUser } from "../models/UserModel";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import envConfig from "../utils/envConfig";
import sendMail, { compileTemplate } from "./EmailService";
import { ERRORS } from "../utils/messages";
import logger from "../../logger";
import path from "path";
import { convertHtmlToHbs } from "../utils/utils";
import { UserProjection } from "../utils/Projections/UserProjection";
import RoomModel from "../models/RoomModel";

const JWT_SECRET = envConfig.jwtSecret;
const SALT_ROUNDS = 10;

interface ICheckUserExist {
	email: string;
	username: string;
	isActive?: boolean;
}

const checkUserExists = async ({
	email,
	username,
	isActive = true,
}: Partial<ICheckUserExist>) => {
	// logger.info(email, username, 'Checking user exists');
	const user = await UserModel.findOne({
		email,
		isActive,
	});
	return user;
};

export default {
	register: async (userData: IUser): Promise<Partial<IUser>> => {
		return new Promise(async (resolve, reject) => {
			try {
				const userExists = await checkUserExists({
					email: userData?.email,
				});
				logger.info(userExists, "<<-- userExists");
				if (userExists) {
					return reject(ERRORS.USER_ALREADY_EXISTS);
				}

				const hashedPassword = await bcrypt.hash(
					userData.password,
					SALT_ROUNDS
				);
				const user = new UserModel({
					email: userData.email,
					name: userData.name,
					userName: userData.email.split("@")[0],
					password: hashedPassword,
				});

				const newUser = await user.save();

				if (newUser) {
					// Create a new room with username
					const room = await RoomModel.create({
						name: user.userName,
					});
				}

				const emailTemplate = await convertHtmlToHbs({
					templateName: "registration-successful",
					data: {
						name: newUser.name,
					},
				});

				await sendMail({
					to: newUser.email,
					subject: "Welcome Aboard! Your Talkify Account is Ready",
					html: emailTemplate as string,
				});

				return resolve({
					name: newUser.name,
					email: newUser.email,
					userName: newUser.userName,
					profilePicture: newUser.profilePicture,
					lastLogin: newUser.lastLogin,
					loginToken: newUser.loginToken,
					createdAt: newUser.createdAt,
				});
			} catch (error: any) {
				return reject(ERRORS.USER_ALREADY_EXISTS);
			}
		});
	},
	login: async (
		userData: IUser
	): Promise<{
		id: string;
		token: string;
		name: string;
		email: string;
		userName: string;
	}> => {
		return new Promise(async (resolve, reject) => {
			try {
				const user = await checkUserExists({ email: userData.email });
				if (!user) {
					return reject(ERRORS.USER_NOT_FOUND);
				}

				const isPasswordMatch = await bcrypt.compare(
					userData.password,
					user.password
				);
				if (!isPasswordMatch) {
					return reject(ERRORS.INVALID_CREDENTIALS);
				}

				const token = jwt.sign({ email: user.email }, JWT_SECRET, {
					expiresIn: "1h",
				});
				if (!token) {
					return reject(ERRORS.TOKEN_GENERATION_ERROR);
				}

				user.lastLogin = new Date();
				user.loginToken = token;
				await user.save();

				return resolve({
					token,
					id: user._id as string,
					name: user.name,
					email: user.email,
					userName: user.userName,
				});
			} catch (error: any) {
				return reject(error.message);
			}
		});
	},
	forgotPassword: async (email: string): Promise<string> => {
		return new Promise(async (resolve, reject) => {
			try {
				const userExists = await checkUserExists({ email });
				if (!userExists) {
					return reject(ERRORS.USER_NOT_FOUND);
				}

				const emailTemplate = await convertHtmlToHbs({
					templateName: "reset-password",
					data: {
						name: "Sukanta Majhi",
						resetLink: "http://localhost:3000/reset-password",
					},
				});

				await sendMail({
					to: email,
					subject: "Reset your password",
					html: emailTemplate as string,
				});

				return resolve("Email sent successfully");
			} catch (error: any) {
				throw new Error(error.message);
			}
		});
	},
	resetPassword: async (data: {
		email: string;
		password: string;
	}): Promise<string> => {
		try {
			const user = await checkUserExists({ email: data.email });
			if (!user) {
				throw ERRORS.USER_NOT_FOUND;
			}

			const hashedPassword = await bcrypt.hash(
				data.password,
				SALT_ROUNDS
			);
			await UserModel.updateOne(
				{ email: data.email },
				{ password: hashedPassword }
			);
			return "Password reset successfully";
		} catch (error: any) {
			throw new Error(error.message);
		}
	},
	logout: async (email: string): Promise<void> => {
		try {
			const user = await checkUserExists({ email });
			if (!user) {
				throw ERRORS.USER_NOT_FOUND;
			}

			user.loginToken = null;
			await user.save();
		} catch (error: any) {
			throw new Error(error.message);
		}
	},
};
