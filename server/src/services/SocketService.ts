import { Server } from "socket.io";
import Redis from "ioredis";
import MessagesServices from "./MessagesServices";
import UserModel from "../models/UserModel";
import logger from "../../logger";
import { produceMessage } from "./kafka";

const pub = new Redis({
	host: "localhost",
	port: 6379,
});

const sub = new Redis({
	host: "localhost",
	port: 6379,
});

class SocketService {
	private _io: Server;

	constructor() {
		console.log("Init Socket Service...");
		this._io = new Server({
			cors: {
				origin: [
					"http://localhost:3000",
					"https://talkify-one.vercel.app",
				], // Allow requests from your client URL
				methods: ["GET", "POST"],
				allowedHeaders: ["Content-Type"],
				credentials: true,
			},
		});
		sub.subscribe("MESSAGES");
	}

	public initListeners() {
		const io = this.io;
		console.log("Init Socket Listeners...");

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

		io.on("connection", (socket) => {
			console.log(`New Socket Connected`, socket.id);

			MessagesServices(socket, io);
		});

		sub.on("message", async (channel, data) => {
			if (channel === "MESSAGES") {
				const parsedData: any = JSON.parse(data);
				// console.log("new message from redis", parsedData);
				produceMessage(parsedData.message);
				io.to(parsedData.data.roomId).emit(
					"message",
					parsedData.constructedMessage
				);
			}
		});
	}

	get io() {
		return this._io;
	}
}

export default SocketService;
