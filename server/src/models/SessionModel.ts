import mongoose, { Document, Schema } from "mongoose";

// Interface for the Session Document
interface SessionDocument extends Document {
	id: string;
	client_id: string;
	status: "active" | "removed";
	abandon_at: number | null;
	expire_at: number;
	created_at: number;
	last_active_at: number;
	updated_at: number;
	user_id: string;
	actor: any; // Adjust type based on your actual data
	event_attributes?: {
		http_request?: {
			client_ip?: string;
			user_agent?: string;
		};
	};
}

// Session Schema
const sessionSchema = new Schema<SessionDocument>({
	id: { type: String, required: true },
	client_id: { type: String, required: true },
	status: {
		type: String,
		enum: ["active", "removed"],
		required: true,
	},
	abandon_at: { type: Number, default: null },
	expire_at: { type: Number, required: true },
	created_at: { type: Number, required: true },
	last_active_at: { type: Number, required: true },
	updated_at: { type: Number, required: true },
	user_id: { type: String, required: true },
	actor: { type: Schema.Types.Mixed, default: null },
	event_attributes: {
		http_request: {
			client_ip: { type: String },
			user_agent: { type: String },
		},
	},
});

// Create the Session model
const SessionModel = mongoose.model<SessionDocument>("sessions", sessionSchema);

export { SessionModel, SessionDocument };
