import { LogOut, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getInitials } from "@/lib/utils";

function Header({
	handleChatRoomToggle,
	showJoinRoom,
	userName,
	handleLogout,
}: {
	handleChatRoomToggle: () => void;
	showJoinRoom: string;
	userName: string;
	ownRoomId: string | null;
	handleLogout: () => void;
}) {
	return (
		<header className='w-full h-auto min-h-16 sticky top-0 z-10 flex sm:flex-row justify-between items-center p-3 sm:p-4 shadow-lg rounded-lg bg-white dark:bg-gray-900 transition-all duration-300 gap-2'>
			<Link
				href='/'
				className='flex items-center hover:text-blue-600 transition-all duration-300 mb-2 sm:mb-0'>
				<MessageCircle className='w-6 h-6 sm:w-8 sm:h-8 mr-2' />
				<h1 className='text-xl sm:text-2xl md:text-3xl font-bold'>
					Talkify
				</h1>
			</Link>

			<div className='flex flex-wrap items-center justify-center gap-2 sm:gap-4'>
				<Button
					onClick={handleChatRoomToggle}
					className={`px-3 py-1.5 text-xs sm:text-sm md:text-base sm:px-4 sm:py-2 ${
						showJoinRoom === "OWN"
							? "bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
							: "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
					} text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105`}>
					{showJoinRoom === "OWN"
						? "Switch to Another Room"
						: "Join Own Chat Room"}
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant='ghost'
							className='relative h-8 w-8 sm:h-10 sm:w-10 p-0 sm:p-0 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-300'>
							<Avatar className='h-full w-full'>
								<AvatarImage
									src='/placeholder.svg'
									alt='User Avatar'
								/>
								<AvatarFallback className='text-white bg-blue-600 dark:bg-blue-700 text-xs sm:text-sm'>
									{getInitials(userName)}
								</AvatarFallback>
							</Avatar>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className='w-48 sm:w-56 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
						align='end'
						forceMount>
						<div className='px-4 py-2 border-b border-gray-200 dark:border-gray-700'>
							<p className='text-sm font-medium truncate text-gray-900 dark:text-gray-100'>
								{userName}
							</p>
						</div>
						<DropdownMenuItem
							asChild
							className='cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20'>
							<Link
								href='/dashboard'
								className='flex items-center w-full'>
								<User className='mr-2 h-4 w-4' />
								<span>Dashboard</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={handleLogout}
							className='cursor-pointer text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'>
							<LogOut className='mr-2 h-4 w-4' />
							<span>Log out</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}

export default Header;
