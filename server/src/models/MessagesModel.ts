import mongoose, { Schema, Document } from "mongoose";
import { UserProjection } from "../utils/Projections/UserProjection";
import { IUser } from "./UserModel";

export interface IMessage {
	_id: string;
	sender: Pick<IUser, "_id" | "name">;
	roomId: string;
	message: string;
	createdAt: string;
	updatedAt: string;
}

const MessageSchema: Schema = new Schema({
	sender: { type: Schema.Types.ObjectId, required: true, ref: "users" },
	roomId: { type: Schema.Types.ObjectId, required: true, ref: "rooms" },
	message: { type: String, required: true },
	createdAt: { type: String, default: new Date().toISOString() },
	updatedAt: { type: String, default: new Date().toISOString() },
});

MessageSchema.pre("find", function (next) {
	this.populate("sender");
	next();
});

MessageSchema.pre("findOne", function (next) {
	this.populate("sender");
	next();
});

export default mongoose.model<IMessage>("messages", MessageSchema);
