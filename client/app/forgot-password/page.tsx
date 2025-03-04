"use client";

import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {CheckCircle2, Mail, MessageCircle} from "lucide-react";
import Link from "next/link";
import type React from "react";
import {useState} from "react";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [isResent, setIsResent] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleResendEmail = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		// Simulate API call to resend verification email
		await new Promise((resolve) => setTimeout(resolve, 1500));
		setIsResent(true);
		setIsLoading(false);
	};

	return (
		<div
			className="min-h-screen bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex-grow flex flex-col items-center justify-center">
			<main className="flex-grow flex flex-col items-center justify-center p-4">
				<header className="mb-12 flex items-center">
					<MessageCircle className="w-10 h-10 text-primary dark:text-white mr-3"/>
					<Link href={"/"} passHref>
						<h1 className="text-4xl font-extrabold text-primary dark:text-white">
							Talkify
						</h1>
					</Link>
				</header>

				<Card className="w-full max-w-md bg-white dark:bg-gray-900 shadow-lg rounded-2xl">
					<CardHeader className="pb-6">
						<CardTitle className="text-3xl font-semibold text-gray-900 dark:text-white text-center">
							Verify Your Email
						</CardTitle>
						<CardDescription className="text-gray-500 dark:text-gray-400 text-lg text-center">
							We&#39;ve sent a verification email to your inbox. Please check and
							verify your email to continue.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex justify-center">
							<Mail className="w-16 h-16 text-primary"/>
						</div>
						{isResent && (
							<Alert variant="default">
								<CheckCircle2 className="h-4 w-4"/>
								<AlertTitle>Email Resent</AlertTitle>
								<AlertDescription>
									We&#39;ve resent the verification email. Please check your inbox.
								</AlertDescription>
							</Alert>
						)}
						<form onSubmit={handleResendEmail}>
							<div className="space-y-2">
								<Label
									htmlFor="email"
									className="text-lg font-medium dark:text-white"
								>
									Email address
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="Enter your email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="mt-2 p-3 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
								/>
							</div>
							<Button
								type="submit"
								className="w-full py-3 mt-4 bg-gradient-to-r from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800 text-white rounded-lg font-semibold text-lg transition-all duration-300 hover:from-indigo-600 hover:to-indigo-800 transform hover:scale-105"
								disabled={isLoading}
							>
								{isLoading ? "Sending..." : "Send Verification Email"}
							</Button>
						</form>
					</CardContent>
					<CardFooter className="flex justify-center mt-6">
						<p className="text-sm text-muted-foreground">
							Didn&apos;t receive an email? Check your spam folder or{" "}
							<Link
								href="/contact"
								className="text-indigo-600 dark:text-indigo-400 hover:underline"
							>
								contact support
							</Link>
							.
						</p>
					</CardFooter>
				</Card>
			</main>

			<footer className="w-full p-4 bg-white border-t text-center text-sm text-muted-foreground">
				© 2025 Talkify. All rights reserved.
			</footer>
		</div>
	);
}
