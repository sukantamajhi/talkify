import express from "express";
import mongoose from "mongoose";
import router from "./src/routes/router";
import envConfig from "./src/utils/envConfig";
import logger from "./logger";
import errorHandler from "./src/middleware/ErrorMiddleware";
import cors from "cors";
import MessagesServices from "./src/services/MessagesServices";
import UserModel from "./src/models/UserModel";
import ClerkService from "./src/services/ClerkService";
import { SessionModel } from "./src/models/SessionModel";
import { basicProfileProjection } from "./src/utils/Projections/UserProjection";

const app = express();

app.use(express.json());
app.use(cors());

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
	cors: {
		origin: ["http://localhost:3000", "https://talkify-kappa.vercel.app"], // Allow requests from your client URL
		methods: ["GET", "POST"],
		allowedHeaders: ["Content-Type"],
		credentials: true,
	},
});

// Connect to mongodb
mongoose
	.connect(envConfig.mongoURI as string)
	.then(() => {
		logger.info("Database connected successfully");
	})
	.catch((err) => {
		logger.error(err, "<<-- Error in connecting with database");
	});

// Home route
app.get("/", (req, res) => {
	res.send("Hello world from server");
});

// Routes
app.use("/api", router);

// Error handler middleware
app.use(errorHandler);

// Middleware to authenticate the socket connection
io.use(async (socket: any, next: Function) => {
	console.log(socket.handshake, "<<-- socket.handshake");
	const sessionId =
		(socket.handshake.auth.sessionId as string) ||
		(socket.handshake.headers.sessionId as string);

	if (!sessionId) {
		logger.error("❌ Authentication failed");
		next(new Error("Authentication error"));
	} else {
		const session = await SessionModel.findOne({
			id: socket.handshake.auth.sessionId,
			status: "active",
		});
		if (!session) {
			logger.error("❌ Authentication failed");
			next(new Error("Authentication error"));
		} else {
			logger.info("✅ Authentication successful");

			const user = await UserModel.findOne(
				{ id: session.user_id },
				basicProfileProjection
			);

			socket.user = user; // Attach user details to socket

			next(); // Allow connection
		}
	}
});

// Socket.io
io.on("connection", (socket: any) => {
	logger.info(socket.id, "<<-- User connected");
	MessagesServices(socket, io);
});

// Webhook endpoint to receive Clerk events
app.post("/webhooks/clerk", (req, res) => {
	const event = req.body;

	// Log the event data
	// console.log("Received Clerk webhook event:", event);

	// Handle specific event (e.g., user created)
	if (event.type === "user.created") {
		// Process user creation event
		// console.log("New user created:", event.data);
		ClerkService.createUserFromClerk(event.data);
	}

	if (event.type === "session.created") {
		// Process session creation event
		// console.log("New session created:", event.data);
		ClerkService.createUserSession(event.data);
	}

	// Send a 200 response to acknowledge receipt of the event
	res.status(200).send("Webhook received");
});

// Start server
server.listen((process.env.PORT as string) || 5000, () => {
	logger.info("Running on port 5000");
});
