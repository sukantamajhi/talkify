import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
	name: string;
	description?: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const RoomSchema: Schema = new Schema(
	{
		name: { type: String, required: true, unique: true },
		description: { type: String },
		isActive: { type: Boolean, default: true },
	},
	{
		timestamps: true,
	}
);

export default mongoose.model<IRoom>("rooms", RoomSchema);
