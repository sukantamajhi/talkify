import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

interface Message {
	id: number;
	message: string;
	sender: "user" | "other" | "System";
}

function ChatArea({
	room,
	socket,
	joinAnotherRoom,
}: {
	room: IRoomDetails | null;
	socket: any;
	joinAnotherRoom: Function;
}) {
	const [messages, setMessages] = useState<any[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const scrollRef: any = useRef(null);
	const [username, setUsername] = useState<string>("");

	useEffect(() => {
		const username = localStorage.getItem("username");
		if (username) {
			setUsername(username);
		}
	}, []);

	useEffect(() => {
		socket.emit("joinRoom", { room: room?._id, username });

		socket.on("message", (data: any) => {
			console.log(data, "<<-- data");
			setMessages((prev) => [...prev, data]);
		});

		return () => {
			socket.off("message");
		};
	}, [room]);

	// Scroll to the bottom when messages update
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]); // Trigger effect when messages change

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (newMessage.trim()) {
			const messageData = {
				message: newMessage,
				sender: username,
				roomId: room?._id,
			};

			console.log("Sending message:", messageData); // Debug log

			socket.emit("sendMessage", messageData); // Emit message to backend

			// setMessages((prev) => [...prev, messageData]); // Add message locally
			setNewMessage("");
		}
	};

	const handleJoinAnotherRoom = () => {
		joinAnotherRoom();
	};

	return (
		<Card className='w-full max-w-2xl h-[80vh] flex flex-col bg-white shadow-xl rounded-3xl overflow-hidden transition-all duration-300'>
			{/* Header */}
			<CardHeader className='flex items-center justify-between pb-4 bg-indigo-600 p-6 rounded-t-3xl text-white'>
				<div className='flex items-center space-x-4'>
					{/* Avatar Section */}
					<Avatar className='w-16 h-16 border-2 border-white transition-transform transform hover:scale-110'>
						<AvatarImage
							src='https://avatars.dicebear.com/api/avataaars/john-doe.svg'
							alt='User avatar'
						/>
						<AvatarFallback>JD</AvatarFallback>
					</Avatar>

					{/* Text Section */}
					<div className='text-white'>
						<h2 className='text-2xl font-bold'>
							Welcome to Chat Room #{room?.name}
						</h2>
						<p className='text-gray-100 text-base'>
							Dive into the conversation and make new connections!
						</p>
					</div>
				</div>

				{/* Button Section */}
				<Button
					onClick={handleJoinAnotherRoom}
					className='px-6 py-2 rounded-lg text-white bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transform hover:scale-105 hover:shadow-xl transition-all duration-300'>
					Switch to Another Room
				</Button>
			</CardHeader>

			{/* Chat Messages */}
			<CardContent className='flex-grow overflow-hidden p-6 bg-gray-50'>
				<div
					ref={scrollRef}
					className='h-full pr-4 overflow-y-auto p-4 transition-all duration-300'>
					{messages.map((message, index) => (
						<div
							key={index}
							className={`mb-4 flex ${
								message.sender === username
									? "justify-end"
									: "justify-start"
							}`}>
							<div
								className={`flex flex-col ${
									message.sender === username
										? "items-end"
										: "items-start"
								} w-full`}>
								{/* System Message Styling */}
								{message.sender === "system" ? (
									<div className='w-full bg-gray-200 text-blue-800 p-3 rounded-lg shadow-md text-center font-semibold text-sm'>
										<span className='italic'>[System]</span>{" "}
										{message.message}
									</div>
								) : (
									<>
										<div className='text-sm font-semibold text-gray-600'>
											{message.sender}
										</div>
										<div
											className={`max-w-[70%] px-4 py-2 rounded-xl shadow-md transition-all duration-300 ease-in-out transform ${
												message.sender === username
													? "bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:scale-105 hover:shadow-lg hover:translate-x-1 hover:translate-y-1"
													: "bg-gradient-to-r from-gray-100 to-gray-300 text-gray-800 hover:scale-105 hover:shadow-lg hover:translate-x-1 hover:translate-y-1"
											} animate__animated animate__fadeIn`}>
											{message.message}
										</div>
									</>
								)}
							</div>
						</div>
					))}
				</div>
			</CardContent>

			{/* Footer (Message Input and Send Button) */}
			<CardFooter className='bg-gray-800 p-4 rounded-b-3xl'>
				<form
					onSubmit={handleSendMessage}
					className='flex w-full space-x-2 items-center'>
					<Input
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						placeholder='Type your message...'
						className='flex-grow p-3 rounded-xl text-gray-700 bg-white border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out'
					/>
					<Button
						type='submit'
						className='bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transform transition-all duration-200'>
						<Send className='h-5 w-5' />
						<span className='sr-only'>Send</span>
					</Button>
				</form>
			</CardFooter>
		</Card>
	);
}

export default ChatArea;
