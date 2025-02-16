"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Upload, Pen } from "lucide-react";
import Image from "next/image";
import axios from "@/lib/axios";
import Link from "next/link";
import { getInitials } from "@/lib/utils";

interface IUserProfile {
	name: string;
	email: string;
	bio: string;
	profilePicture?: string | null;
}

interface IRoomSettings {
	roomName: string;
	roomDescription: string;
	isPrivate: boolean;
	thumbnail: string | null;
}

function UserProfileForm({ initialData }: { initialData: IUserProfile }) {
	const [formData, setFormData] = useState(initialData);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Updating user profile:", formData);
		// Typically send this data to your backend
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-xl space-y-6'>
			<div>
				{/* Name Input */}
				<div>
					<Label
						htmlFor='name'
						className='text-gray-800 text-lg font-medium mb-2 block'>
						Name
					</Label>
					<Input
						id='name'
						name='name'
						value={formData?.name}
						onChange={handleChange}
						required
						className='mt-2 p-4 w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 ease-in-out'
					/>
				</div>

				{/* Email Input */}
				<div className='mt-4'>
					<Label
						htmlFor='email'
						className='text-gray-800 text-lg font-medium mb-2 block'>
						Email
					</Label>
					<Input
						id='email'
						name='email'
						type='email'
						value={formData?.email}
						onChange={handleChange}
						required
						className='mt-2 p-4 w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 ease-in-out'
					/>
				</div>

				{/* Bio Textarea (Optional) */}
				{/* <div>
					<Label htmlFor="bio" className="text-gray-800 text-lg font-medium mb-2 block">
						Bio
					</Label>
					<Textarea
						id="bio"
						name="bio"
						value={formData.bio}
						onChange={handleChange}
						rows={4}
						className="mt-2 p-4 w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 ease-in-out"
					/>
				</div> */}

				{/* Submit Button */}
				<Button
					type='submit'
					className='w-full mt-4 p-4 text-white text-lg font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-900 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500'>
					Update Profile
				</Button>
			</div>
		</form>
	);
}

function RoomSettingsForm({ initialData }: { initialData: IRoomSettings }) {
	const [formData, setFormData] = useState(initialData);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.checked });
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.type.startsWith("image/")) {
				const reader = new FileReader();
				reader.onload = (event) => {
					setFormData({
						...formData,
						thumbnail: event.target?.result as string,
					});
				};
				reader.readAsDataURL(file);
			} else {
				alert("Please select an image file");
				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}
			}
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Updating room settings:", formData);
		// Here you would typically send this data to your backend
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className='space-y-4'>
				<div>
					<Label htmlFor='roomName'>Room Name</Label>
					<Input
						id='roomName'
						name='roomName'
						value={formData.roomName}
						onChange={handleChange}
						required
					/>
				</div>
				<div>
					<Label htmlFor='roomDescription'>Room Description</Label>
					<Textarea
						id='roomDescription'
						name='roomDescription'
						value={formData.roomDescription}
						onChange={handleChange}
						rows={4}
					/>
				</div>
				<div className='flex items-center space-x-2'>
					<input
						type='checkbox'
						id='isPrivate'
						name='isPrivate'
						checked={formData.isPrivate}
						onChange={handleCheckboxChange}
						className='rounded border-gray-300 text-primary focus:ring-primary'
					/>
					<Label htmlFor='isPrivate'>Private Room</Label>
				</div>
				<div>
					<Label htmlFor='thumbnail'>Room Thumbnail</Label>
					<div className='mt-2 flex items-center space-x-4'>
						{formData.thumbnail && (
							<Image
								src={formData.thumbnail || "/placeholder.svg"}
								alt='Room Thumbnail'
								className='w-24 h-24 object-cover rounded-md'
							/>
						)}
						<div>
							<Input
								id='thumbnail'
								name='thumbnail'
								type='file'
								accept='image/*'
								onChange={handleFileChange}
								ref={fileInputRef}
								className='hidden'
							/>
							<Button
								type='button'
								variant='outline'
								onClick={() => fileInputRef.current?.click()}>
								<Upload className='w-4 h-4 mr-2' />
								Upload Thumbnail
							</Button>
						</div>
					</div>
				</div>
			</div>
			<Button type='submit' className='mt-4'>
				Update Room Settings
			</Button>
		</form>
	);
}

export default function DashboardPage() {
	const [userProfile, setUserProfile] = useState<IUserProfile>(null);
	const [avatarPreview, setAvatarPreview] = useState(
		userProfile?.profilePicture || "/placeholder.svg"
	);
	const [isEditingAvatar, setIsEditingAvatar] = useState(false);

	const fetchUserDetails = async () => {
		const user = await axios.get("/users");
		console.log(user.data, "<<-- user");
		setUserProfile(user.data.data);
	};

	useEffect(() => {
		fetchUserDetails();
	}, []);

	const roomSettings: IRoomSettings = {
		roomName: "John's Room",
		roomDescription: "A place to chat about anything",
		isPrivate: false,
		thumbnail: null,
	};

	const handleAvatarChange = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			const formData = new FormData();
			formData.append("avatar", file);

			// Upload avatar to server
			try {
				const response = await axios.post("/upload-image", {
					formData,
				});

				// if (!response.ok) throw new Error("Failed to upload avatar.");

				// const data = await response.json();
				// setAvatarPreview(data.avatarUrl); // Update avatar preview with the new URL
				// setIsEditingAvatar(false); // Close file input after upload
			} catch (error) {
				console.error("Avatar upload failed:", error);
			}
		}
	};

	return (
		<div className='flex flex-col min-h-screen bg-gray-100'>
			{/* Header and main content remain the same */}
			<header className='w-full h-16 sticky top-0 flex justify-between items-center p-4 bg-white shadow-lg rounded-lg'>
				<Link
					href='/'
					className='flex items-center hover:text-blue-600 transition-all duration-300'>
					<MessageCircle className='w-8 h-8 text-black mr-2' />
					<h1 className='text-2xl sm:text-3xl font-bold text-black'>
						Talkify
					</h1>
				</Link>
			</header>
			<main className='flex-1 p-8'>
				<div className='max-w-4xl mx-auto'>
					<header className='mb-8'>
						<h1 className='text-3xl font-bold'>User Dashboard</h1>
					</header>

					<Tabs defaultValue='profile'>
						<TabsList className='flex justify-start items-center gap-4 py-4 bg-transparent rounded-t-lg'>
							<TabsTrigger
								value='profile'
								className='text-lg font-semibold text-blue-600 py-2 px-6 rounded-lg bg-transparent border border-transparent hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out'>
								Profile
							</TabsTrigger>
							<TabsTrigger
								value='room'
								className='text-lg font-semibold text-blue-600 py-2 px-6 rounded-lg bg-transparent border border-transparent hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out'>
								Room Settings
							</TabsTrigger>
						</TabsList>

						{/* Profile Tab */}
						<TabsContent value='profile'>
							<Card className='overflow-hidden shadow-xl'>
								<CardHeader className='px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-t-lg shadow-md'>
									<CardTitle className='text-2xl font-semibold text-white'>
										User Profile
									</CardTitle>
									<CardDescription className='text-sm text-gray-200 mt-2'>
										Manage your personal information
									</CardDescription>
								</CardHeader>

								<CardContent className='px-6 py-4'>
									<div className='flex items-center space-x-6 mb-6'>
										{/* Avatar Section */}
										<div className='relative'>
											<Avatar className='h-24 w-24 rounded-full border-4 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out'>
												<AvatarImage
													src={avatarPreview}
													alt='User Avatar'
													className='object-cover rounded-full transition-all duration-300 ease-in-out'
												/>
												<AvatarFallback className='font-semibold text-2xl text-gray-800'>
													{userProfile?.name &&
														getInitials(
															userProfile?.name
														)}
												</AvatarFallback>
											</Avatar>

											{/* Pencil Icon */}
											<div
												className='absolute bottom-0 right-0 bg-white border-2 border-gray-300 rounded-full p-2 cursor-pointer shadow-lg hover:bg-gray-100 hover:shadow-2xl transition-all duration-300 ease-in-out'
												onClick={() =>
													setIsEditingAvatar(true)
												}>
												<Pen className='text-gray-600 w-5 h-5' />
											</div>

											{/* File Input for Avatar Change */}
											{isEditingAvatar && (
												<input
													type='file'
													accept='image/*'
													className='absolute inset-0 opacity-0 cursor-pointer'
													onChange={
														handleAvatarChange
													}
													autoFocus
												/>
											)}
										</div>

										{/* Profile Information */}
										<div className='flex flex-col justify-center'>
											<h2 className='text-2xl font-semibold text-gray-900'>
												{userProfile?.name}
											</h2>
											<p className='text-gray-600 text-lg'>
												{userProfile?.email}
											</p>
										</div>
									</div>

									{/* Profile Form */}
									<UserProfileForm
										initialData={userProfile}
									/>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Room Settings Tab */}
						<TabsContent value='room'>
							<Card className='overflow-hidden shadow-xl'>
								<CardHeader className='px-6 py-4 bg-gradient-to-r from-green-500 to-green-700 rounded-t-lg shadow-md'>
									<CardTitle className='text-2xl font-semibold text-gray-800 antialiased'>
										Room Settings
									</CardTitle>
									<CardDescription className='text-sm text-gray-500 mt-2'>
										Manage your chat room settings
									</CardDescription>
								</CardHeader>

								<CardContent className='px-6 py-4'>
									<RoomSettingsForm
										initialData={roomSettings}
									/>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</main>
		</div>
	);
}
