import logger from "../../logger";
import MessagesModel, { IMessage } from "../models/MessagesModel";
import envConfig from "../utils/envConfig";
import { ISocketUser } from "../utils/types";
import {
	GoogleGenerativeAI,
	HarmCategory,
	HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = envConfig.gemini_api_key;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
	model: "gemini-2.0-pro-exp-02-05",
});

const generationConfig = {
	temperature: 1,
	topP: 0.95,
	topK: 64,
	maxOutputTokens: 8192,
	responseMimeType: "text/plain",
};

const chatSession = model.startChat({
	generationConfig,
	history: [],
});

const MessagesServices = (socket: ISocketUser, io: any) => {
	socket.on("joinRoom", async (data) => {
		if (socket.user.name && data.roomId) {
			logger.info(`${socket.user.name} joined room: ${data.roomId}`);
			socket.join(data.room);

			// Emit a system message that the user has joined
			socket.to(data.room).emit("message", {
				_id: Math.random(),
				sender: {
					_id: envConfig.sys_user_id,
					name: envConfig.sys_name,
					email: envConfig.sys_email,
					userName: envConfig.sys_username,
				},
				message: `${socket.user.name} has joined the chat.`,
				roomId: data.roomId,
			});
		}
	});

	socket.on("sendMessage", async (data) => {
		logger.info(data, "<<-- Message received");

		if (!socket.user.name || !data.message || !data.roomId) {
			logger.error("Invalid message data received");
			return;
		}

		// Check if the message starts with "@AI" if so then call a gemini api and return a ai generated response

		if (data.message.startsWith("@AI")) {
			const result = await chatSession.sendMessage(
				data.message.split("@AI")[1]
			);
			console.log(result.response.text());
		}

		const message = new MessagesModel({
			sender: socket.user._id,
			roomId: data.roomId,
			message: data.message,
		});

		await message.save();

		const constructedMessage: Pick<
			IMessage,
			"_id" | "sender" | "roomId" | "message"
		> = {
			_id: message._id,
			sender: socket.user,
			roomId: data.roomId,
			message: data.message,
		};

		logger.info({ constructedMessage, data }, "<<-- data.room");

		io.to(data.room).emit("message", constructedMessage);
	});

	socket.on("getLastMessages", async (data) => {
		console.log(data, "<<-- getLastMessages");
		try {
			const messages = await MessagesModel.find({ roomId: data.roomId })
				.sort({ createdAt: -1 })
				.limit(data.limit || 50)
				.lean();

			const formattedMessages = messages.map((msg: any) => ({
				_id: msg._id,
				sender: msg.sender,
				roomId: msg.roomId,
				message: msg.message,
			}));

			socket.emit("lastMessages", formattedMessages.reverse());
		} catch (error) {
			logger.error("Error fetching messages: ", error);
		}
	});

	// Listen for user disconnection and send a system message
	socket.on("switchRoom", (data) => {
		if (socket.user && socket.user.name) {
			logger.info(`${socket.user.name} disconnected`);

			// Emit a system message that the user has joined
			socket.to(data.room).emit("message", {
				_id: Math.random(),
				sender: {
					_id: "67b0eccf9a0077e9102c09db",
					name: "Talkify",
					email: "noreply@talkify.com",
					userName: "talkify",
				},
				message: `${socket.user.name} has left the chat.`,
				roomId: data.roomId,
			});
		}
	});

	socket.on("disconnect", () => {
		logger.info("User disconnected");
	});
};

export default MessagesServices;
