import mongoose from "mongoose";
import envConfig from "../utils/envConfig";
import logger from "../../logger";

// Connection options for better performance and reliability
const mongooseOptions = {
	maxPoolSize: 20,
	minPoolSize: 5,
	socketTimeoutMS: 45000,
	connectTimeoutMS: 30000,
	serverSelectionTimeoutMS: 30000,
	heartbeatFrequencyMS: 10000,
	retryWrites: true,
	retryReads: true,
};

// Track connection state
let isConnected = false;

const connectToDb = async (): Promise<void> => {
	// If already connected, return
	if (isConnected) {
		logger.info("Using existing database connection");
		return;
	}

	try {
		// Check if MongoDB URI is defined
		if (!envConfig.mongoURI) {
			throw new Error(
				"MongoDB URI is not defined in environment variables"
			);
		}

		// Connect to MongoDB
		const connection = await mongoose.connect(
			envConfig.mongoURI,
			mongooseOptions
		);

		// Set up connection event handlers
		mongoose.connection.on("error", (err) => {
			logger.error("MongoDB connection error:", err);
			isConnected = false;
		});

		mongoose.connection.on("disconnected", () => {
			logger.warn("MongoDB disconnected, attempting to reconnect...");
			isConnected = false;
		});

		mongoose.connection.on("reconnected", () => {
			logger.info("MongoDB reconnected successfully");
			isConnected = true;
		});

		// Set connected flag
		isConnected = true;

		logger.info(
			`Database connected successfully: ${connection.connection.host}`
		);

		// Log DB stats
		const { host, port, name } = connection.connection;
		logger.info(`Connected to MongoDB at ${host}:${port}/${name}`);
	} catch (err) {
		logger.error("Error connecting to database:", err);
		// Exit process on connection failure in production
		if (envConfig.NODE_ENV === "production") {
			logger.fatal(
				"Database connection failed in production environment, exiting..."
			);
			process.exit(1);
		}

		// Retry connection after delay in development
		setTimeout(() => {
			logger.info("Retrying database connection...");
			connectToDb();
		}, 5000);
	}
};

export default connectToDb;
