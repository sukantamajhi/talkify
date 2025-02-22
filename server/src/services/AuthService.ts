import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import logger from "../../logger";
import RoomModel from "../models/RoomModel";
import UserModel, {IUser} from "../models/UserModel";
import envConfig from "../utils/envConfig";
import {ERRORS} from "../utils/messages";
import {convertHtmlToHbs, decodeToken, generateToken, isTokenExpired} from "../utils/utils";
import sendMail from "./EmailService";

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
	return UserModel.findOne({
		email,
		isActive,
	});
};

interface ILoginResponse {
	id: string;
	token: string;
	name: string;
	email: string;
	userName: string;
}

interface IEmailVerificationPayload {
	_id: string;
	email: string;
	expiredAt: number;
}

export default {
	register: async (userData: IUser): Promise<Partial<IUser>> => {
		return new Promise(async (resolve, reject) => {
			try {
				const userExists = await checkUserExists({
					email: userData?.email,
				});
				// logger.info(userExists, "<<-- userExists");
				if (userExists !== null) {
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

				let expiredAt = new Date();
				const EXPIRED_AFTER = 24;
				expiredAt.setHours(expiredAt.getHours() + EXPIRED_AFTER); // Token will expire after 24 hours of generating

				const emailVerificationToken = generateToken({
					_id: newUser._id,
					email: newUser.email,
					expiredAt
				})

				const emailTemplate = await convertHtmlToHbs({
					templateName: "verify-email",
					data: {
						name: newUser.name,
						expiredAfter: EXPIRED_AFTER,
						verificationLink: `http://localhost:3000/verify-email?token=${emailVerificationToken}`
					},
				});

				sendMail({
					to: newUser.email,
					subject: "Email Verification - Verify Your Talkify Account",
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
	): Promise<ILoginResponse> => {
		return new Promise(async (resolve, reject) => {
			try {
				const user = await checkUserExists({email: userData.email});
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

				const token = jwt.sign({email: user.email}, JWT_SECRET, {
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

	emailVerification: (bodyData: { token: string }) => {
		return new Promise<boolean>(async (resolve, reject) => {
			try {
				const decodedToken = decodeToken(bodyData.token) as IEmailVerificationPayload;

				const tokenExpired = isTokenExpired(decodedToken.expiredAt)

				if (!tokenExpired) {
					// Find the user
					const user = await checkUserExists({
						email: decodedToken.email,
					})

					if (!user) {
						return reject(ERRORS.USER_NOT_FOUND);
					} else if (user.isActive) {
						return reject(ERRORS.USER_ALREADY_EXISTS);
					} else {
						user.isActive = true;

						const updatedUser = await user.save();

						const emailTemplate = await convertHtmlToHbs({
							templateName: "registration-successful",
							data: {
								name: updatedUser.name,
							},
						});

						sendMail({
							to: updatedUser.email,
							subject: "Welcome Aboard! Your Talkify Account is Ready",
							html: emailTemplate as string,
						});

						return resolve(true);
					}
				}

			} catch (error) {
				logger.error(error, "<<-- Error in email verification service");
				return reject(ERRORS.INVALID_CREDENTIALS);
			}
		})
	},

	forgotPassword: async (email: string): Promise<string> => {
		return new Promise(async (resolve, reject) => {
			try {
				const userExists = await checkUserExists({email});
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
			const user = await checkUserExists({email: data.email});
			if (!user) {
				throw ERRORS.USER_NOT_FOUND;
			}

			const hashedPassword = await bcrypt.hash(
				data.password,
				SALT_ROUNDS
			);
			await UserModel.updateOne(
				{email: data.email},
				{password: hashedPassword}
			);
			return "Password reset successfully";
		} catch (error: any) {
			throw new Error(error.message);
		}
	},
	logout: async (email: string): Promise<void> => {
		try {
			const user = await checkUserExists({email});
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
