import { Server } from "socket.io";
import Redis from "ioredis";
import MessagesServices from "./MessagesServices";
import UserModel from "../models/UserModel";
import logger from "../../logger";
import { produceMessage } from "./kafka";
import envConfig from "../utils/envConfig";

// Create Redis clients with connection options
const redisOptions = {
	host: envConfig.REDIS_HOST || "localhost",
	port: parseInt(envConfig.REDIS_PORT || "6379"),
	retryStrategy: (times: number) => {
		const delay = Math.min(times * 50, 2000);
		logger.info(`Redis reconnecting in ${delay}ms...`);
		return delay;
	},
};

const pub = new Redis(redisOptions);
const sub = new Redis(redisOptions);

// Handle Redis connection events
pub.on("error", (err) => logger.error("Redis Publisher Error:", err));
pub.on("connect", () => logger.info("Redis Publisher Connected"));

sub.on("error", (err) => logger.error("Redis Subscriber Error:", err));
sub.on("connect", () => logger.info("Redis Subscriber Connected"));

class SocketService {
	private _io: Server;
	private _activeConnections: Map<string, string> = new Map(); // userId -> socketId

	constructor() {
		logger.info("Initializing Socket Service...");
		this._io = new Server({
			cors: {
				origin: envConfig.ALLOWED_ORIGINS
					? envConfig.ALLOWED_ORIGINS.split(",")
					: [
							"http://localhost:3000",
							"http://192.168.0.104:3000",
							"https://talkify-one.vercel.app",
					  ],
				methods: ["GET", "POST", "OPTIONS"],
				allowedHeaders: ["Content-Type", "Authorization", "token"],
				credentials: true,
			},
			pingTimeout: 60000, // 60 seconds
			pingInterval: 25000, // 25 seconds
			connectTimeout: 45000, // 45 seconds
			transports: ["websocket", "polling"],
			upgradeTimeout: 30000, // 30 seconds
			maxHttpBufferSize: 1e8, // 100 MB
		});

		// Subscribe to Redis channel
		sub.subscribe("MESSAGES").catch((err) => {
			logger.error("Failed to subscribe to Redis channel:", err);
		});
	}

	public initListeners() {
		const io = this.io;
		logger.info("Initializing Socket Listeners...");

		// Middleware to authenticate the socket connection
		io.use(async (socket: any, next: Function) => {
			try {
				const token =
					(socket.handshake.auth.token as string) ||
					(socket.handshake.headers.token as string);

				if (!token) {
					logger.error("❌ Authentication failed: No token provided");
					return next(
						new Error(
							JSON.stringify({
								message: "Authentication error: Token required",
								statusCode: 401,
							})
						)
					);
				}

				const user = await UserModel.findOne(
					{
						loginToken: token,
						isActive: true,
					},
					{ _id: 1, name: 1 }
				);

				if (!user) {
					logger.error(
						"❌ Authentication failed: Invalid token or inactive user"
					);
					return next(
						new Error(
							JSON.stringify({
								message:
									"Authentication error: Invalid credentials",
								statusCode: 401,
							})
						)
					);
				}

				logger.info(
					`✅ Authentication successful for user: ${user.name}`
				);

				// Type assertion to ensure user._id is treated as a valid object
				const userId = user._id ? user._id.toString() : null;

				if (!userId) {
					logger.error(
						"❌ Authentication failed: User ID is missing"
					);
					return next(
						new Error(
							JSON.stringify({
								message:
									"Authentication error: User ID is missing",
								statusCode: 401,
							})
						)
					);
				}

				// Attach user details to socket
				socket.user = user;

				// Track active connection
				this._activeConnections.set(userId, socket.id);

				next(); // Allow connection
			} catch (error) {
				logger.error("Socket authentication error:", error);
				next(
					new Error(
						JSON.stringify({
							message:
								"Internal server error during authentication",
							statusCode: 500,
						})
					)
				);
			}
		});

		// Handle connection events
		io.on("connection", (socket: any) => {
			logger.info(
				`New Socket Connected: ${socket.id} - User: ${
					socket.user?.name || "Unknown"
				}`
			);

			// Setup message handlers
			MessagesServices(socket, io);

			// Handle ping/pong for connection health monitoring
			socket.on("ping", () => {
				socket.emit("pong");
			});

			// Handle disconnection
			socket.on("disconnect", (reason: string) => {
				if (socket.user?._id) {
					const userId = socket.user._id.toString();
					this._activeConnections.delete(userId);
					logger.info(
						`Socket ${socket.id} disconnected. Reason: ${reason}, User: ${socket.user.name}`
					);
				} else {
					logger.info(
						`Socket ${socket.id} disconnected. Reason: ${reason}`
					);
				}
			});

			// Handle connection errors
			socket.on("error", (error: any) => {
				logger.error(`Socket ${socket.id} error:`, error);
			});

			// Handle explicit reconnection attempts
			socket.on("reconnect_attempt", (attempt: number) => {
				logger.info(
					`Socket ${socket.id} reconnection attempt #${attempt}`
				);
			});
		});

		// Handle Redis messages
		sub.on("message", async (channel, data) => {
			try {
				if (channel === "MESSAGES") {
					const parsedData = JSON.parse(data);

					// Send to Kafka for persistence
					produceMessage(parsedData.message);

					// Broadcast to room
					io.to(parsedData.data.roomId).emit(
						"message",
						parsedData.constructedMessage
					);
				}
			} catch (error) {
				logger.error("Error processing Redis message:", error);
			}
		});
	}

	// Get active connections count
	public getActiveConnectionsCount(): number {
		return this._activeConnections.size;
	}

	// Check if a user is online
	public isUserOnline(userId: string): boolean {
		return this._activeConnections.has(userId);
	}

	// Get socket by user ID
	public getSocketByUserId(userId: string): string | undefined {
		return this._activeConnections.get(userId);
	}

	get io() {
		return this._io;
	}
}

export default SocketService;
