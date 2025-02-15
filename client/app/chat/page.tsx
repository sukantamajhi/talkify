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
			socket?.emit("joinRoom", {
				roomId: parsedRoom._id,
				username: storedUsername,
			});
		}
	}, [socket]);

	// Function to join a new chat room
	const handleJoinRoom = async (roomId: string) => {
		try {
			const response = await axios.get(`/rooms/room-name/${roomId}`);
			const roomData: IRoomDetails = response.data.data;
			setRoom(roomData);
			setJoinedRoom(roomData._id);
			setShowJoinRoom(roomData?.name === ownRoomId ? "OWN" : "OTHER");
			localStorage.setItem("room", JSON.stringify(roomData));
			socket?.emit("joinRoom", { roomId: roomData._id, username });
		} catch (error: any) {
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
		setShowJoinRoom((prev) => (prev === "OWN" ? "OTHER" : "OWN"));
		socket?.emit("switchRoom", { roomId: room._id, username });
		if (showJoinRoom === "OTHER") {
			const ownRoomId = localStorage.getItem("selfRoomId");
			if (!ownRoomId) return;

			try {
				const response = await axios.get(
					`/rooms/room-name/${ownRoomId}`
				);
				const roomData: IRoomDetails = response.data.data;
				setRoom(roomData);
				setJoinedRoom(roomData._id);
				localStorage.setItem("room", JSON.stringify(roomData));
				socket?.emit("joinRoom", { roomId: roomData._id, username });
			} catch (error) {
				console.error(error);
			}
		} else {
			setJoinedRoom(null);
			setRoom(null);
			localStorage.removeItem("room");
		}
	};

	// Logout function
	const handleLogout = () => {
		localStorage.clear();
		router.replace("/");
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
			<div className='flex flex-col items-center justify-center bg-gray-100 p-4 room-area'>
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
