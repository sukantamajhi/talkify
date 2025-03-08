import { getLocalStorageValue } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export const useSocket = () => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const socketRef = useRef<Socket | null>(null);

	useEffect(() => {
		// Only create a new socket if one doesn't exist
		if (!socketRef.current) {
			const token = getLocalStorageValue("token");

			if (!token) {
				console.warn(
					"No authentication token found for socket connection"
				);
				return;
			}

			const newSocket = io(SOCKET_URL, {
				reconnectionDelayMax: 10000,
				reconnection: true,
				reconnectionAttempts: 5,
				timeout: 20000,
				auth: {
					token: token,
				},
			});

			// Setup event handlers
			newSocket.on("connect", () => {
				console.log("Socket connected:", newSocket.id);
			});

			newSocket.on("connect_error", (err) => {
				console.error("Socket connection error:", err.message);
			});

			newSocket.on("disconnect", (reason) => {
				console.log("Socket disconnected:", reason);
			});

			// Store the socket in both state and ref
			socketRef.current = newSocket;
			setSocket(newSocket);
		}

		// Cleanup function
		return () => {
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
		};
	}, []);

	return socket;
};
