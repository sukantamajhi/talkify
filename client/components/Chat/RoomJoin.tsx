import React, { useState } from "react";
import { Button } from "../ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardDescription,
	CardFooter,
} from "../ui/card";
import { Input } from "../ui/input";
import { MessageCircle, Info } from "lucide-react";

function RoomJoin({ onJoin }: { onJoin: (roomId: string) => void }) {
	const [roomId, setRoomId] = useState("");
	const [showInfo, setShowInfo] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (roomId.trim()) {
			onJoin(roomId);
		}
	};

	return (
		<Card className='w-full max-w-md shadow-xl rounded-xl p-3 sm:p-4 md:p-6 bg-white dark:bg-gray-900 border-0 transition-all duration-300 hover:shadow-2xl'>
			<CardHeader className='pb-3 sm:pb-4 md:pb-6 text-center'>
				<div className='flex justify-center mb-3 sm:mb-4'>
					<div className='w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg'>
						<MessageCircle className='w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white' />
					</div>
				</div>
				<CardTitle className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100'>
					Join a Chat Room
				</CardTitle>
				<CardDescription className='text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2'>
					Enter a room ID to join an existing conversation
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit}
					className='space-y-3 sm:space-y-4 md:space-y-6'>
					<div className='mb-2 sm:mb-3 md:mb-4'>
						<Input
							id='roomId'
							type='text'
							placeholder='Enter Room ID'
							value={roomId}
							onChange={(e) => setRoomId(e.target.value)}
							required
							className='p-2 sm:p-3 md:p-4 w-full rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-xs sm:text-sm md:text-base'
						/>
					</div>

					<Button
						type='submit'
						disabled={!roomId.trim()}
						className='w-full py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-lg font-semibold text-xs sm:text-sm md:text-lg transition-all duration-300 hover:from-indigo-600 hover:to-indigo-800 transform hover:scale-105 shadow-md hover:shadow-lg'>
						Join Room
					</Button>
				</form>
			</CardContent>

			<CardFooter className='flex flex-col pt-2 px-0'>
				<Button
					variant='ghost'
					size='sm'
					className='text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs sm:text-sm'
					onClick={() => setShowInfo(!showInfo)}>
					<Info className='h-3 w-3 sm:h-4 sm:w-4 mr-1' />
					<span>{showInfo ? "Hide info" : "Need help?"}</span>
				</Button>

				{showInfo && (
					<div className='text-center mt-2 p-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg animate-fade-in'>
						<p className='mb-1'>
							Don&apos;t have a room ID? Ask a friend to share
							theirs!
						</p>
						<p className='text-xs'>
							Or go to your dashboard to create your own room.
						</p>
					</div>
				)}
			</CardFooter>
		</Card>
	);
}

export default RoomJoin;
