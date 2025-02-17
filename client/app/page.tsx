"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeIcon, EyeOffIcon, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import {
	getLocalStorageValue,
	isClient,
	setLocalStorageValue,
} from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

export default function AuthPage() {
	const { toast } = useToast();
	const router = useRouter();
	const token = isClient && getLocalStorageValue("token");

	const [isLogin, setIsLogin] = useState(true);
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [passwordVisible, setPasswordVisible] = useState(false); // Password visibility toggle state

	useEffect(() => {
		if (token) {
			router.push("/chat");
		}
	}, [router, token]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Form submitted:", { name, email, password, rememberMe });
		try {
			setLoading(true);
			if (!isLogin) {
				await axios.post("/auth/register", {
					name,
					email,
					password,
				});
				setIsLogin(true);
			} else {
				const response = await axios.post("/auth/login", {
					email,
					password,
					rememberMe,
				});

				if (response.data.token) {
					// save token to cookie
					setLocalStorageValue("token", response.data.token);
					setLocalStorageValue("userId", response.data.data.id);
					localStorage.setItem("username", response.data.data.name);
					localStorage.setItem(
						"selfRoomId",
						response.data.data.userName
					);
					// navigate to chat
					router.push("/chat");
				}
			}
		} catch (error: any) {
			console.error(error, "<<-- Error in user registration");
			toast({
				variant: "destructive",
				description:
					error?.response?.data?.message || "Something went wrong",
				duration: 3000,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center items-center p-6'>
			<header className='mb-12 flex items-center'>
				<MessageCircle className='w-10 h-10 text-primary dark:text-white mr-3' />
				<h1 className='text-4xl font-extrabold text-primary dark:text-white'>
					Talkify
				</h1>
			</header>

			<Card className='w-full max-w-md bg-white dark:bg-gray-900 shadow-lg rounded-2xl'>
				<CardHeader className='pb-6'>
					<CardTitle className='text-3xl font-semibold text-gray-900 dark:text-white'>
						{isLogin ? "Login" : "Sign Up"}
					</CardTitle>
					<CardDescription className='text-gray-500 dark:text-gray-400 text-lg'>
						{isLogin
							? "Enter your credentials to access your account"
							: "Create an account to get started"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						{!isLogin && (
							<div className='mb-6'>
								<Label
									htmlFor='name'
									className='text-lg font-medium dark:text-white'>
									Name
								</Label>
								<Input
									id='name'
									type='text'
									placeholder='Enter your name'
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									className='mt-2 p-3 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200'
								/>
							</div>
						)}

						<div className='mb-6'>
							<Label
								htmlFor='email'
								className='text-lg font-medium dark:text-white'>
								Email
							</Label>
							<Input
								id='email'
								type='email'
								placeholder='Enter your email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className='mt-2 p-3 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200'
							/>
						</div>

						<div className='mb-6'>
							<Label
								htmlFor='password'
								className='text-lg font-medium dark:text-white'>
								Password
							</Label>
							<div className='relative'>
								<Input
									id='password'
									type={passwordVisible ? "text" : "password"}
									placeholder='Enter your password'
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									required
									className='mt-2 p-3 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200'
								/>
								<div
									className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer'
									onClick={() =>
										setPasswordVisible(!passwordVisible)
									}>
									{passwordVisible ? (
										<EyeOffIcon className='w-6 h-6 text-blue-800 dark:text-gray-300' />
									) : (
										<EyeIcon className='w-6 h-6 text-blue-800 dark:text-gray-300' />
									)}
								</div>
							</div>
						</div>

						{isLogin && (
							<div className='flex items-center space-x-2 mb-6'>
								<Checkbox
									id='remember'
									checked={rememberMe}
									onCheckedChange={(checked) =>
										setRememberMe(checked as boolean)
									}
									className='text-indigo-600 dark:text-indigo-400'
								/>
								<Label
									htmlFor='remember'
									className='text-gray-700 dark:text-gray-300'>
									Remember me
								</Label>
							</div>
						)}

						<Button
							type='submit'
							disabled={loading}
							className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800 text-white rounded-lg font-semibold text-lg transition-all duration-300 hover:from-indigo-600 hover:to-indigo-800 transform hover:scale-105'>
							{loading
								? "Loading..."
								: isLogin
								? "Login"
								: "Sign Up"}
						</Button>
					</form>
				</CardContent>

				<CardFooter className='flex flex-col items-center mt-6'>
					<Button
						variant='link'
						onClick={() => setIsLogin(!isLogin)}
						className='text-indigo-600 dark:text-indigo-400 hover:underline text-lg'>
						{isLogin
							? "Don't have an account? Sign Up"
							: "Already have an account? Login"}
					</Button>
				</CardFooter>
			</Card>

			<Toaster />
		</div>
	);
}
