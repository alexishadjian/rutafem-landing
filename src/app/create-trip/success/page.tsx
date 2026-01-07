'use client';

import { confirmation } from '@/public/images';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[var(--dark-green)] py-8">
            <div className="md:wrapper wrapper bg-[var(--white)] rounded-xl mt-14">
                {/* Header */}
                <div className="mb-4 p-6 text-center">
                    <Link
                        href="/join-trip"
                        className="flex items-center gap-4 mb-4 hover:text-[var(--pink)]"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Retour aux trajets
                    </Link>
                    <h1 className="text-4xl text-[var(--black)] font-staatliches tracking-wide mt-8">
                        Bravo ton trajet est publié !
                    </h1>
                </div>
                <div className="flex items-center justify-center flex-col gap-4 px-6">
                    <Image src={confirmation} alt="confirmation" width={300} height={300} />
                </div>
                <div className="flex justify-center px-6 mt-10">
                    <button
                        onClick={() => router.push('/auth/profile')}
                        className="order-1 sm:order-2 mb-10 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base bg-[var(--pink)] opacity-90 hover:opacity-100 rounded-lg"
                    >
                        Voir mes trajets →
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CreateTripSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[var(--dark-green)] py-8">
                    <div className="md:wrapper wrapper bg-[var(--white)] rounded-xl">
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Chargement...</p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <SuccessContent />
        </Suspense>
    );
}
