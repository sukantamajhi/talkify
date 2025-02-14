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
	const [joinedRoom, setJoinedRoom] = useState<string | null>(null);
	const [showJoinRoom, setShowJoinRoom] = useState<"OWN" | "OTHER">("OTHER");
	const [username, setUsername] = useState<string>("");
	const ownRoomId =
		typeof window !== "undefined" && localStorage.getItem("selfRoomId");
	const [room, setRoom] = useState<IRoomDetails | null>(null);

	useEffect(() => {
		const username = localStorage.getItem("username");
		if (username) {
			setUsername(username);
		}
	}, []);

	const handleJoinRoom = async (roomId: string) => {
		// In a real application, you would verify the room ID with your backend here

		try {
			const existingRoom = await axios.get(`/rooms/room-name/${roomId}`);
			console.log(existingRoom, "<<-- existing room");
			const room: IRoomDetails = existingRoom.data.data;
			setRoom(room);

			setJoinedRoom(room._id);
			socket?.emit("joinRoom", { roomId: room._id, username });
		} catch (error: any) {
			console.error(error, "<<-- Error in getting room details");
			toast({
				variant: "destructive",
				description:
					error?.response?.data?.message || "Something went wrong",
				duration: 3000,
			});
			return;
		}
	};

	const handleChatRoomToggle = async () => {
		setShowJoinRoom((prev) => (prev === "OWN" ? "OTHER" : "OWN"));
		if (showJoinRoom === "OTHER") {
			const existingRoom = await axios.get(
				`/rooms/room-name/${ownRoomId}`
			);
			console.log(existingRoom, "<<-- existing room");
			const room: IRoomDetails = existingRoom.data.data;
			setRoom(room);

			setJoinedRoom(room._id);
			socket?.emit("joinRoom", { roomId: room._id, username });
		} else {
			setJoinedRoom(null);
		}
	};

	const handleLogout = () => {
		localStorage.clear();
		router.replace("/");
	};

	const joinAnotherRoom = () => {
		setJoinedRoom(null);
	};

	return (
		<>
			{/* Header Section with "Talkify" as logo */}
			<header className='w-full h-16 sticky top-0 flex justify-between items-center p-4 bg-white shadow-lg rounded-lg'>
				<Link
					href='/'
					passHref
					className='flex items-center hover:text-blue-600 transition-all duration-300'>
					{/* Text Logo */}
					<MessageCircle className='w-8 h-8 text-black mr-2' />
					<h1 className='text-3xl font-bold text-black'>Talkify</h1>
				</Link>

				<div className='flex items-center space-x-4'>
					{/* Toggle Join Chat Room Button */}
					<Button
						onClick={handleChatRoomToggle}
						className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300'>
						{showJoinRoom === "OWN"
							? "Join Other Chat Room"
							: "Join Own Chat Room"}
					</Button>

					{/* Logout Button */}
					<Button
						onClick={handleLogout}
						className='px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300'>
						Logout
					</Button>
				</div>
			</header>

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
