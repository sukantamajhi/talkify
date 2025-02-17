import RoomModel from "../models/RoomModel";
import { SessionDocument, SessionModel } from "../models/SessionModel";
import UserModel from "../models/UserModel";
import { IClerkUser } from "../utils/types";

export default {
	createUserFromClerk: async (userData: IClerkUser) => {
		const user = await UserModel.create(userData);

		await RoomModel.create({
			name: user.username,
		});
	},

	createUserSession: async (sessionData: SessionDocument) => {
		const session = await SessionModel.create(sessionData);

		await UserModel.findOneAndUpdate(
			{
				id: session.user_id,
			},
			{
				session: session._id,
			},
			{ new: true }
		);
	},
};
