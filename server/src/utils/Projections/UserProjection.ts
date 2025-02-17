export const basicProfileProjection = {
	id: 1,
	first_name: 1,
	last_name: 1,
	username: 1,
	profile_image_url: 1,
	image_url: 1,
	email_addresses: { email_address: 1, created_at: 1 }, // Only show email and creation date
};
export const fullProfileProjection = {
	id: 1,
	first_name: 1,
	last_name: 1,
	username: 1,
	profile_image_url: 1,
	image_url: 1,
	email_addresses: { email_address: 1, created_at: 1, verification: 1 },
	private_metadata: 1,
	public_metadata: 1,
};
export const adminProjection = {
	id: 1,
	first_name: 1,
	last_name: 1,
	email_addresses: 1,
	phone_numbers: 1,
	created_at: 1,
	updated_at: 1,
	legal_accepted_at: 1,
	banned: 1,
	locked: 1,
	totp_enabled: 1,
	two_factor_enabled: 1,
	passkeys: 1,
};
