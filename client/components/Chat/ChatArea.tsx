import React, { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send, ArrowDown, Loader2 } from "lucide-react";
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
	const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
	const [showScrollButton, setShowScrollButton] = useState(false);
	const [isLoadingMessages, setIsLoadingMessages] = useState(true);
	const messagesLoaded = useRef(false);

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
			if (data.roomId === room?._id) {
				// Only add the message if it's not from the current user or if it's a system message
				if (
					data.sender.name !== username ||
					data.sender.name === "Talkify"
				) {
					setMessages((prev) => {
						// Check if message already exists to prevent duplicates
						const exists = prev.some((msg) => msg._id === data._id);
						if (exists) return prev;
						return [...prev, data];
					});
				}
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
		setIsLoadingMessages(false);
		messagesLoaded.current = true;
	}, []);

	// Join room and fetch messages when room or username changes
	useEffect(() => {
		if (!socket) return;

		if (room?._id && username) {
			setIsLoadingMessages(true);
			messagesLoaded.current = false;

			// Clear previous messages when changing rooms
			setMessages([]);

			// Join the room
			socket.emit("room::join", { room: room._id, username });

			// Request last messages
			socket.emit("getLastMessages", { roomId: room._id, limit: 50 });

			// Set up event listeners
			socket.on("message", handleNewMessage);
			socket.on("lastMessages", handleLastMessages);

			// Set a timeout to ensure we don't show loading forever if server doesn't respond
			const timeoutId = setTimeout(() => {
				if (!messagesLoaded.current) {
					setIsLoadingMessages(false);
				}
			}, 5000);

			return () => {
				// Clean up event listeners and timeout
				socket.off("message", handleNewMessage);
				socket.off("lastMessages", handleLastMessages);
				clearTimeout(timeoutId);
			};
		}
	}, [handleLastMessages, handleNewMessage, room, socket, username]);

	// Update room in localStorage when room changes
	useEffect(() => {
		if (room?._id) {
			localStorage.setItem("room", JSON.stringify(room));
		}
	}, [room]);

	// Handle scroll events to determine if user is at bottom
	const handleScroll = () => {
		if (scrollRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
			const isAtBottom =
				Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
			setIsScrolledToBottom(isAtBottom);
			setShowScrollButton(!isAtBottom);
		}
	};

	// Scroll to the bottom of the chat when new messages arrive if user was already at bottom
	useEffect(() => {
		if (scrollRef.current && (isScrolledToBottom || messages.length <= 1)) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		} else if (!isScrolledToBottom && messages.length > 0) {
			setShowScrollButton(true);
		}
	}, [messages, isScrolledToBottom]);

	// Handle sending a message
	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (newMessage.trim() && socket && room?._id) {
			const messageData = {
				message: newMessage,
				roomId: room._id,
			};

			// Create a temporary message to show immediately
			const tempId = `temp-${Date.now()}-${Math.random()}`;
			const newMsg: IMessage = {
				_id: tempId,
				sender: { _id: userId || "", name: username },
				roomId: room._id,
				message: newMessage,
				createdAt: new Date(),
			};

			// Add to local messages
			setMessages((prev) => [...prev, newMsg]);

			// Send to server
			socket.emit("message::send", messageData);

			// Clear input
			setNewMessage("");

			// Force scroll to bottom when sending a message
			setIsScrolledToBottom(true);
			setShowScrollButton(false);
			setTimeout(() => {
				if (scrollRef.current) {
					scrollRef.current.scrollTop =
						scrollRef.current.scrollHeight;
				}
			}, 50);
		}
	};

	// Scroll to bottom function
	const scrollToBottom = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
			setIsScrolledToBottom(true);
			setShowScrollButton(false);
		}
	};

	return (
		<Card className='w-full max-w-2xl h-[calc(100vh-5rem)] sm:h-[calc(100vh-8rem)] flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl rounded-xl sm:rounded-3xl overflow-hidden text-white'>
			<CardHeader className='flex items-center justify-between bg-gradient-to-r from-indigo-700 to-indigo-900 p-3 sm:p-6 rounded-t-xl sm:rounded-t-3xl text-white'>
				<div className='flex items-center space-x-2 sm:space-x-4 w-full overflow-hidden'>
					<Avatar className='flex-shrink-0 w-10 h-10 sm:w-16 sm:h-16 border-2 border-white transition-transform transform hover:scale-110'>
						<AvatarFallback className='bg-blue-600 text-white text-lg sm:text-2xl uppercase'>{`${
							room?.name[0]
						}${room?.name[1] || ""}`}</AvatarFallback>
					</Avatar>
					<div className='min-w-0 flex-1'>
						<h2 className='text-lg sm:text-2xl font-bold truncate'>
							Welcome to Chat Room
							<span className='sm:inline hidden'>
								#{room?.name}
							</span>
						</h2>
						<p className='text-gray-300 text-xs sm:text-base block'>
							<span className='inline sm:hidden'>
								#{room?.name}
							</span>
							<span className='hidden sm:inline'>
								Dive into the conversation and make new
								connections!
							</span>
						</p>
					</div>
				</div>
			</CardHeader>

			<CardContent className='flex-grow overflow-hidden p-2 sm:p-6 bg-gray-800 relative'>
				<div
					ref={scrollRef}
					className='h-full overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4'
					onScroll={handleScroll}>
					{isLoadingMessages ? (
						<div className='flex items-center justify-center h-full'>
							<div className='text-center text-gray-400'>
								<Loader2 className='h-8 w-8 animate-spin mx-auto mb-2 text-indigo-500' />
								<p className='text-sm sm:text-base'>
									Loading messages...
								</p>
							</div>
						</div>
					) : messages.length === 0 ? (
						<div className='flex items-center justify-center h-full'>
							<div className='text-center text-gray-400 bg-gray-800/50 p-4 rounded-lg'>
								<p className='text-sm sm:text-base'>
									No messages yet
								</p>
								<p className='text-xs sm:text-sm mt-1'>
									Be the first to send a message!
								</p>
							</div>
						</div>
					) : (
						messages.map((message, index) => {
							const isTalkify = message.sender.name === "Talkify";
							const isCurrentUser = message.sender._id === userId;
							const showSenderName =
								!isCurrentUser &&
								(index === 0 ||
									messages[index - 1]?.sender._id !==
										message.sender._id);

							return (
								<div
									key={message._id}
									className={`flex ${
										isTalkify
											? "justify-center"
											: isCurrentUser
											? "justify-end"
											: "justify-start"
									}`}>
									<div
										className={`flex flex-col ${
											isTalkify
												? "items-center max-w-[90%]"
												: isCurrentUser
												? "items-end"
												: "items-start"
										} max-w-[85%] sm:max-w-[75%]`}>
										{isTalkify ? (
											<div className='w-full bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-2 sm:p-3 rounded-lg shadow-lg text-center font-medium text-xs sm:text-base transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-xl flex items-center justify-center mx-auto border border-indigo-400 my-2'>
												<span className='animate-pulse'>
													{message.message}
												</span>
											</div>
										) : (
											<>
												{showSenderName && (
													<div className='text-xs sm:text-sm font-semibold text-gray-400 mb-1 px-2'>
														{message.sender.name}
													</div>
												)}
												<div
													className={`px-3 py-2 sm:px-5 sm:py-3 rounded-2xl shadow-lg transition-transform duration-200 ease-in-out transform ${
														isCurrentUser
															? "bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-tr-none hover:scale-105"
															: "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 rounded-tl-none hover:scale-105"
													} text-xs sm:text-base break-words`}>
													{message.message}
												</div>
												<div className='text-[10px] sm:text-xs text-gray-500 mt-1 px-2'>
													{message.createdAt
														? new Date(
																message.createdAt
														  ).toLocaleTimeString(
																[],
																{
																	hour: "2-digit",
																	minute: "2-digit",
																}
														  )
														: new Date().toLocaleTimeString(
																[],
																{
																	hour: "2-digit",
																	minute: "2-digit",
																}
														  )}
												</div>
											</>
										)}
									</div>
								</div>
							);
						})
					)}
				</div>

				{showScrollButton && (
					<Button
						onClick={scrollToBottom}
						className='absolute bottom-4 right-4 rounded-full w-10 h-10 bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center shadow-lg z-10'
						aria-label='Scroll to bottom'>
						<ArrowDown className='h-5 w-5' />
					</Button>
				)}
			</CardContent>

			<CardFooter className='bg-gray-900 p-2 sm:p-4 rounded-b-xl sm:rounded-b-3xl'>
				<form
					onSubmit={handleSendMessage}
					className='flex w-full space-x-2 items-center'>
					<Input
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						placeholder='Type your message...'
						className='flex-grow p-2 sm:p-3 rounded-xl bg-gray-700 text-white border-2 border-gray-600 text-sm sm:text-base'
						autoFocus
						disabled={isLoadingMessages}
					/>
					<Button
						type='submit'
						className='bg-indigo-700 text-white p-2 sm:px-6 sm:py-3 rounded-xl hover:bg-indigo-600 transition-all duration-300 hover:scale-105 flex-shrink-0'
						disabled={!newMessage.trim() || isLoadingMessages}>
						<Send className='h-4 w-4 sm:h-5 sm:w-5' />
					</Button>
				</form>
			</CardFooter>
		</Card>
	);
}

export default ChatArea;
