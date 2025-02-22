import dotenv from 'dotenv';

dotenv.config();

export default {
	log_level: (process.env.LOG_LEVEL as string) || 'info',
	port: (process.env.PORT as string) || 5000,
	mongoURI: process.env.MONGO_URI as string,
	jwtSecret: process.env.JWT_SECRET as string,
	from_name: process.env.FROM_NAME as string,
	email_host: process.env.EMAIL_HOST as string,
	email_user: process.env.EMAIL_USER as string,
	email_pass: process.env.EMAIL_PASS as string,
	// system_information
	sys_user_id: process.env.SYSTEM_USER_ID as string,
	sys_name: process.env.SYSTEM_NAME as string,
	sys_email: process.env.SYSTEM_EMAIL as string,
	sys_username: process.env.SYSTEM_USERNAME as string,
};
