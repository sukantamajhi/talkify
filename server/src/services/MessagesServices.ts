import Redis from "ioredis";
import logger from "../../logger";
import MessagesModel, { IMessage } from "../models/MessagesModel";
import { IUser } from "../models/UserModel";
import envConfig from "../utils/envConfig";
import { ISocketUser } from "../utils/types";
import { v7 as uuidv7 } from "uuid";

// Create Redis client with connection options
const redisOptions = {
	host: envConfig.REDIS_HOST || "localhost",
	port: parseInt(envConfig.REDIS_PORT || "6379"),
	password: envConfig.REDIS_PASSWORD,
	retryStrategy: (times: number) => {
		const delay = Math.min(times * 50, 2000);
		logger.info(`Redis reconnecting in ${delay}ms...`);
		return delay;
	},
};

const pub = new Redis(redisOptions);

// Handle Redis connection events
pub.on("error", (err) => logger.error("Redis Publisher Error:", err));
pub.on("connect", () => logger.info("Redis Publisher Connected"));

// Cache for recent messages to prevent duplicates
const messageCache = new Set<string>();
const MESSAGE_CACHE_MAX_SIZE = 1000;
const MESSAGE_CACHE_TTL = 60 * 1000; // 1 minute

// Utility function to emit a system message
const emitSystemMessage = async (
	socket: ISocketUser,
	roomId: string,
	message: string
): Promise<void> => {
	try {
		const systemMessage = {
			_id: uuidv7(),
			sender: {
				_id: envConfig.sys_user_id,
				name: envConfig.sys_name,
				email: envConfig.sys_email,
				userName: envConfig.sys_username,
			},
			message,
			roomId,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		// Broadcast to room
		socket.to(roomId).emit("message", systemMessage);
	} catch (error) {
		logger.error("Error sending system message:", error);
	}
};

// Add message to cache with TTL
const addToMessageCache = (messageId: string): void => {
	messageCache.add(messageId);

	// Remove from cache after TTL
	setTimeout(() => {
		messageCache.delete(messageId);
	}, MESSAGE_CACHE_TTL);

	// Trim cache if it gets too large
	if (messageCache.size > MESSAGE_CACHE_MAX_SIZE) {
		const iterator = messageCache.values();
		const firstValue = iterator.next().value;
		if (firstValue) {
			messageCache.delete(firstValue);
		}
	}
};

const MessagesServices = (socket: ISocketUser, io: any): void => {
	const socketUser: IUser = socket.user as IUser;

	// Handle room join
	socket.on(
		"room::join",
		async (data: { roomId: string; username?: string }) => {
			try {
				if (!socketUser?._id || !data?.roomId) {
					logger.warn("Invalid room join data:", {
						user: socketUser?.name,
						data,
					});
					return;
				}

				logger.info(`${socketUser.name} joined room: ${data.roomId}`);

				// Join the socket room
				socket.join(data.roomId);

				// Emit system message
				await emitSystemMessage(
					socket,
					data.roomId,
					`${socketUser.name} has joined the chat.`
				);
			} catch (error) {
				logger.error("Error handling 'room::join':", error);
				socket.emit("message_error", {
					error: "Failed to join room. Please try again.",
				});
			}
		}
	);

	// Handle room leave
	socket.on(
		"room::leave",
		async (data: { roomId: string; username?: string }) => {
			try {
				if (!socketUser?._id || !data?.roomId) {
					logger.warn("Invalid room leave data:", {
						user: socketUser?.name,
						data,
					});
					return;
				}

				logger.info(`${socketUser.name} left room: ${data.roomId}`);

				// Leave the socket room
				socket.leave(data.roomId);

				// Emit system message
				await emitSystemMessage(
					socket,
					data.roomId,
					`${socketUser.name} has left the chat.`
				);
			} catch (error) {
				logger.error("Error handling 'room::leave':", error);
			}
		}
	);

	// Handle message send
	socket.on(
		"message::send",
		async (data: { message: string; roomId: string }) => {
			try {
				if (!socketUser?._id || !data?.message || !data?.roomId) {
					logger.warn("Invalid message data:", {
						user: socketUser?.name,
						data,
					});
					socket.emit("message_error", {
						error: "Invalid message data",
					});
					return;
				}

				logger.info("Message received from:", socketUser.name);

				// Generate a unique ID for the message
				const messageId = uuidv7();

				// Check if this is a duplicate message (could happen due to client retries)
				if (messageCache.has(messageId)) {
					logger.warn("Duplicate message detected, ignoring");
					return;
				}

				// Add to cache to prevent duplicates
				addToMessageCache(messageId);

				// Create message object for database
				const message = {
					sender: socketUser._id,
					roomId: data.roomId,
					message: data.message,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};

				// Create message object for clients
				const constructedMessage: IMessage = {
					_id: messageId,
					sender: socketUser,
					roomId: data.roomId,
					message: data.message,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};

				logger.info({ message, constructedMessage }, "<<-- messages");

				try {
					// Publish to Redis for distribution
					await pub.publish(
						"MESSAGES",
						JSON.stringify({ data, constructedMessage, message })
					);

					// Also emit to the sender so they get immediate feedback
					// socket.emit("message", constructedMessage);
				} catch (redisError) {
					logger.error("Redis publish error:", redisError);

					// Fallback: broadcast directly if Redis fails
					io.to(data.roomId).emit("message", constructedMessage);

					// Still try to save to database
					await MessagesModel.create(message);
				}
			} catch (error) {
				logger.error("Error handling 'message::send':", error);

				// Notify sender of error
				socket.emit("message_error", {
					error: "Failed to send message. Please try again.",
				});
			}
		}
	);

	// Handle request for last messages
	socket.on(
		"getLastMessages",
		async (data: { roomId: string; limit?: number }) => {
			try {
				if (!data?.roomId) {
					logger.warn("Invalid getLastMessages request:", {
						user: socketUser?.name,
						data,
					});
					socket.emit("message_error", { error: "Invalid room ID" });
					return;
				}

				logger.info("Fetching last messages for room:", data.roomId);

				// Get messages from database with pagination
				const messages = await MessagesModel.find({
					roomId: data.roomId,
				})
					.sort({ createdAt: -1 })
					.limit(data.limit || 50)
					.populate("sender", "_id name")
					.lean();

				// Format messages for client
				const formattedMessages = messages.map((msg: any) => ({
					_id: msg._id,
					sender: msg.sender,
					roomId: msg.roomId,
					message: msg.message,
					createdAt: msg.createdAt,
					updatedAt: msg.updatedAt,
				}));

				// Send messages to client in chronological order
				socket.emit("lastMessages", formattedMessages.reverse());
			} catch (error) {
				logger.error("Error fetching messages:", error);

				// Notify client of error
				socket.emit("message_error", {
					error: "Failed to load messages. Please refresh the page.",
				});
			}
		}
	);

	// Handle ping for connection health monitoring
	socket.on("ping", () => {
		socket.emit("pong");
	});

	// Handle room switch
	socket.on("room::switch", (data: { roomId: string }) => {
		try {
			if (!socketUser?.name || !data?.roomId) {
				logger.warn("Invalid room switch data:", {
					user: socketUser?.name,
					data,
				});
				return;
			}

			logger.info(
				`${socketUser.name} switched from room: ${data.roomId}`
			);

			// Emit system message that the user has left
			emitSystemMessage(
				socket,
				data.roomId,
				`${socketUser.name} has left the chat.`
			);
		} catch (error) {
			logger.error("Error handling 'room::switch':", error);
		}
	});

	// Handle disconnect
	socket.on("disconnect", () => {
		try {
			logger.info(`User ${socketUser?.name || "Unknown"} disconnected`);

			// Clean up any resources if needed
		} catch (error) {
			logger.error("Error handling 'disconnect':", error);
		}
	});
};

export default MessagesServices;
