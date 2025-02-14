"use client";

import { useEffect, useState } from "react";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatArea from "@/components/Chat/ChatArea";
import RoomJoin from "@/components/Chat/RoomJoin";
import { useSocket } from "@/hooks/useSocket";
import axios from "@/lib/axios";
import Link from "next/link";

export default function ChatPage() {
	const socket = useSocket();
	const [joinedRoom, setJoinedRoom] = useState<string | null>(null);
	const [showJoinRoom, setShowJoinRoom] = useState<"OWN" | "OTHER">("OTHER");
	const [username, setUsername] = useState<string>("");

	useEffect(() => {
		const username = localStorage.getItem("username");
		if (username) {
			setUsername(username);
		}
	}, []);

	const handleJoinRoom = async (roomId: string) => {
		// In a real application, you would verify the room ID with your backend here

		const isRoomExist = await axios.get(`/rooms/room-name/${roomId}`);

		setJoinedRoom(roomId);
		socket?.emit("joinRoom", { room: roomId, username });
	};

	const handleChatRoomToggle = () => {
		setShowJoinRoom((prev) => (prev === "OWN" ? "OTHER" : "OWN"));
		if (showJoinRoom === "OTHER") {
			setJoinedRoom("Sukanta Majhi");
		} else {
			setJoinedRoom(null);
		}
	};

	return (
		<>
			{/* Header Section with "Talkify" as logo */}
			<header className='w-full h-16 sticky top-0 flex justify-between items-center p-4 bg-white shadow-md'>
				<Link href='/' passHref className='flex items-center'>
					{/* Text Logo */}
					<MessageCircle className='w-8 h-8 text-black mr-2' />
					<h1 className='text-3xl font-bold text-black'>Talkify</h1>
				</Link>
				<Button onClick={handleChatRoomToggle} className='px-6 py-2'>
					{showJoinRoom === "OWN"
						? "Join Other Chat Room"
						: "Join Own Chat Room"}
				</Button>
			</header>
			<div className='flex flex-col items-center justify-center bg-gray-100 p-4 room-area'>
				{joinedRoom ? (
					<ChatArea roomId={joinedRoom} socket={socket} />
				) : (
					<RoomJoin onJoin={handleJoinRoom} />
				)}
			</div>
		</>
	);
}
