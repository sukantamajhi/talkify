import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send, History } from "lucide-react";

function ChatArea({
	room,
	socket,
}: {
	room: IRoomDetails | null;
	socket: any;
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
			setMessages((prev) => [...prev, data]);
		});

		return () => {
			socket.off("message");
		};
	}, [room, socket, username]);

	useEffect(() => {
		if (room?._id) {
			localStorage.setItem("room", JSON.stringify(room));
		}
	}, [room]);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (newMessage.trim()) {
			const messageData = {
				message: newMessage,
				// sender: username,
				roomId: room?._id,
			};

			socket.emit("sendMessage", messageData);
			// setMessages([...messages, messageData]);
			setNewMessage("");
		}
	};

	const handleShowHistory = () => {
		socket.emit("getLastMessages", { roomId: room?._id, limit: 50 });

		socket.on("lastMessages", (data: any[]) => {
			console.log(data, "<<-- data");

			// Create a Set to track unique _id values
			const seenIds = new Set();

			// Combine the new messages with the existing ones
			const combinedMessages = [...data, ...messages];

			// Filter out duplicates based on _id
			const uniqueMessages = combinedMessages.filter((message) => {
				if (seenIds.has(message._id)) {
					return false; // Skip duplicate messages
				} else {
					seenIds.add(message._id); // Add the _id to the set
					return true; // Keep unique messages
				}
			});

			// Update the state with the unique messages
			setMessages(uniqueMessages);
		});
	};

	return (
		<Card className='w-full max-w-2xl h-[80vh] flex flex-col bg-white shadow-xl rounded-3xl overflow-hidden'>
			<CardHeader className='flex items-center justify-between bg-indigo-600 p-6 rounded-t-3xl text-white'>
				<div className='flex items-center space-x-4'>
					{/* Avatar Section */}
					<Avatar className='w-16 h-16 border-2 border-white transition-transform transform hover:scale-110'>
						<AvatarFallback className='bg-blue-600 text-white text-2xl uppercase'>{`${room.name[0]}${room.name[1]}`}</AvatarFallback>
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
				<Button
					onClick={handleShowHistory}
					className='bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded-lg flex items-center'>
					<History className='mr-2' /> Show History
				</Button>
			</CardHeader>

			<CardContent className='flex-grow overflow-hidden p-6 bg-gray-50'>
				<div ref={scrollRef} className='h-full overflow-y-auto p-4'>
					{messages.map((message) => (
						<div
							key={message?._id}
							className={`mb-4 flex ${
								message.sender?.name === username
									? "justify-end"
									: "justify-start"
							}`}>
							<div
								className={`flex flex-col ${
									message.sender?.name === username
										? "items-end"
										: "items-start"
								} w-full`}>
								{/* System Message Styling */}
								{message.sender?.name === "Talkify" ? (
									<div className='w-full bg-gradient-to-r from-blue-100 to-blue-300 text-blue-900 p-3 rounded-lg shadow-lg text-center font-medium text-base transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-xl flex items-center justify-center'>
										<span className='italic text-lg font-semibold mr-2'>
											[Talkify]
										</span>
										{message.message}
									</div>
								) : (
									<>
										{message.sender?.name !== username && (
											<div className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1'>
												{message.sender?.name}
											</div>
										)}
										<div
											className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-lg transition-transform duration-200 ease-in-out transform ${
												message.sender?.name ===
												username
													? "bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:scale-105 hover:shadow-xl hover:translate-x-2 hover:translate-y-2"
													: "bg-gradient-to-r from-gray-200 to-gray-400 text-gray-800 hover:scale-105 hover:shadow-xl hover:translate-x-2 hover:translate-y-2"
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

			<CardFooter className='bg-gray-800 p-4 rounded-b-3xl'>
				<form
					onSubmit={handleSendMessage}
					className='flex w-full space-x-2 items-center'>
					<Input
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						placeholder='Type your message...'
						className='flex-grow p-3 rounded-xl bg-white border-2'
						autoFocus
					/>
					<Button
						type='submit'
						className='bg-indigo-600 text-white px-6 py-3 rounded-xl'>
						<Send className='h-5 w-5' />
					</Button>
				</form>
			</CardFooter>
		</Card>
	);
}

export default ChatArea;
