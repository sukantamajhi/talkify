"use client";

import { useEffect, useState, useCallback } from "react";
import ChatArea from "@/components/Chat/ChatArea";
import RoomJoin from "@/components/Chat/RoomJoin";
import { useSocket } from "@/hooks/useSocket";
import axios from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { IRoomDetails } from "@/global";

export default function ChatPage() {
	const socket = useSocket();
	const router = useRouter();
	const { toast } = useToast();
	const ownRoomId =
		typeof window !== "undefined" && localStorage.getItem("selfRoomId");

	const [room, setRoom] = useState<IRoomDetails | null>(null);
	const [joinedRoom, setJoinedRoom] = useState<string | null>(null);
	const [showJoinRoom, setShowJoinRoom] = useState<"OWN" | "OTHER">("OTHER");
	const [username, setUsername] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [socketReady, setSocketReady] = useState<boolean>(false);

	// Check if socket is connected
	useEffect(() => {
		if (socket) {
			setSocketReady(socket.connected);

			const handleConnect = () => {
				setSocketReady(true);
				// Re-join room if we were in one before
				if (room?._id && username) {
					socket.emit("room::join", { roomId: room._id, username });
				}
			};

			const handleDisconnect = () => {
				setSocketReady(false);
			};

			socket.on("connect", handleConnect);
			socket.on("disconnect", handleDisconnect);

			// Initial check
			if (socket.connected) {
				setSocketReady(true);
			}

			return () => {
				socket.off("connect", handleConnect);
				socket.off("disconnect", handleDisconnect);
			};
		}
	}, [socket, room, username]);

	// Load user and room details from localStorage on mount
	useEffect(() => {
		const storedUsername = localStorage.getItem("username");
		const storedRoom = localStorage.getItem("room");

		if (storedUsername) {
			setUsername(storedUsername);
		} else {
			// If no username, redirect to login
			router.replace("/");
			return;
		}

		if (storedRoom) {
			try {
				const parsedRoom = JSON.parse(storedRoom);
				if (parsedRoom && parsedRoom._id) {
					setRoom(parsedRoom);
					setJoinedRoom(parsedRoom._id);
					// Update the UI based on whether it's the "own room" or not
					const ownRoomId = localStorage.getItem("selfRoomId");
					setShowJoinRoom(
						parsedRoom.name === ownRoomId ? "OWN" : "OTHER"
					);

					// If socket is ready, join the room
					if (socket && socket.connected && storedUsername) {
						socket.emit("room::join", {
							roomId: parsedRoom._id,
							username: storedUsername,
						});
					}
				} else {
					// Invalid room data
					localStorage.removeItem("room");
				}
			} catch (error) {
				console.error("Error parsing stored room:", error);
				localStorage.removeItem("room");
			}
		}
	}, [router, socket]);

	// Function to join a new chat room
	const handleJoinRoom = useCallback(
		async (roomId: string) => {
			if (!socket || !socketReady) {
				toast({
					variant: "destructive",
					description:
						"Socket connection not ready. Please try again.",
					duration: 3000,
				});
				return;
			}

			try {
				setLoading(true);
				// Fetch room details using roomId
				const response = await axios.get(`/rooms/room-name/${roomId}`);
				const roomData: IRoomDetails = response.data.data;

				// Update the state with the room details and joined room id
				setRoom(roomData);
				setJoinedRoom(roomData._id);

				// Update the UI based on whether it's the "own room" or not
				const ownRoomId = localStorage.getItem("selfRoomId");
				setShowJoinRoom(roomData?.name === ownRoomId ? "OWN" : "OTHER");

				// Store room details in localStorage for persistence
				localStorage.setItem("room", JSON.stringify(roomData));

				// Join the room via socket
				socket.emit("room::join", { roomId: roomData._id, username });
			} catch (error: any) {
				// Handle errors and show a toast message
				console.error(error, "<<-- Error in getting room details");
				toast({
					variant: "destructive",
					description:
						error?.response?.data?.message ||
						"Something went wrong",
					duration: 3000,
				});
			} finally {
				setLoading(false);
			}
		},
		[socket, socketReady, toast, username]
	);

	// Toggle between "Own Room" and "Other Room"
	const handleChatRoomToggle = useCallback(async () => {
		if (!socket || !socketReady) {
			toast({
				variant: "destructive",
				description: "Socket connection not ready. Please try again.",
				duration: 3000,
			});
			return;
		}

		// Toggle the current room view between OWN and OTHER
		setShowJoinRoom((prev) => (prev === "OWN" ? "OTHER" : "OWN"));

		// If switching to the "OWN" room, attempt to join the user's own room
		if (showJoinRoom === "OTHER") {
			const ownRoomId = localStorage.getItem("selfRoomId");
			if (!ownRoomId) {
				toast({
					variant: "destructive",
					description:
						"You don't have your own room yet. Please create one from the dashboard.",
					duration: 5000,
				});
				return;
			}

			try {
				setLoading(true);
				// Fetch the own room details
				const response = await axios.get(
					`/rooms/room-name/${ownRoomId}`
				);
				const roomData: IRoomDetails = response.data.data;

				// Update state with the room data and joined room id
				setRoom(roomData);
				setJoinedRoom(roomData._id);

				// Store room details in localStorage for persistence
				localStorage.setItem("room", JSON.stringify(roomData));

				// Emit socket event to join the room
				socket.emit("room::join", { roomId: roomData._id, username });
			} catch (error: any) {
				console.error(error);
				toast({
					variant: "destructive",
					description:
						error?.response?.data?.message ||
						"Failed to join your room",
					duration: 3000,
				});
			} finally {
				setLoading(false);
			}
		} else {
			// If switching to "OTHER" room, clear the current room data
			setJoinedRoom(null);
			setRoom(null);
			localStorage.removeItem("room");

			// Leave the current room
			if (room?._id) {
				socket.emit("room::leave", { roomId: room._id, username });
			}
		}
	}, [socket, socketReady, showJoinRoom, toast, username, room]);

	// Logout function
	const handleLogout = useCallback(() => {
		// Leave current room if any
		if (socket && room?._id) {
			socket.emit("room::leave", { roomId: room._id, username });
		}

		localStorage.clear();
		router.replace("/");
	}, [router, socket, room, username]);

	return (
		<div className='flex flex-col min-h-screen max-h-screen sm:min-h-screen bg-gray-50 dark:bg-gray-900'>
			{/* Header Section */}
			<Header
				userName={username}
				handleChatRoomToggle={handleChatRoomToggle}
				showJoinRoom={showJoinRoom}
				ownRoomId={ownRoomId}
				handleLogout={handleLogout}
			/>

			{/* Main Content Area */}
			<div className='flex-1 flex flex-col items-center justify-center p-2 sm:p-4 room-area'>
				{!socketReady ? (
					<div className='flex items-center justify-center h-full w-full'>
						<div className='text-center'>
							<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4'></div>
							<p className='text-gray-600 dark:text-gray-300'>
								Connecting to server...
							</p>
						</div>
					</div>
				) : loading ? (
					<div className='flex items-center justify-center h-full w-full'>
						<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500'></div>
					</div>
				) : joinedRoom && room?._id ? (
					<ChatArea room={room} socket={socket} />
				) : (
					<RoomJoin onJoin={handleJoinRoom} />
				)}
			</div>

			<Toaster />
		</div>
	);
}
