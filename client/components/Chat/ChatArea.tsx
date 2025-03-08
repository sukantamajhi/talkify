import React, {
	useEffect,
	useRef,
	useState,
	useCallback,
	useMemo,
} from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send, ArrowDown, Loader2, RefreshCw } from "lucide-react";
import { isClient } from "@/lib/utils";
import { IMessage, IRoomDetails } from "@/global";

// Message cache to prevent duplicates
const messageCache = new Set<string>();

// Format time from ISO string or Date
const formatTime = (dateStr: string | Date | undefined): string => {
	if (!dateStr)
		return new Date().toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});

	const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

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
	const [isSocketConnected, setIsSocketConnected] = useState(false);
	const [retryCount, setRetryCount] = useState(0);
	const maxRetries = 3;
	const [connectionError, setConnectionError] = useState<string | null>(null);
	const lastPingTime = useRef<number>(0);
	const pingInterval = useRef<NodeJS.Timeout | null>(null);

	// Fetch username from localStorage once on mount
	useEffect(() => {
		const storedUsername = localStorage.getItem("username");
		if (storedUsername) {
			setUsername(storedUsername);
		}
	}, []);

	// Handle message errors
	const handleMessageError = useCallback((error: { error: string }) => {
		console.error("Message error:", error);
		// Could show a toast notification here
	}, []);

	// Monitor socket connection status
	useEffect(() => {
		if (!socket) {
			setIsSocketConnected(false);
			setConnectionError("Socket not initialized");
			return;
		}

		const handleConnect = () => {
			setIsSocketConnected(true);
			setConnectionError(null);
			// If we were previously disconnected and have a room, rejoin it
			if (room?._id && username) {
				socket.emit("room::join", { roomId: room._id, username });
				socket.emit("getLastMessages", { roomId: room._id, limit: 50 });
			}
		};

		const handleDisconnect = (reason: string) => {
			setIsSocketConnected(false);
			setConnectionError(`Disconnected: ${reason}`);
		};

		const handleConnectError = (error: any) => {
			console.error("Socket connection error:", error);
			setIsSocketConnected(false);
			setConnectionError(
				`Connection error: ${error.message || "Unknown error"}`
			);
		};

		const handleError = (error: any) => {
			console.error("Socket error:", error);
			setConnectionError(
				`Socket error: ${error.message || "Unknown error"}`
			);
		};

		const handlePong = () => {
			const latency = Date.now() - lastPingTime.current;
			console.log(`Socket latency: ${latency}ms`);
		};

		// Set initial connection state
		setIsSocketConnected(socket.connected);
		if (!socket.connected) {
			setConnectionError("Socket not connected");
		}

		// Add event listeners
		socket.on("connect", handleConnect);
		socket.on("disconnect", handleDisconnect);
		socket.on("connect_error", handleConnectError);
		socket.on("error", handleError);
		socket.on("pong", handlePong);
		socket.on("message_error", handleMessageError);

		// Set up ping interval to keep connection alive
		pingInterval.current = setInterval(() => {
			if (socket.connected) {
				lastPingTime.current = Date.now();
				socket.emit("ping");
			}
		}, 30000); // Ping every 30 seconds

		// Clean up event listeners and interval
		return () => {
			socket.off("connect", handleConnect);
			socket.off("disconnect", handleDisconnect);
			socket.off("connect_error", handleConnectError);
			socket.off("error", handleError);
			socket.off("pong", handlePong);
			socket.off("message_error", handleMessageError);

			if (pingInterval.current) {
				clearInterval(pingInterval.current);
			}
		};
	}, [socket, room, username, handleMessageError]);

	// Handle incoming message
	const handleNewMessage = useCallback(
		(data: IMessage) => {
			if (!data || !data.roomId || data.roomId !== room?._id) return;

			// Prevent duplicate messages
			if (messageCache.has(data._id)) return;
			messageCache.add(data._id);

			// Limit cache size
			if (messageCache.size > 1000) {
				const iterator = messageCache.values();
				const firstValue = iterator.next().value;
				if (firstValue) {
					messageCache.delete(firstValue);
				}
			}

			setMessages((prev) => [...prev, data]);
		},
		[room]
	);

	// Handle last messages from the server
	const handleLastMessages = useCallback((data: IMessage[]) => {
		if (!Array.isArray(data)) {
			console.error("Invalid lastMessages data:", data);
			setIsLoadingMessages(false);
			return;
		}

		// Filter out duplicate messages based on _id
		const seenIds = new Set<string>();
		const uniqueMessages = data.filter((msg) => {
			if (!msg || !msg._id) return false;
			if (seenIds.has(msg._id)) return false;
			seenIds.add(msg._id);
			// Also add to global cache
			messageCache.add(msg._id);
			return true;
		});

		setMessages(uniqueMessages);
		setIsLoadingMessages(false);
		messagesLoaded.current = true;
	}, []);

	// Join room and fetch messages when room or username changes
	useEffect(() => {
		if (!socket || !isSocketConnected) {
			// If socket is not connected, we'll wait for reconnection
			return;
		}

		if (room?._id && username) {
			setIsLoadingMessages(true);
			messagesLoaded.current = false;
			setMessages([]);

			// Join the room
			socket.emit("room::join", { roomId: room._id, username });

			// Request last messages
			socket.emit("getLastMessages", { roomId: room._id, limit: 50 });

			// Set up event listeners
			socket.on("message", handleNewMessage);
			socket.on("lastMessages", handleLastMessages);

			// Set a timeout to ensure we don't show loading forever
			const timeoutId = setTimeout(() => {
				if (!messagesLoaded.current) {
					setIsLoadingMessages(false);
					if (retryCount < maxRetries) {
						// Retry fetching messages
						socket.emit("getLastMessages", {
							roomId: room._id,
							limit: 50,
						});
						setRetryCount((prev) => prev + 1);
					}
				}
			}, 5000);

			return () => {
				socket.off("message", handleNewMessage);
				socket.off("lastMessages", handleLastMessages);
				clearTimeout(timeoutId);
			};
		}
	}, [
		handleLastMessages,
		handleNewMessage,
		room,
		socket,
		username,
		isSocketConnected,
		retryCount,
	]);

	// Update room in localStorage when room changes
	useEffect(() => {
		if (room?._id) {
			localStorage.setItem("room", JSON.stringify(room));
		}
	}, [room]);

	// Handle scroll events to determine if user is at bottom
	const handleScroll = useCallback(() => {
		if (scrollRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
			const isAtBottom =
				Math.abs(scrollHeight - scrollTop - clientHeight) < 20;
			setIsScrolledToBottom(isAtBottom);
			setShowScrollButton(!isAtBottom);
		}
	}, []);

	// Scroll to the bottom of the chat when new messages arrive if user was already at bottom
	useEffect(() => {
		if (scrollRef.current && (isScrolledToBottom || messages.length <= 1)) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		} else if (!isScrolledToBottom && messages.length > 0) {
			setShowScrollButton(true);
		}
	}, [messages, isScrolledToBottom]);

	// Handle sending a message
	const handleSendMessage = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (
				!newMessage.trim() ||
				!socket ||
				!isSocketConnected ||
				!room?._id
			) {
				return;
			}

			// Generate a unique ID for the message
			const messageId = `temp-${Date.now()}-${Math.random()
				.toString(36)
				.substring(2, 15)}`;

			// Create message data for server
			const messageData = {
				message: newMessage,
				roomId: room._id,
			};

			// Create temporary message for UI
			const tempMessage: IMessage = {
				_id: messageId,
				sender: { _id: userId || "", name: username },
				roomId: room._id,
				message: newMessage,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			// Add to message cache to prevent duplicate
			messageCache.add(messageId);

			// Update UI immediately
			setMessages((prev) => [...prev, tempMessage]);

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
		},
		[newMessage, socket, isSocketConnected, room, userId, username]
	);

	// Scroll to bottom function
	const scrollToBottom = useCallback(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
			setIsScrolledToBottom(true);
			setShowScrollButton(false);
		}
	}, []);

	// Attempt to reconnect manually
	const handleReconnect = useCallback(() => {
		if (!socket) return;

		// Force reconnection
		socket.disconnect();
		socket.connect();

		// Reset error state
		setConnectionError(null);
		setRetryCount(0);
	}, [socket]);

	// Group messages by sender for better UI
	const groupedMessages = useMemo(() => {
		const groups: IMessage[][] = [];
		let currentGroup: IMessage[] = [];
		let currentSenderId: string | null = null;

		console.log(messages, "<<-- messages");

		messages.forEach((message) => {
			// System messages or different sender starts a new group
			if (
				message.sender.name === "Talkify" ||
				message.sender._id !== currentSenderId
			) {
				if (currentGroup.length > 0) {
					groups.push([...currentGroup]);
					currentGroup = [];
				}
				currentSenderId = message.sender._id;
			}
			currentGroup.push(message);
		});

		// Add the last group
		if (currentGroup.length > 0) {
			groups.push(currentGroup);
		}

		return groups;
	}, [messages]);

	// Render connection status
	const renderConnectionStatus = () => {
		if (!isSocketConnected || connectionError) {
			return (
				<div className='absolute top-0 left-0 right-0 bg-red-500 text-white text-xs py-1 z-10 flex items-center justify-center'>
					<span className='mr-2'>
						{connectionError || "Connection lost. Reconnecting..."}
					</span>
					<Button
						variant='ghost'
						size='sm'
						className='h-6 w-6 p-0 text-white hover:bg-red-600 rounded-full'
						onClick={handleReconnect}>
						<RefreshCw className='h-3 w-3' />
					</Button>
				</div>
			);
		}
		return null;
	};

	return (
		<Card className='w-full max-w-2xl h-[calc(100vh-5rem)] sm:h-[calc(100vh-8rem)] flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl rounded-xl sm:rounded-3xl overflow-hidden text-white'>
			{renderConnectionStatus()}
			<CardHeader className='flex items-center justify-between bg-gradient-to-r from-indigo-700 to-indigo-900 p-3 sm:p-6 rounded-t-xl sm:rounded-t-3xl text-white'>
				<div className='flex items-center space-x-2 sm:space-x-4 w-full overflow-hidden'>
					<Avatar className='flex-shrink-0 w-10 h-10 sm:w-16 sm:h-16 border-2 border-white transition-transform transform hover:scale-110'>
						<AvatarFallback className='bg-blue-600 text-white text-lg sm:text-2xl uppercase'>{`${
							room?.name?.[0] || "?"
						}${room?.name?.[1] || ""}`}</AvatarFallback>
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
					className='h-full overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 scrollbar-thin'
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
							<div className='text-center text-gray-400 bg-gray-800/50 p-4 rounded-lg max-w-xs mx-auto'>
								<p className='text-sm sm:text-base font-medium'>
									No messages yet
								</p>
								<p className='text-xs sm:text-sm mt-1'>
									Be the first to send a message!
								</p>
							</div>
						</div>
					) : (
						groupedMessages.map((group, groupIndex) => {
							const firstMessage = group[0];
							const isTalkify =
								firstMessage.sender.name === "Talkify";
							const isCurrentUser =
								firstMessage.sender._id === userId;

							return (
								<div
									key={`group-${groupIndex}-${firstMessage._id}`}
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
										{/* Show sender name for non-current user */}
										{!isCurrentUser && !isTalkify && (
											<div className='text-xs sm:text-sm font-semibold text-gray-400 mb-1 px-2'>
												{firstMessage.sender.name}
											</div>
										)}

										{/* Render messages in group */}
										{group.map((message) => (
											<div
												key={message._id}
												className='mb-1'>
												{isTalkify ? (
													<div className='w-full bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-2 sm:p-3 rounded-lg shadow-lg text-center font-medium text-xs sm:text-base transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-xl flex items-center justify-center mx-auto border border-indigo-400 my-2'>
														<span className='animate-pulse'>
															{message.message}
														</span>
													</div>
												) : (
													<div
														className={`px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 rounded-2xl shadow-lg transition-transform duration-200 ease-in-out transform ${
															isCurrentUser
																? "bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-tr-none hover:scale-105"
																: "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 rounded-tl-none hover:scale-105"
														} text-xs sm:text-sm md:text-base break-words`}>
														{message.message}
													</div>
												)}
											</div>
										))}

										{/* Show timestamp for last message in group */}
										{!isTalkify && (
											<div className='text-[10px] sm:text-xs text-gray-500 mt-0.5 px-2'>
												{formatTime(
													group[group.length - 1]
														.createdAt
												)}
											</div>
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
						className='absolute bottom-4 right-4 rounded-full w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center shadow-lg z-10'
						aria-label='Scroll to bottom'>
						<ArrowDown className='h-4 w-4 sm:h-5 sm:w-5' />
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
						placeholder={
							isSocketConnected
								? "Type your message..."
								: "Reconnecting..."
						}
						className='flex-grow p-2 sm:p-3 rounded-xl bg-gray-700 text-white border-2 border-gray-600 text-xs sm:text-sm md:text-base placeholder:text-gray-400'
						autoFocus
						disabled={!isSocketConnected || isLoadingMessages}
					/>
					<Button
						type='submit'
						className='bg-indigo-700 text-white min-w-10 h-10 sm:min-w-12 sm:h-12 p-2 sm:px-4 rounded-xl hover:bg-indigo-600 transition-all duration-300 hover:scale-105 flex-shrink-0'
						disabled={
							!newMessage.trim() ||
							!isSocketConnected ||
							isLoadingMessages
						}>
						<Send className='h-4 w-4 sm:h-5 sm:w-5' />
					</Button>
				</form>
			</CardFooter>
		</Card>
	);
}

export default React.memo(ChatArea);
