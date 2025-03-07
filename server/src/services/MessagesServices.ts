import Redis from "ioredis";
import logger from "../../logger";
import MessagesModel, { IMessage } from "../models/MessagesModel";
import { IUser } from "../models/UserModel";
import envConfig from "../utils/envConfig";
import { ISocketUser } from "../utils/types";
import { v7 as uuidv7 } from "uuid";

const pub = new Redis({
	host: "localhost",
	port: 6379,
});

// Utility function to emit a system message
const emitSystemMessage = (socket: any, roomId: string, message: string) => {
	socket.to(roomId).emit("message", {
		_id: Math.random(),
		sender: {
			_id: envConfig.sys_user_id,
			name: envConfig.sys_name,
			email: envConfig.sys_email,
			userName: envConfig.sys_username,
		},
		message,
		roomId,
	});
};

const MessagesServices = (socket: ISocketUser, io: any) => {
	const socketUser: IUser = socket.user as IUser;

	socket.on("room::join", async (data) => {
		try {
			if (socketUser.name && data.roomId) {
				logger.info(`${socketUser.name} joined room: ${data.roomId}`);
				socket.join(data.roomId);

				// Emit system message
				emitSystemMessage(
					socket,
					data.roomId,
					`${socketUser.name} has joined the chat.`
				);
			}
		} catch (error) {
			logger.error(error, "Error handling 'room::join':");
		}
	});

	socket.on("room::exit", async (data) => {
		try {
			logger.info(`${socketUser.name} left room: ${data.roomId}`);
			socket.leave(data.roomId);
		} catch (error) {
			logger.error(error, "Error handling 'room::exit':");
		}
	});

	socket.on("message::send", async (data) => {
		try {
			logger.info(data, "<<-- Message received");

			if (!socketUser.name || !data.message || !data.roomId) {
				logger.error("Invalid message data received");
				return;
			}

			const message = {
				sender: socketUser._id,
				roomId: data.roomId,
				message: data.message,
			};

			// await message.save();

			const constructedMessage: Pick<
				IMessage,
				"_id" | "sender" | "roomId" | "message"
			> = {
				_id: uuidv7(),
				sender: socketUser,
				roomId: data.roomId,
				message: data.message,
			};

			logger.info({ constructedMessage, data }, "<<-- data.room");

			await pub.publish(
				"MESSAGES",
				JSON.stringify({ data, constructedMessage, message })
			);

			// io.to(data.roomId).emit("message", constructedMessage);
		} catch (error) {
			logger.error("Error handling 'message::send':", error);
		}
	});

	socket.on("getLastMessages", async (data) => {
		try {
			logger.info(data, "<<-- getLastMessages");

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
			logger.error("Error fetching messages:", error);
		}
	});

	socket.on("room::switch", (data) => {
		try {
			if (socketUser && socketUser.name) {
				logger.info(`${socketUser.name} switched rooms`);

				// Emit a system message that the user has left the room
				emitSystemMessage(
					socket,
					data.roomId,
					`${socketUser.name} has left the chat.`
				);
			}
		} catch (error) {
			logger.error("Error handling 'room::switch':", error);
		}
	});

	socket.on("disconnect", () => {
		try {
			logger.info("User disconnected");
		} catch (error) {
			logger.error(error, "Error handling 'disconnect':");
		}
	});
};

export default MessagesServices;
