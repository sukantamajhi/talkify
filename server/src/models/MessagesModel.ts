import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
	sender: string;
	roomId: string;
	message: string;
}

const MessageSchema: Schema = new Schema(
	{
		sender: { type: Schema.Types.ObjectId, required: true, ref: "users" },
		roomId: { type: Schema.Types.ObjectId, required: true, ref: "rooms" },
		message: { type: String, required: true },
	},
	{
		timestamps: true,
	}
);

export default mongoose.model<IMessage>("messages", MessageSchema);
