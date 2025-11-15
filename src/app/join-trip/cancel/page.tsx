'use client';

import { getTripById } from '@/lib/firebase/trips';
import { TripWithDriver } from '@/types/trips.types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function CancelContent() {
    const searchParams = useSearchParams();
    const tripId = searchParams.get('tripId');
    const [trip, setTrip] = useState<TripWithDriver | null>(null);
    const [loadingTrip, setLoadingTrip] = useState(true);

    useEffect(() => {
        const loadTrip = async () => {
            if (!tripId) {
                setLoadingTrip(false);
                return;
            }
            try {
                const tripData = await getTripById(tripId);
                setTrip(tripData);
            } catch (e) {
                console.error('Erreur lors du chargement du trajet:', e);
            } finally {
                setLoadingTrip(false);
            }
        };
        loadTrip();
    }, [tripId]);

    return (
        <div className="min-h-screen bg-[var(--dark-green)] py-8">
            <div className="md:wrapper wrapper bg-[var(--white)] rounded-xl">
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
                        Paiement annulé
                    </h1>
                </div>

                {/* Error messages */}
                <div className="px-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg
                                    className="w-4 h-4 text-yellow-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                                    Paiement interrompu
                                </h3>
                                <p className="text-sm text-yellow-700">
                                    Aucun montant n&apos;a été débité. Votre réservation n&apos;a
                                    pas été confirmée.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center flex-col gap-4 px-6">
                    <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-16 h-16 text-yellow-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <p className="text-center text-gray-700 text-base mt-4">
                        Tu peux réessayer de réserver ce trajet ou en choisir un autre.
                    </p>
                </div>

                {/* Contact section */}
                {trip && (
                    <div className="flex justify-center px-6 mt-10">
                        <div className="rounded-xl shadow-sm border border-black p-8 bg-[var(--pink)] max-w-md w-full">
                            <h4 className="text-xl font-semibold text-[var(--black)] mb-4">
                                Contact
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-[var(--blue)] rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-4 h-4 text-[var(--white)]"
                                            fill="currentColor"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col gap-1 ml-2">
                                        <span className="text-[var(--black)] font-medium text-base">
                                            {trip.driver.firstName}
                                        </span>
                                        <span className="text-gray-600 font-light">
                                            {trip.driver.phoneNumber || 'Non disponible'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {loadingTrip && tripId && (
                    <div className="flex justify-center px-6 mt-10">
                        <div className="rounded-xl shadow-sm border border-black p-8 bg-[var(--pink)] max-w-md w-full">
                            <div className="animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                    <div className="flex flex-col gap-2">
                                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-center gap-4 px-6 mt-8 pb-12">
                    {tripId ? (
                        <Link
                            href={`/trip/${tripId}`}
                            className="bg-[var(--yellow)] hover:bg-[var(--yellow)]/90 text-[var(--black)] py-3 px-6 rounded-lg font-medium transition-colors"
                        >
                            Retour au trajet
                        </Link>
                    ) : (
                        <Link
                            href="/join-trip"
                            className="bg-[var(--yellow)] hover:bg-[var(--yellow)]/90 text-[var(--black)] py-3 px-6 rounded-lg font-medium transition-colors"
                        >
                            Retour aux trajets
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function JoinTripCancelPage() {
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
            <CancelContent />
        </Suspense>
    );
}
