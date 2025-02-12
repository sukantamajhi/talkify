import express from "express";
import mongoose from "mongoose";
import router from "./src/routes/router";
import envConfig from "./src/utils/envConfig";
import logger from "./logger";
import errorHandler from "./src/middleware/ErrorMiddleware";
import cors from "cors";
import MessagesServices from "./src/services/MessagesServices";

const app = express();

const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.json());
app.use(cors());

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

// Socket.io
io.on("connection", (socket: any) => {
	MessagesServices(socket, io);
});

// Start server
server.listen((process.env.PORT as string) || 5000, () => {
	logger.info("Running on port 5000");
});
