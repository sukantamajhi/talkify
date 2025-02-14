import MessagesModel from "../models/MessagesModel";
import logger from "../../logger";
import { ISocketUser } from "../utils/types";

const MessagesServices = (socket: ISocketUser, io: any) => {
	socket.on("joinRoom", async (data) => {
		if (socket.user.name && data.room) {
			logger.info(`${socket.user.name} joined room: ${data.room}`);
			socket.join(data.room);
			socket.to(data.room).emit("message", {
				sender: "system",
				content: `${socket.user.name} has joined the chat.`,
			});
		}
	});

	socket.on("sendMessage", async (data) => {
		logger.info(data, "<<-- Message received");

		const message = new MessagesModel({
			sender: socket.user._id,
			roomId: data.roomId,
			message: data.message,
		});

		const newMessage = await message.save();
		io.to(data.room).emit("message", newMessage); // Send to everyone in the room
	});

	socket.on("disconnect", () => {
		logger.info("User disconnected");
	});
};

export default MessagesServices;
