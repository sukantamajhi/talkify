import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthSkeleton() {
	return (
		<div className='min-h-screen w-full bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center items-center p-6'>
			<header className='mb-12 flex items-center'>
				<Skeleton className='w-10 h-10 rounded-full mr-3' />
				<Skeleton className='h-10 w-28' />
			</header>

			<div className='w-full max-w-md bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6'>
				<div className='mb-6'>
					<Skeleton className='h-10 w-32 mb-2' />
					<Skeleton className='h-6 w-64' />
				</div>

				<div className='mb-6'>
					<Skeleton className='h-6 w-20 mb-2' />
					<Skeleton className='h-12 w-full rounded-lg' />
				</div>

				<div className='mb-6'>
					<Skeleton className='h-6 w-20 mb-2' />
					<Skeleton className='h-12 w-full rounded-lg' />
				</div>

				<div className='mb-6'>
					<Skeleton className='h-6 w-20 mb-2' />
					<div className='relative'>
						<Skeleton className='h-12 w-full rounded-lg' />
						<Skeleton className='absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-md' />
					</div>
				</div>

				<div className='flex items-center space-x-2 mb-6'>
					<Skeleton className='h-6 w-6 rounded-md' />
					<Skeleton className='h-6 w-32' />
				</div>

				<Skeleton className='h-12 w-full rounded-lg' />

				<div className='flex flex-col items-center mt-6'>
					<Skeleton className='h-6 w-48' />
				</div>
			</div>
		</div>
	);
}
