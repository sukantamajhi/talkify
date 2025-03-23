import { doLogout, getLocalStorageValue } from "@/lib/utils";
import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket, ManagerOptions } from "socket.io-client";

const SOCKET_URL =
	process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

// Socket.IO connection options
const socketOptions: Partial<ManagerOptions> = {
	// Enable reconnection
	reconnection: true,
	reconnectionAttempts: Infinity,
	reconnectionDelay: 1000,
	reconnectionDelayMax: 5000,
	timeout: 30000,
	// Use both transports with websocket preferred
	transports: ["websocket", "polling"],
	// Upgrade from polling to websocket when possible
	upgrade: true,
	// Automatically connect on creation
	autoConnect: true,
	// Force new connection (don't reuse existing)
	forceNew: true,
	// Retry if connection fails
	randomizationFactor: 0.5,
};

export const useSocket = () => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const socketRef = useRef<Socket | null>(null);
	const reconnectAttempts = useRef(0);
	const maxReconnectAttempts = 10;

	// Function to create a new socket connection
	const createSocket = useCallback(() => {
		const token = getLocalStorageValue("token");

		if (!token) {
			console.warn("No authentication token found for socket connection");
			return null;
		}

		// Create socket with auth token and options
		const newSocket = io(SOCKET_URL, {
			...socketOptions,
			auth: {
				token: token,
			},
		});

		return newSocket;
	}, []);

	// Function to set up socket event handlers
	const setupSocketEvents = useCallback((newSocket: Socket) => {
		// Connection successful
		newSocket.on("connect", () => {
			console.log("Socket connected:", newSocket.id);
			reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection
		});

		// Connection error
		newSocket.on("connect_error", (err) => {
			console.error("Socket connection error:", err);

			if (err.message.includes("401")) {
				doLogout();
			}

			if (err.message.includes("500")) {
				doLogout();
			}

			if (err.message.includes("403")) {
				doLogout();
			}

			// If we've tried too many times, force a transport change
			if (reconnectAttempts.current >= maxReconnectAttempts) {
				console.log(
					"Forcing transport change after multiple failed attempts"
				);

				// Force close and recreate with different transport priority
				newSocket.disconnect();

				// Create a new socket with polling as primary transport
				const fallbackSocket = io(SOCKET_URL, {
					...socketOptions,
					transports: ["polling", "websocket"],
					auth: {
						token: getLocalStorageValue("token"),
					},
				});

				// Set up events for the fallback socket
				setupSocketEvents(fallbackSocket);

				// Update references
				socketRef.current = fallbackSocket;
				setSocket(fallbackSocket);

				// Reset counter
				reconnectAttempts.current = 0;
			} else {
				reconnectAttempts.current++;
			}
		});

		// Disconnection
		newSocket.on("disconnect", (reason) => {
			console.log("Socket disconnected:", reason);

			// If the server disconnected us, try to reconnect
			if (reason === "io server disconnect") {
				newSocket.connect();
			}
		});

		// Reconnection attempt
		newSocket.on("reconnect_attempt", (attempt) => {
			console.log(`Socket reconnection attempt #${attempt}`);
		});

		// Reconnection error
		newSocket.on("reconnect_error", (error) => {
			console.error("Socket reconnection error:", error);
		});

		// Reconnection failed
		newSocket.on("reconnect_failed", () => {
			console.error("Socket reconnection failed after all attempts");
		});

		// Error event
		newSocket.on("error", (error) => {
			console.error("Socket error:", error);
		});

		// Ping/pong for connection health monitoring
		setInterval(() => {
			if (newSocket.connected) {
				const start = Date.now();
				newSocket.emit("ping", () => {
					const latency = Date.now() - start;
					console.log(`Socket latency: ${latency}ms`);
				});
			}
		}, 30000); // Check every 30 seconds
	}, []);

	useEffect(() => {
		// Only create a new socket if one doesn't exist
		if (!socketRef.current) {
			const newSocket = createSocket();

			if (newSocket) {
				// Set up event handlers
				setupSocketEvents(newSocket);

				// Store the socket in both state and ref
				socketRef.current = newSocket;
				setSocket(newSocket);
			}
		}

		// Cleanup function
		return () => {
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
		};
	}, [createSocket, setupSocketEvents]);

	return socket;
};
