import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Input } from "../ui/input";

function RoomJoin({ onJoin }: { onJoin: (roomId: string) => void }) {
	const [roomId, setRoomId] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (roomId.trim()) {
			onJoin(roomId);
		}
	};

	return (
		<Card className='w-full max-w-md shadow-lg rounded-xl p-6'>
			<CardHeader className='pb-6'>
				<CardTitle className='text-3xl font-semibold text-gray-900 dark:text-gray-300'>
					Join a Chat Room
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className='space-y-6'>
					<div className='mb-6'>
						<Input
							id='roomId'
							type='text'
							placeholder='Enter Room ID'
							value={roomId}
							onChange={(e) => setRoomId(e.target.value)}
							required
							className='p-4 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300'
						/>
					</div>

					<Button
						type='submit'
						className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-lg font-semibold text-lg transition-all duration-300 hover:from-indigo-600 hover:to-indigo-800 transform hover:scale-105'>
						Join Room
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

export default RoomJoin;
