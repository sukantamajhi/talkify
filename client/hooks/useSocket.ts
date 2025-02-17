import { getLocalStorageValue } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SERVER_URL;
export const useSocket = () => {
	const { sessionId } = useAuth();

	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		const newSocket = io(SOCKET_URL, {
			reconnectionDelayMax: 10000,
			auth: {
				sessionId: sessionId,
			},
		});
		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, [sessionId]);

	return socket;
};
