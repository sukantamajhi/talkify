import MessagesModel, { IMessage } from "../models/MessagesModel";
import logger from "../../logger";
import { ISocketUser } from "../utils/types";

const MessagesServices = (socket: ISocketUser, io: any) => {
	socket.on("joinRoom", async (data) => {
		if (socket.user.name && data.roomId) {
			logger.info(`${socket.user.name} joined room: ${data.roomId}`);
			socket.join(data.room);
			socket.to(data.room).emit("message", {
				sender: "system",
				message: `${socket.user.name} has joined the chat.`,
				roomId: data.roomId,
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

		const constructedMessage: Pick<
			IMessage,
			"sender" | "roomId" | "message"
		> = {
			sender: socket.user.name,
			roomId: data.roomId,
			message: data.message,
		};

		io.to(data.room).emit("message", constructedMessage); // Send to everyone in the room
	});

	socket.on("disconnect", () => {
		logger.info("User disconnected");
	});
};

export default MessagesServices;
