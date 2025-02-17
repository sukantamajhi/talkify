import { Request } from "express";
import { IUser } from "../models/UserModel";
import { Socket } from "socket.io";

// Extend the Request interface to include a user property
export interface IRequest extends Request {
	user?: IUser;
}

export type IUserWithOneFieldRequired =
	| { email: string; username?: never }
	| { username: string; email?: never };

export interface ISocketUser extends Socket {
	user: IUser;
}

export interface IEmailAddress {
	created_at: number;
	email_address: string;
	id: string;
	linked_to: any[]; // Change type if there is more specific info
	matches_sso_connection: boolean;
	object: string;
	reserved: boolean;
	updated_at: number;
	verification: any; // Define more detailed type if needed
}

export interface IClerkUser {
	backup_code_enabled: boolean;
	banned: boolean;
	create_organization_enabled: boolean;
	created_at: number;
	delete_self_enabled: boolean;
	email_addresses: IEmailAddress[];
	enterprise_accounts: any[]; // Adjust type if needed
	external_accounts: any[]; // Adjust type if needed
	external_id: string | null;
	first_name: string;
	has_image: boolean;
	id: string;
	image_url: string;
	last_active_at: number;
	last_name: string;
	last_sign_in_at: number | null;
	legal_accepted_at: number | null;
	locked: boolean;
	lockout_expires_in_seconds: number | null;
	mfa_disabled_at: number | null;
	mfa_enabled_at: number | null;
	object: string;
	passkeys: any[]; // Adjust type if needed
	password_enabled: boolean;
	phone_numbers: any[]; // Adjust type if needed
	primary_email_address_id: string;
	primary_phone_number_id: string | null;
	primary_web3_wallet_id: string | null;
	private_metadata: Record<string, unknown>;
	profile_image_url: string;
	public_metadata: Record<string, unknown>;
	saml_accounts: any[]; // Adjust type if needed
	totp_enabled: boolean;
	two_factor_enabled: boolean;
	unsafe_metadata: Record<string, unknown>;
	updated_at: number;
	username: string;
	verification_attempts_remaining: number;
	web3_wallets: any[]; // Adjust type if needed
}
