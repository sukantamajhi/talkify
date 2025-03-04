import type {Metadata} from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// const geistSans = Geist({
// 	variable: "--font-geist-sans",
// 	subsets: ["latin"],
// });
//
// const geistMono = Geist_Mono({
// 	variable: "--font-geist-mono",
// 	subsets: ["latin"],
// });

export const metadata: Metadata = {
	title: "Talkify",
	description:
		"Talkify is a dynamic chat platform that allows seamless communication with real-time messaging, rich media sharing, and interactive features. Connect, collaborate, and engage effortlessly with friends, colleagues, or communities.",
};

export default function RootLayout({
	                                   children,
                                   }: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
		<body
			className={`antialiased bg-white dark:bg-gray-900 text-black dark:text-white`}>
		{children}
		</body>
		</html>
	);
}
