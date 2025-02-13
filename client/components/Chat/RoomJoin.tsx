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

export default RoomJoin;
