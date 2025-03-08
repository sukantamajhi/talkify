import express from "express";
import router from "./src/routes/router";
import logger from "./logger";
import errorHandler from "./src/middleware/ErrorMiddleware";
import cors from "cors";
import connectToDb from "./src/database";
import SocketService from "./src/services/SocketService";
import { startConsumer } from "./src/services/kafka";

// TODO: https://medium.com/@amberkakkar01/getting-started-with-apache-kafka-on-docker-a-step-by-step-guide-48e71e241cf2

async function init() {
	startConsumer();
	const app = express();
	app.use(express.json());
	app.use(
		cors({
			origin: [
				"http://localhost:3000",
				"http://192.168.0.104:3000",
				"https://talkify-one.vercel.app",
			], // Allow requests from your client URL
			methods: ["GET", "POST", "PUT", "DELETE"],
			allowedHeaders: ["*"],
			credentials: true,
		})
	);

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

	const socketService = new SocketService();

	const httpServer = require("http").createServer(app);

	socketService.io.attach(httpServer);

	socketService.initListeners();

	// Start server
	httpServer.listen((process.env.PORT as string) || 5000, () => {
		logger.info("Running on port 5000");
	});
}

init();
