'use client';

import { getTripById } from '@/lib/firebase/trips';
import { db } from '@/lib/firebaseConfig';
import { confirmation } from '@/public/images';
import { TripWithDriver } from '@/types/trips.types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

type TripDoc = {
    isActive: boolean;
    availableSeats: number;
    participants?: string[];
};

function SuccessContent() {
    const params = useSearchParams();
    const tripId = params.get('tripId');
    const sessionId = params.get('session_id');
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const [trip, setTrip] = useState<TripWithDriver | null>(null);

    useEffect(() => {
        const loadTrip = async () => {
            if (!tripId) return;
            try {
                const tripData = await getTripById(tripId);
                setTrip(tripData);
            } catch (e) {
                console.error('Erreur lors du chargement du trajet:', e);
            }
        };
        loadTrip();
    }, [tripId]);

    useEffect(() => {
        const run = async () => {
            if (!tripId || !sessionId || done) return;
            try {
                const res = await fetch(`/api/stripe/session?id=${encodeURIComponent(sessionId)}`);
                const session = await res.json();
                if (!res.ok) throw new Error(session.error || 'Erreur session');
                if (session.payment_status !== 'paid') return;

                const tripRef = doc(db, 'trips', tripId);
                const tripSnap = await getDoc(tripRef);
                if (!tripSnap.exists()) return;
                const tripData = tripSnap.data() as TripDoc | undefined;
                if (!tripData) return;
                const buyerUid = session.metadata?.buyerUid as string | undefined;
                const quantity = Number(session.metadata?.quantity || '1');
                if (!buyerUid) return;
                if (!tripData.isActive || tripData.availableSeats < quantity) return;
                const participants = tripData.participants ?? [];
                if (participants.includes(buyerUid)) {
                    setDone(true);
                    return;
                }
                await updateDoc(tripRef, {
                    participants: [...participants, buyerUid],
                    availableSeats: tripData.availableSeats - quantity,
                    updatedAt: new Date(),
                    lastCheckoutSessionId: sessionId,
                });
                setDone(true);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Erreur');
            }
        };
        run();
    }, [tripId, sessionId, done]);

    return (
        <div className="min-h-screen bg-[var(--dark-green)] py-8">
            <div className="md:wrapper wrapper bg-[var(--white)] rounded-xl ">
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
                        Bravo ta réservation est confirmée !
                    </h1>
                </div>
                {error && (
                    <div className="px-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-center flex-col gap-4 px-6">
                    <Image src={confirmation} alt="confirmation" width={300} height={300} />
                    <p className="text-center text-gray-700 text-base mt-10">
                        Tu peux désormais discuter avec ta conductrice pour préparer ensemble votre
                        trajet.
                    </p>
                </div>
                <div className="flex justify-center px-6 mt-10">
                    <div className="rounded-xl shadow-sm border p-6 bg-[var(--pink)] max-w-md w-full mb-10">
                        <h4 className="text-xl font-semibold text-[var(--black)] mb-4">Contact</h4>
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
                                        {trip?.driver?.firstName || 'Conductrice'}
                                    </span>
                                    <span className="text-gray-600 font-light">
                                        {trip?.driver?.phoneNumber || 'Non disponible'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function JoinTripSuccessPage() {
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
