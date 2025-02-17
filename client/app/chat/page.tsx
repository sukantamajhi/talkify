"use client";

import { useEffect, useState } from "react";
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

	// Load user and room details from localStorage on mount
	useEffect(() => {
		const storedUsername = localStorage.getItem("username");
		const storedRoom = localStorage.getItem("room");

		if (storedUsername) setUsername(storedUsername);
		if (storedRoom) {
			const parsedRoom = JSON.parse(storedRoom);
			setRoom(parsedRoom);
			setJoinedRoom(parsedRoom._id);
			// Update the UI based on whether it's the "own room" or not
			const ownRoomId = localStorage.getItem("selfRoomId");
			setShowJoinRoom(room?.name === ownRoomId ? "OWN" : "OTHER");
			socket?.emit("joinRoom", {
				roomId: parsedRoom._id,
				username: storedUsername,
			});
		}
	}, [socket, room?.name]);

	// Function to join a new chat room
	const handleJoinRoom = async (roomId: string) => {
		try {
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
		} catch (error: any) {
			// Handle errors and show a toast message
			console.error(error, "<<-- Error in getting room details");
			toast({
				variant: "destructive",
				description:
					error?.response?.data?.message || "Something went wrong",
				duration: 3000,
			});
		}
	};

	// Toggle between "Own Room" and "Other Room"
	const handleChatRoomToggle = async () => {
		// Toggle the current room view between OWN and OTHER
		setShowJoinRoom((prev) => (prev === "OWN" ? "OTHER" : "OWN"));

		// If switching to the "OWN" room, attempt to join the user's own room
		if (showJoinRoom === "OTHER") {
			const ownRoomId = localStorage.getItem("selfRoomId");
			if (!ownRoomId) return;

			try {
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
				socket?.emit("joinRoom", { roomId: roomData._id, username });
			} catch (error) {
				console.error(error);
			}
		} else {
			// If switching to "OTHER" room, clear the current room data
			setJoinedRoom(null);
			setRoom(null);
			localStorage.removeItem("room");

			// Emit socket event to leave the current room
			socket?.off("message");
		}
	};

	// Logout function
	const handleLogout = () => {
		localStorage.clear();
		router.replace("/");
		socket.off("message");
	};

	return (
		<>
			{/* Header Section */}
			<Header
				userName={username}
				handleChatRoomToggle={handleChatRoomToggle}
				showJoinRoom={showJoinRoom}
				ownRoomId={ownRoomId}
				handleLogout={handleLogout}
			/>

			{/* Main Content Area */}
			<div className='flex flex-col items-center justify-center p-4 room-area'>
				{joinedRoom && room?._id ? (
					<ChatArea room={room} socket={socket} />
				) : (
					<RoomJoin onJoin={handleJoinRoom} />
				)}
			</div>

			<Toaster />
		</>
	);
}
