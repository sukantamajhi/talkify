"use client";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import axios from "@/lib/axios";
import {isResSuccess} from "@/lib/utils";
import {CheckCircle, Loader2, MessageCircle, XCircle} from "lucide-react";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";

const VerifyEmailPage = () => {
	const params = useSearchParams();
	const token = params.get("token");
	const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading");
	const [timer, setTimer] = useState(3); // Timer set to 3 seconds
	const router = useRouter();

	useEffect(() => {
		const verifyEmail = async () => {
			try {
				if (!token) return; // Guard clause for invalid token
				const response = await axios.post("/auth/email-verification", {
					token,
				});

				if (isResSuccess(response)) {
					setVerificationStatus("success");
					const countdown = setInterval(() => {
						setTimer((prevTimer) => {
							if (prevTimer <= 1) {
								clearInterval(countdown);
								router.push("/login"); // Redirect after timer reaches 0
								return 0;
							}
							return prevTimer - 1;
						});
					}, 1000);
				} else {
					setVerificationStatus("error");
				}
			} catch (error) {
				console.error("Email verification failed:", error);
				setVerificationStatus("error");
			}
		};

		verifyEmail();
	}, [token, router]);

	return (
		<div
			className="min-h-screen bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center items-center p-6 space-y-8">
			{/* Header Section */}
			<header className='mb-12 flex items-center'>
				<MessageCircle className='w-10 h-10 text-primary dark:text-white mr-3'/>
				<h1 className='text-4xl font-extrabold text-primary dark:text-white'>
					Talkify
				</h1>
			</header>

			{/* Email Verification Card */}
			<Card
				className="w-full max-w-lg bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 transform transition-transform duration-500">
				<CardHeader className="pb-6 text-center">
					<CardTitle className="text-3xl font-semibold text-gray-900 dark:text-white">
						Email Verification
					</CardTitle>
					<CardDescription className="text-lg text-gray-500 dark:text-gray-400 mt-2">
						{verificationStatus === "loading" && "Verifying your email..."}
						{verificationStatus === "success" && "Your email has been verified!"}
						{verificationStatus === "error" && "Email verification failed."}
					</CardDescription>
				</CardHeader>

				<CardContent className="flex flex-col items-center space-y-6">
					{verificationStatus === "loading" && (
						<div className="flex flex-col items-center animate-pulse">
							<Loader2 className="h-16 w-16 text-indigo-500 animate-spin"/>
							<p className="mt-4 text-lg text-gray-600 dark:text-gray-200">Please hold on while we verify
								your email.</p>
						</div>
					)}
					{verificationStatus === "success" && (
						<>
							<CheckCircle className="h-16 w-16 text-green-500"/>
							<p className="text-center text-gray-600 dark:text-gray-200">
								Your email has been successfully verified! You will be redirected to the login page
								soon.
							</p>
							<p className="text-center text-lg text-gray-600 dark:text-gray-200">
								Redirecting in {timer} second{timer !== 1 ? "s" : ""}
							</p>
							<div className="text-gray-600 dark:text-gray-200 mt-4 text-sm text-left space-y-2">
								<p>What’s next?</p>
								<ul className="list-disc pl-6">
									<li>Login to your account using your credentials.</li>
									<li>If you encounter any issues, feel free to contact our support team.</li>
								</ul>
							</div>
						</>
					)}
					{verificationStatus === "error" && (
						<>
							<XCircle className="h-16 w-16 text-red-500"/>
							<p className="text-center text-gray-600 dark:text-gray-200">
								Something went wrong. Please try again or contact support.
							</p>
							<div className="text-gray-600 dark:text-gray-200 mt-4 text-sm text-left space-y-2">
								<p>Possible reasons for failure:</p>
								<ul className="list-disc pl-6">
									<li>Token might have expired.</li>
									<li>The link might have been already used.</li>
									<li>Technical issues on our end.</li>
								</ul>
								<p>If you're still having trouble, reach out to our support team.</p>
							</div>
							<Button
								onClick={() => router.push("/")}

								className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800 text-white rounded-lg font-semibold text-lg transition-all duration-300 hover:from-indigo-600 hover:to-indigo-800 transform hover:scale-105"
							>
								Go to Register
							</Button>
						</>
					)}
				</CardContent>
			</Card>

			{/* Footer section with help link */}
			<div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
				<p>
					Need help? <a href="/contact" className="text-indigo-500">Contact Support</a>
				</p>
			</div>
		</div>
	);
};

export default VerifyEmailPage;
