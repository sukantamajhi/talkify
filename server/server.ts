import express from "express";
import mongoose from "mongoose";
import router from "./src/routes/router";
import envConfig from "./src/utils/envConfig";
import logger from "./logger";
import errorHandler from "./src/middleware/ErrorMiddleware";
import cors from "cors";
import MessagesServices from "./src/services/MessagesServices";
import UserModel from "./src/models/UserModel";

const app = express();

app.use(express.json());
app.use(cors());

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
	cors: {
		origin: "http://localhost:3000", // Allow requests from your client URL
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
	const token =
		(socket.handshake.auth.token as string) ||
		(socket.handshake.headers.token as string);

	console.log(socket.handshake.headers.token, "<<-- token");

	if (!token) {
		console.log("❌ Authentication failed");
		next(new Error("Authentication error"));
	} else {
		const user = await UserModel.findOne({
			loginToken: token,
			isActive: true,
		});
		console.log(user, "<<--- user");
		if (!user) {
			console.log("❌ Authentication failed");
			next(new Error("Authentication error"));
		} else {
			console.log("✅ Authentication successful");
			next(); // Allow connection
		}
	}
});

// Socket.io
io.on("connection", (socket: any) => {
	console.log("User connected:", socket.id);
	MessagesServices(socket, io);
});

// Start server
server.listen((process.env.PORT as string) || 5000, () => {
	logger.info("Running on port 5000");
});
