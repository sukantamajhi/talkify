import { getCookey } from "@/lib/utils";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SERVER_URL;
export const useSocket = () => {
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		const newSocket = io(SOCKET_URL, {
			reconnectionDelayMax: 10000,
			auth: {
				token: getCookey("token"),
			},
		});
		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, []);

	return socket;
};
