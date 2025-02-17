import mongoose from "mongoose";
const { Schema } = mongoose;

// Sub-schema for EmailAddress
const emailAddressSchema = new Schema({
	created_at: { type: Number, required: true },
	email_address: { type: String, required: true, unique: true },
	id: { type: String, required: true },
	linked_to: [{ type: Schema.Types.Mixed }], // Adjust type as needed
	matches_sso_connection: { type: Boolean, required: true },
	object: { type: String, required: true },
	reserved: { type: Boolean, required: true },
	updated_at: { type: Number, required: true },
	verification: { type: Schema.Types.Mixed }, // Adjust type as needed
});

// Main User Schema
const userSchema = new Schema({
	backup_code_enabled: { type: Boolean, required: true },
	banned: { type: Boolean, required: true },
	create_organization_enabled: { type: Boolean, required: true },
	created_at: { type: Number, required: true },
	delete_self_enabled: { type: Boolean, required: true },
	email_addresses: [emailAddressSchema],
	sessions: [{ type: Schema.Types.ObjectId, ref: "sessions" }], // Reference to sessions
	enterprise_accounts: [{ type: Schema.Types.Mixed }], // Adjust type as needed
	external_accounts: [{ type: Schema.Types.Mixed }], // Adjust type as needed
	external_id: { type: String, default: null },
	first_name: { type: String, required: true },
	has_image: { type: Boolean, required: true },
	id: { type: String, required: true, unique: true },
	image_url: { type: String, required: true },
	last_active_at: { type: Number, required: true },
	last_name: { type: String, required: true },
	last_sign_in_at: { type: Number, default: null },
	legal_accepted_at: { type: Number, default: null },
	locked: { type: Boolean, required: true },
	lockout_expires_in_seconds: { type: Number, default: null },
	mfa_disabled_at: { type: Number, default: null },
	mfa_enabled_at: { type: Number, default: null },
	object: { type: String, required: true },
	passkeys: [{ type: Schema.Types.Mixed }], // Adjust type as needed
	password_enabled: { type: Boolean, required: true },
	phone_numbers: [{ type: Schema.Types.Mixed }], // Adjust type as needed
	primary_email_address_id: { type: String, required: true },
	primary_phone_number_id: { type: String, default: null },
	primary_web3_wallet_id: { type: String, default: null },
	private_metadata: { type: Schema.Types.Mixed, default: {} },
	profile_image_url: { type: String, required: true },
	public_metadata: { type: Schema.Types.Mixed, default: {} },
	saml_accounts: [{ type: Schema.Types.Mixed }], // Adjust type as needed
	totp_enabled: { type: Boolean, required: true },
	two_factor_enabled: { type: Boolean, required: true },
	unsafe_metadata: { type: Schema.Types.Mixed, default: {} },
	updated_at: { type: Number, required: true },
	username: { type: String, required: true },
	verification_attempts_remaining: { type: Number, required: true },
	web3_wallets: [{ type: Schema.Types.Mixed }], // Adjust type as needed
});

export default mongoose.model("users", userSchema);
