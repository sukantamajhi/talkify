import dotenv from "dotenv";

dotenv.config();

export default {
	log_level: (process.env.LOG_LEVEL as string) || "info",
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
	// Gemini information
	gemini_api_key: process.env.GEMINI_API_KEY as string,
	// Kafka information
	KAFKA_HOST: process.env.KAFKA_HOST as string,
	KAFKA_PORT: process.env.KAFKA_PORT as string,
	KAFKA_TOPIC: process.env.KAFKA_TOPIC as string,
	KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID as string,
	KAFKA_USERNAME: process.env.KAFKA_USERNAME as string,
	KAFKA_PASSWORD: process.env.KAFKA_PASSWORD as string,
	KAFKA_CA_FILE_PATH: process.env.KAFKA_CA_FILE_PATH as string,
	KAFKA_MECHANISM: process.env.KAFKA_MECHANISM as string,
	// Redis information
	REDIS_HOST: (process.env.REDIS_HOST as string) || "localhost",
	REDIS_PORT: (process.env.REDIS_PORT as string) || "6379",
	REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
	// CORS settings
	ALLOWED_ORIGINS:
		(process.env.ALLOWED_ORIGINS as string) ||
		"http://localhost:3000,https://talkify-one.vercel.app",
	// App settings
	NODE_ENV: (process.env.NODE_ENV as string) || "development",
	APP_URL: (process.env.APP_URL as string) || "http://localhost:5000",
};
