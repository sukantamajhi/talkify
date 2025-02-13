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
	content: string;
	sender: "user" | "other" | "System";
}

function ChatArea({ roomId, socket }: { roomId: string; socket: any }) {
	const [messages, setMessages] = useState<Message[]>([
		{ id: 1, content: `Welcome to room of ${roomId}!`, sender: "System" },
	]);
	const [newMessage, setNewMessage] = useState("");
	const scrollRef: any = useRef(null);

	useEffect(() => {
		if (!socket) return;

		// Listen for when the socket connects
		socket?.on("connect", () => {
			console.log("Socket connected, ID:", socket.id);
		});

		socket.on("sendMessage", (data: any) => {
			console.log(data, "<<-- data");
			setMessages((prev) => [...prev, data]);
		});

		return () => {
			socket.off("message");
			// Listen for when the socket disconnects
			socket.on("disconnect", () => {
				console.log("Socket disconnected.");
			});
		};
	}, [socket]);

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
			socket?.emit("sendMessage", {
				content: newMessage,
				sender: "user",
			});
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
								className={`flex flex-col ${
									message.sender === "user"
										? "items-end"
										: "items-start"
								} w-full`}>
								<div>{message.sender}</div>
								<div
									className={`max-w-[70%] rounded-lg p-3 ${
										message.sender === "user"
											? "bg-primary text-primary-foreground"
											: "bg-secondary"
									}`}>
									{message.content}
								</div>
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

export default ChatArea;
