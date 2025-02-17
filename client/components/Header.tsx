import { MessageCircle } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

function Header({
	handleChatRoomToggle,
	showJoinRoom,
	ownRoomId,
}: {
	handleChatRoomToggle?: () => void;
	showJoinRoom?: string;
	ownRoomId?: string | null;
}) {
	return (
		<header className='w-full h-16 sticky top-0 flex justify-between items-center p-4 shadow-lg rounded-lg'>
			<Link
				href='/'
				className='flex items-center hover:text-blue-600 transition-all duration-300'>
				<MessageCircle className='w-8 h-8 mr-2' />
				<h1 className='text-2xl sm:text-3xl font-bold'>Talkify</h1>
			</Link>

			<div className='flex items-center space-x-4'>
				{showJoinRoom && (
					<>
						<Button
							onClick={handleChatRoomToggle}
							className={`px-4 py-2 sm:px-6 sm:py-2 ${
								showJoinRoom === "OWN"
									? "bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
									: "bg-blue-600 hover:bg-blue-700"
							} text-white rounded-lg transition-all duration-300`}>
							{showJoinRoom === "OWN"
								? "Switch to Another Room"
								: "Join Own Chat Room"}
						</Button>

						{showJoinRoom === "OWN" && ownRoomId && (
							<span className='text-gray-600 dark:text-gray-300 text-sm sm:text-lg ml-2 sm:ml-4 hidden sm:inline-block'>
								Chat Room ID: {ownRoomId}
							</span>
						)}
					</>
				)}
				<SignedIn>
					<UserButton
						showName={true}
						appearance={{
							baseTheme: dark,
						}}
					/>
				</SignedIn>
			</div>
		</header>
	);
}

export default Header;
