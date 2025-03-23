import express, { Request, Response, NextFunction } from "express";
import http from "http";
import router from "./src/routes/router";
import logger from "./logger";
import errorHandler from "./src/middleware/ErrorMiddleware";
import cors from "cors";
import connectToDb from "./src/database";
import SocketService from "./src/services/SocketService";
import { startConsumer, disconnectKafka } from "./src/services/kafka";
import envConfig from "./src/utils/envConfig";
import compression from "compression";
import helmet from "helmet";
import mongoose from "mongoose";

// TODO: https://medium.com/@amberkakkar01/getting-started-with-apache-kafka-on-docker-a-step-by-step-guide-48e71e241cf2

// Create Express app
const app = express();
let server: http.Server;
let socketService: SocketService;
let isShuttingDown = false;

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
	// Prevent multiple shutdown attempts
	if (isShuttingDown) {
		logger.info("Shutdown already in progress...");
		return;
	}

	isShuttingDown = true;
	logger.info(`${signal} received. Starting graceful shutdown...`);

	// Close HTTP server with a timeout
	if (server) {
		logger.info("Closing HTTP server...");
		const httpServerClosed = new Promise<void>((resolve) => {
			server.close(() => {
				logger.info("HTTP server closed.");
				resolve();
			});

			// Force close after timeout
			setTimeout(() => {
				logger.warn("HTTP server close timed out, forcing...");
				resolve();
			}, 5000);
		});

		await httpServerClosed;
	}

	// Disconnect socket connections
	if (socketService) {
		logger.info("Closing socket connections...");
		const socketsClosed = new Promise<void>((resolve) => {
			socketService.io.close(() => {
				logger.info("Socket connections closed.");
				resolve();
			});

			// Force close after timeout
			setTimeout(() => {
				logger.warn("Socket close timed out, forcing...");
				resolve();
			}, 5000);
		});

		await socketsClosed;
	}

	// Disconnect Kafka clients
	try {
		await disconnectKafka();
	} catch (error) {
		logger.error("Error disconnecting Kafka:", error);
	}

	// Disconnect from MongoDB
	try {
		logger.info("Disconnecting from MongoDB...");
		await mongoose.disconnect();
		logger.info("MongoDB disconnected.");
	} catch (error) {
		logger.error("Error disconnecting from MongoDB:", error);
	}

	// Exit process
	logger.info("Exiting process...");
	process.exit(0);
};

// Initialize the application
async function init() {
	try {
		logger.info("Starting Talkify server...");

		// Apply middleware
		app.use(express.json({ limit: "10mb" }));
		app.use(express.urlencoded({ extended: true, limit: "10mb" }));

		// Add security headers
		app.use(
			helmet({
				contentSecurityPolicy: false, // Disable CSP for now
			})
		);

		// Compress responses
		app.use(compression());

		// Configure CORS
		const allowedOrigins = envConfig.ALLOWED_ORIGINS
			? envConfig.ALLOWED_ORIGINS.split(",")
			: [
					"http://localhost:3000",
					"http://192.168.0.104:3000",
					"https://talkify-one.vercel.app",
			  ];

		app.use(
			cors({
				origin: allowedOrigins,
				methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
				allowedHeaders: ["Content-Type", "Authorization", "token"],
				credentials: true,
				maxAge: 86400, // 24 hours
			})
		);

		// Connect to MongoDB
		await connectToDb();

		// Start Kafka consumer
		startConsumer();

		// Home route
		app.get("/", (req: Request, res: Response) => {
			res.json({
				status: "success",
				message: "Talkify API is running",
				version: "1.0.0",
				environment: envConfig.NODE_ENV,
			});
		});

		// Health check endpoint
		app.get("/health", (req: Request, res: Response) => {
			const healthcheck: any = {
				uptime: process.uptime(),
				message: "OK",
				timestamp: new Date().toISOString(),
			};
			try {
				res.send(healthcheck);
			} catch (error) {
				healthcheck.message = error;
				res.status(503).send();
			}
		});

		// API routes
		app.use("/api", router);

		// Error handler middleware
		app.use(errorHandler);

		// 404 handler
		app.use((req: Request, res: Response) => {
			res.status(404).json({
				status: "error",
				message: `Route ${req.originalUrl} not found`,
			});
		});

		// Initialize Socket.IO service
		socketService = new SocketService();

		// Create HTTP server
		server = http.createServer(app);

		// Attach Socket.IO to HTTP server
		socketService.io.attach(server);

		// Initialize Socket.IO listeners
		socketService.initListeners();

		// Start HTTP server
		const PORT = envConfig.port || 5000;
		server.listen(PORT, () => {
			logger.info(
				`Server running on port ${PORT} in ${envConfig.NODE_ENV} mode`
			);
		});

		// Handle server errors
		server.on("error", (error: NodeJS.ErrnoException) => {
			if (error.code === "EADDRINUSE") {
				logger.error(`Port ${PORT} is already in use`);
			} else {
				logger.error("Server error:", error);
			}
			process.exit(1);
		});

		// Set up graceful shutdown
		process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
		process.on("SIGINT", () => gracefulShutdown("SIGINT"));

		// Handle uncaught exceptions and rejections
		process.on("uncaughtException", (error) => {
			logger.error("Uncaught Exception:", error);
			gracefulShutdown("uncaughtException");
		});

		process.on("unhandledRejection", (reason, promise) => {
			logger.error("Unhandled Rejection at:", promise, "reason:", reason);
		});
	} catch (error) {
		logger.error("Failed to start server:", error);
		process.exit(1);
	}
}

// Start the application
init();

process.on("SIGINT", () => {
	logger.info("SIGINT received. Starting graceful shutdown...");
	gracefulShutdown("SIGINT");
});

process.on("SIGTERM", () => {
	logger.info("SIGTERM received. Starting graceful shutdown...");
	gracefulShutdown("SIGTERM");
});
