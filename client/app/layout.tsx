import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

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
		<html lang='en' className={inter.variable}>
			<body
				className={`antialiased bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen`}>
				{children}
			</body>
		</html>
	);
}
