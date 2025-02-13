"use client";

import { useState } from "react";
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
import { MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function AuthPage() {
	const { toast } = useToast();
	const router = useRouter();

	const [isLogin, setIsLogin] = useState(true);
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Form submitted:", { name, email, password, rememberMe });
		try {
			setLoading(true);
			if (!isLogin) {
				const response = await axios.post("/auth/register", {
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
					document.cookie = `token=${response.data.token}; path=/; max-age=86400`;
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
		<div className='min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4'>
			<header className='mb-8 flex items-center'>
				<MessageCircle className='w-8 h-8 text-primary mr-2' />
				<h1 className='text-2xl font-bold text-primary'>Talkify</h1>
			</header>
			<Card className='w-full max-w-md'>
				<CardHeader>
					<CardTitle>{isLogin ? "Login" : "Sign Up"}</CardTitle>
					<CardDescription>
						{isLogin
							? "Enter your credentials to access your account"
							: "Create an account to get started"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						{!isLogin && (
							<div className='mb-4'>
								<Label htmlFor='name'>Name</Label>
								<Input
									id='name'
									type='text'
									placeholder='Enter your name'
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
								/>
							</div>
						)}
						<div className='mb-4'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								placeholder='Enter your email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className='mb-4'>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								type='password'
								placeholder='Enter your password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						{isLogin && (
							<div className='flex items-center space-x-2 mb-4'>
								<Checkbox
									id='remember'
									checked={rememberMe}
									onCheckedChange={(checked) =>
										setRememberMe(checked as boolean)
									}
								/>
								<Label htmlFor='remember'>Remember me</Label>
							</div>
						)}
						<Button type='submit' className='w-full'>
							{isLogin ? "Login" : "Sign Up"}
						</Button>
					</form>
				</CardContent>
				<CardFooter className='flex flex-col items-center'>
					<div className='mb-4'>
						<Button variant='outline' className='mr-2'>
							Google
						</Button>
						<Button variant='outline'>Facebook</Button>
					</div>
					<Button variant='link' onClick={() => setIsLogin(!isLogin)}>
						{isLogin
							? "Don't have an account? Sign Up"
							: "Already have an account? Login"}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
