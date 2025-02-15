import MessagesModel, { IMessage } from "../models/MessagesModel";
import logger from "../../logger";
import { ISocketUser } from "../utils/types";

const MessagesServices = (socket: ISocketUser, io: any) => {
	socket.on("joinRoom", async (data) => {
		if (socket.user.name && data.roomId) {
			logger.info(`${socket.user.name} joined room: ${data.roomId}`);
			socket.join(data.room);

			// Emit a system message that the user has joined
			socket.to(data.room).emit("message", {
				_id: Math.random(),
				sender: {
					_id: "67b0eccf9a0077e9102c09db",
					name: "Talkify",
					email: "noreply@talkify.com",
					userName: "talkify",
				},
				message: `${socket.user.name} has joined the chat.`,
				roomId: data.roomId,
			});

			// Fetch the last 20 messages when the user joins the room
			try {
				const messages = await MessagesModel.find({
					roomId: data.roomId,
				})
					.sort({ createdAt: -1 })
					.limit(20) // Limit to last 20 messages
					.lean();

				console.log(messages, "<<-- last 20 messages");

				// Format messages to return the necessary data
				const formattedMessages = messages.map((msg) => ({
					_id: msg._id,
					sender: msg.sender,
					roomId: msg.roomId,
					message: msg.message,
				}));

				// Emit the last 20 messages to the user who just joined
				socket.emit("lastMessages", formattedMessages.reverse()); // Reverse to display from oldest to newest
			} catch (error) {
				logger.error("Error fetching last 20 messages: ", error);
			}
		}
	});

	socket.on("sendMessage", async (data) => {
		logger.info(data, "<<-- Message received");

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

		io.to(data.room).emit("message", constructedMessage);
	});

	socket.on("getLastMessages", async (data) => {
		try {
			const messages = await MessagesModel.find({ roomId: data.roomId })
				.sort({ createdAt: -1 })
				.limit(data.limit || 50)
				.lean();

			console.log(messages, "<<-- messages");
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
