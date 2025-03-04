import React, { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { isClient } from "@/lib/utils";
import { IMessage, IRoomDetails } from "@/global";

function ChatArea({
	room,
	socket,
}: {
	room: IRoomDetails | null;
	socket: any;
}) {
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const [username, setUsername] = useState<string>("");
	const userId = isClient ? localStorage.getItem("userId") : null;

	// Fetch username from localStorage once on mount
	useEffect(() => {
		const storedUsername = localStorage.getItem("username");
		if (storedUsername) {
			setUsername(storedUsername);
		}
	}, []);

	// Handle incoming message
	const handleNewMessage = useCallback(
		(data: IMessage) => {
			if (data.roomId === room?._id && data.sender.name !== username) {
				setMessages((prev) => [...prev, data]);
			}
		},
		[room, username]
	);

	// Handle last messages from the server
	const handleLastMessages = useCallback((data: IMessage[]) => {
		// Filter out duplicate messages based on _id
		const seenIds = new Set();
		const uniqueMessages = data.filter((msg) => {
			if (seenIds.has(msg._id)) return false;
			seenIds.add(msg._id);
			return true;
		});

		setMessages(uniqueMessages);
	}, []);

	// Join room and fetch messages when room or username changes
	useEffect(() => {
		if (room?._id && username) {
			socket.emit("joinRoom", { room: room._id, username });
			socket.emit("getLastMessages", { roomId: room._id, limit: 50 });

			socket.on("message", handleNewMessage);
			socket.on("lastMessages", handleLastMessages);

			return () => {
				socket.off("message", handleNewMessage);
				socket.off("lastMessages", handleLastMessages);
			};
		}
	}, [handleLastMessages, handleNewMessage, room, socket, username]);

	// Update room in localStorage when room changes
	useEffect(() => {
		if (room?._id) {
			localStorage.setItem("room", JSON.stringify(room));
		}
	}, [room]);

	// Scroll to the bottom of the chat whenever messages change
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	// Handle sending a message
	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (newMessage.trim()) {
			const messageData = {
				message: newMessage,
				roomId: room?._id,
			};

			const newMsg: IMessage = {
				_id: Math.random().toString(),
				sender: { _id: userId, name: username },
				roomId: room?._id,
				message: newMessage,
			};

			setMessages((prev) => [...prev, newMsg]);
			socket.emit("sendMessage", messageData);
			setNewMessage("");
		}
	};

	return (
		<Card className='w-full max-w-2xl h-[80vh] flex flex-col bg-gray-900 shadow-xl rounded-3xl overflow-hidden text-white'>
			<CardHeader className='flex items-center justify-between bg-indigo-700 p-6 rounded-t-3xl text-white'>
				<div className='flex items-center space-x-4'>
					<Avatar className='w-16 h-16 border-2 border-white transition-transform transform hover:scale-110'>
						<AvatarFallback className='bg-blue-600 text-white text-2xl uppercase'>{`${room?.name[0]}${room?.name[1]}`}</AvatarFallback>
					</Avatar>
					<div>
						<h2 className='text-2xl font-bold'>
							Welcome to Chat Room #{room?.name}
						</h2>
						<p className='text-gray-300 text-base'>
							Dive into the conversation and make new connections!
						</p>
					</div>
				</div>
			</CardHeader>

			<CardContent className='flex-grow overflow-hidden p-6 bg-gray-800'>
				<div ref={scrollRef} className='h-full overflow-y-auto p-4'>
					{messages.map((message) => (
						<div
							key={message._id}
							className={`mb-4 flex ${
								message.sender._id === userId
									? "justify-end"
									: "justify-start"
							}`}>
							<div
								className={`flex flex-col ${
									message.sender._id === userId
										? "items-end"
										: "items-start"
								} w-full`}>
								{message.sender.name === "Talkify" ? (
									<div className='w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white p-3 rounded-lg shadow-lg text-center font-medium text-base transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-xl flex items-center justify-center'>
										<span className='italic text-lg font-semibold mr-2'>
											[Talkify]
										</span>
										{message.message}
									</div>
								) : (
									<>
										{message.sender.name !== username && (
											<div className='text-sm font-semibold text-gray-400 mb-1'>
												{message.sender.name}
											</div>
										)}
										<div
											className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-lg transition-transform duration-200 ease-in-out transform ${
												message.sender._id === userId
													? "bg-gradient-to-r from-indigo-600 to-indigo-800 text-white hover:scale-105 hover:shadow-xl hover:translate-x-2 hover:translate-y-2"
													: "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 hover:scale-105 hover:shadow-xl hover:translate-x-2 hover:translate-y-2"
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

			<CardFooter className='bg-gray-900 p-4 rounded-b-3xl'>
				<form
					onSubmit={handleSendMessage}
					className='flex w-full space-x-2 items-center'>
					<Input
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						placeholder='Type your message...'
						className='flex-grow p-3 rounded-xl bg-gray-700 text-white border-2 border-gray-600'
						autoFocus
					/>
					<Button
						type='submit'
						className='bg-indigo-700 text-white px-6 py-3 rounded-xl hover:bg-indigo-600'>
						<Send className='h-5 w-5' />
					</Button>
				</form>
			</CardFooter>
		</Card>
	);
}

export default ChatArea;
