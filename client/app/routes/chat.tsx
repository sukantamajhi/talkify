"use client";

import { useEffect, useRef, useState } from "react";

import { MessageCircle, Send } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";

interface Message {
	id: number;
	content: string;
	sender: "user" | "other";
}

function RoomJoin({ onJoin }: { onJoin: (roomId: string) => void }) {
	const [roomId, setRoomId] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (roomId.trim()) {
			onJoin(roomId);
		}
	};

	return (
		<Card className='w-full max-w-md'>
			<CardHeader>
				<CardTitle>Join a Chat Room</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit}>
					<div className='mb-4'>
						<Input
							id='roomId'
							type='text'
							placeholder='Enter Room ID'
							value={roomId}
							onChange={(e) => setRoomId(e.target.value)}
							required
						/>
					</div>
					<Button type='submit' className='w-full'>
						Join Room
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

function ChatArea({ roomId }: { roomId: string }) {
	const [messages, setMessages] = useState<Message[]>([
		{ id: 1, content: `Welcome to room of ${roomId}!`, sender: "other" },
	]);
	const [newMessage, setNewMessage] = useState("");
	const scrollRef: any = useRef(null);

	// Scroll to the bottom when messages update
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]); // Trigger effect when messages change

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (newMessage.trim()) {
			setMessages([
				...messages,
				{
					id: messages.length + 1,
					content: newMessage,
					sender: "user",
				},
			]);
			setNewMessage("");
		}
	};

	return (
		<Card className='w-full max-w-2xl h-[80vh] flex flex-col'>
			<CardHeader className='flex flex-row items-center space-x-4 pb-4'>
				<Avatar className='w-12 h-12'>
					<AvatarImage
						src='https://avatars.dicebear.com/api/avataaars/john-doe.svg'
						alt='User avatar'
					/>
					<AvatarFallback>JD</AvatarFallback>
				</Avatar>
				<div>
					<h2 className='text-2xl font-bold'>
						Welcome to Chat Room #{roomId}
					</h2>
					<p className='text-gray-500'>
						Feel free to start the conversation in this space.
					</p>
				</div>
			</CardHeader>
			<CardContent className='flex-grow overflow-hidden'>
				<div
					ref={scrollRef} // Attach the ref to the scroll container
					className='h-full pr-4 overflow-y-auto' // Make sure there's overflow and scroll
				>
					{messages.map((message) => (
						<div
							key={message.id}
							className={`mb-4 flex ${
								message.sender === "user"
									? "justify-end"
									: "justify-start"
							}`}>
							<div
								className={`max-w-[70%] rounded-lg p-3 ${
									message.sender === "user"
										? "bg-primary text-primary-foreground"
										: "bg-secondary"
								}`}>
								{message.content}
							</div>
						</div>
					))}
				</div>
			</CardContent>
			<CardFooter>
				<form
					onSubmit={handleSendMessage}
					className='flex w-full space-x-2'>
					<Input
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						placeholder='Type your message...'
						className='flex-grow'
					/>
					<Button type='submit'>
						<Send className='h-4 w-4' />
						<span className='sr-only'>Send</span>
					</Button>
				</form>
			</CardFooter>
		</Card>
	);
}

export default function ChatPage() {
	const [joinedRoom, setJoinedRoom] = useState<string | null>(null);
	const [showJoinRoom, setShowJoinRoom] = useState(false);

	const handleJoinRoom = (roomId: string) => {
		// In a real application, you would verify the room ID with your backend here
		setJoinedRoom(roomId);
	};

	return (
		<>
			{/* Header Section with "Talkify" as logo */}
			<header className='w-full h-16 sticky top-0 flex justify-between items-center p-4 bg-white shadow-md'>
				<div className='flex items-center'>
					{/* Text Logo */}
					<MessageCircle className='w-8 h-8 text-black mr-2' />
					<h1 className='text-3xl font-bold text-black'>Talkify</h1>
				</div>
				<Button
					onClick={() => {
						setShowJoinRoom(true);
						setJoinedRoom("Sukanta Majhi");
					}}
					className='px-6 py-2'>
					Join Own Chat Room
				</Button>
			</header>
			<div className='flex flex-col items-center justify-center bg-gray-100 p-4 room-area'>
				{joinedRoom ? (
					<ChatArea roomId={joinedRoom} />
				) : (
					<RoomJoin onJoin={handleJoinRoom} />
				)}
			</div>
		</>
	);
}
