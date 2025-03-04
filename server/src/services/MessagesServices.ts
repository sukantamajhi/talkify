import logger from "../../logger";
import MessagesModel, { IMessage } from "../models/MessagesModel";
import envConfig from "../utils/envConfig";
import { ISocketUser } from "../utils/types";

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
  socket.on("joinRoom", async (data) => {
    try {
      if (socket.user.name && data.roomId) {
        logger.info(`${socket.user.name} joined room: ${data.roomId}`);
        socket.join(data.roomId);

        // Emit system message
        emitSystemMessage(socket, data.roomId, `${socket.user.name} has joined the chat.`);
      }
    } catch (error) {
      logger.error("Error handling 'joinRoom':", error);
    }
  });

  socket.on("sendMessage", async (data) => {
    try {
      logger.info(data, "<<-- Message received");

      if (!socket.user.name || !data.message || !data.roomId) {
        logger.error("Invalid message data received");
        return;
      }

      const message = new MessagesModel({
        sender: socket.user._id,
        roomId: data.roomId,
        message: data.message,
      });

      await message.save();

      const constructedMessage: Pick<IMessage, "_id" | "sender" | "roomId" | "message"> = {
        _id: message._id,
        sender: socket.user,
        roomId: data.roomId,
        message: data.message,
      };

      logger.info({ constructedMessage, data }, "<<-- data.room");

      io.to(data.roomId).emit("message", constructedMessage);
    } catch (error) {
      logger.error("Error handling 'sendMessage':", error);
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

  socket.on("switchRoom", (data) => {
    try {
      if (socket.user && socket.user.name) {
        logger.info(`${socket.user.name} switched rooms`);

        // Emit a system message that the user has left the room
        emitSystemMessage(socket, data.roomId, `${socket.user.name} has left the chat.`);
      }
    } catch (error) {
      logger.error("Error handling 'switchRoom':", error);
    }
  });

  socket.on("disconnect", () => {
    try {
      logger.info("User disconnected");
    } catch (error) {
      logger.error("Error handling 'disconnect':", error);
    }
  });
};

export default MessagesServices;
