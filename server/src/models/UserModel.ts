import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
	name: string;
	email: string;
	isActive?: boolean;
	isDeleted?: boolean;
	deletedAt?: Date | null;
	password: string;
	profilePicture?: string;
	lastLogin?: Date | null;
	loginToken?: string | null;
	createdAt?: Date;
	updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
	{
		name: { type: String, required: true, trim: true },
		email: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			match: [/.+\@.+\..+/, "Please fill a valid email address"],
		},
		password: { type: String, required: true, minlength: 6 },
		profilePicture: { type: String, default: "" },
		lastLogin: { type: Date, default: null },
		loginToken: { type: String, default: null, unique: true },
		isActive: {
			type: Boolean,
			default: true,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		deletedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model<IUser>("users", UserSchema);
