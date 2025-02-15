"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatArea from "@/components/Chat/ChatArea";
import RoomJoin from "@/components/Chat/RoomJoin";
import { useSocket } from "@/hooks/useSocket";
import axios from "@/lib/axios";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

export default function ChatPage() {
	const socket = useSocket();
	const router = useRouter();
	const { toast } = useToast();

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

	// Leave current room
	const joinAnotherRoom = () => {
		setJoinedRoom(null);
		setRoom(null);
		localStorage.removeItem("room");
	};

	return (
		<>
			{/* Header Section */}
			<header className='w-full h-16 sticky top-0 flex justify-between items-center p-4 bg-white shadow-lg rounded-lg'>
				<Link
					href='/'
					className='flex items-center hover:text-blue-600 transition-all duration-300'>
					<MessageCircle className='w-8 h-8 text-black mr-2' />
					<h1 className='text-3xl font-bold text-black'>Talkify</h1>
				</Link>

				<div className='flex items-center space-x-4'>
					<Button
						onClick={handleChatRoomToggle}
						className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300'>
						{showJoinRoom === "OWN"
							? "Join Other Chat Room"
							: "Join Own Chat Room"}
					</Button>

					<Button
						onClick={handleLogout}
						className='px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300'>
						Logout
					</Button>
				</div>
			</header>

			{/* Main Content Area */}
			<div className='flex flex-col items-center justify-center bg-gray-100 p-4 room-area'>
				{joinedRoom && room?._id ? (
					<ChatArea
						room={room}
						joinAnotherRoom={joinAnotherRoom}
						socket={socket}
					/>
				) : (
					<RoomJoin onJoin={handleJoinRoom} />
				)}
			</div>

			<Toaster />
		</>
	);
}
