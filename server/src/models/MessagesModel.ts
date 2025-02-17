import mongoose, { Schema, Document } from "mongoose";
import { IClerkUser } from "../utils/types";
import { basicProfileProjection } from "../utils/Projections/UserProjection";

export interface IMessage extends Document {
	_id: string;
	sender: IClerkUser;
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

MessageSchema.pre("find", function (next) {
	this.populate("sender", basicProfileProjection);
	next();
});

MessageSchema.pre("findOne", function (next) {
	this.populate("sender", basicProfileProjection);
	next();
});

export default mongoose.model<IMessage>("messages", MessageSchema);
