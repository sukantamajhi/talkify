import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
	name: string;
	description: string;
	messages: Schema.Types.ObjectId[];
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const RoomSchema: Schema = new Schema(
	{
		name: { type: String, required: true },
		description: { type: String, required: true },
		messages: [{ type: Schema.Types.ObjectId, ref: "messages" }],
		isActive: { type: Boolean, default: true },
	},
	{
		timestamps: true,
	}
);

RoomSchema.pre("find", function (next) {
	this.populate("messages");
	next();
});
RoomSchema.pre("findOne", function (next) {
	this.populate("messages");
	next();
});

export default mongoose.model<IRoom>("rooms", RoomSchema);
