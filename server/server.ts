import express from "express";
import mongoose from "mongoose";
import router from "./src/routes/router";
import logger from "./logger";
import errorHandler from "./src/middleware/ErrorMiddleware";
import cors from "cors";
import MessagesServices from "./src/services/MessagesServices";
import UserModel from "./src/models/UserModel";
import connectToDb from "./src/database";

async function init() {
	const app = express();
	app.use(express.json());
	app.use(cors());

	const server = require("http").createServer(app);
	const io = require("socket.io")(server, {
		cors: {
			origin: [
				"http://localhost:3000",
				"https://talkify-kappa.vercel.app",
			], // Allow requests from your client URL
			methods: ["GET", "POST"],
			allowedHeaders: ["Content-Type"],
			credentials: true,
		},
	});

	// Connect to mongodb
	await connectToDb();

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
		const token =
			(socket.handshake.auth.token as string) ||
			(socket.handshake.headers.token as string);

		if (!token) {
			logger.error("❌ Authentication failed");
			next(new Error("Authentication error"));
		} else {
			const user = await UserModel.findOne(
				{
					loginToken: token,
					isActive: true,
				},
				{ _id: 1, name: 1 }
			);
			if (!user) {
				logger.error("❌ Authentication failed");
				next(new Error("Authentication error"));
			} else {
				logger.info("✅ Authentication successful");

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

	// Start server
	server.listen((process.env.PORT as string) || 5000, () => {
		logger.info("Running on port 5000");
	});
}

init();
