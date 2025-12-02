'use client';

import { getTripById } from '@/lib/firebase/trips';
import { db } from '@/lib/firebaseConfig';
import { confirmation } from '@/public/images';
import { TripWithDriver } from '@/types/trips.types';
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

type TripDoc = {
    isActive: boolean;
    availableSeats: number;
    participants: string[];
    bookings?: { oderId: string; participantId: string }[];
};

const SuccessContent = () => {
    const params = useSearchParams();
    const tripId = params.get('tripId');
    const sessionId = params.get('session_id');

    const [trip, setTrip] = useState<TripWithDriver | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [synced, setSynced] = useState(false);

    // Sync booking if webhook didn't work
    useEffect(() => {
        const syncBooking = async () => {
            console.log('[DEBUG] Starting sync...', { tripId, sessionId, synced });

            if (!tripId || !sessionId || synced) {
                console.log('[DEBUG] Skipping sync - missing params or already synced');
                return;
            }

            try {
                // Get session data from Stripe
                console.log('[DEBUG] Fetching Stripe session...');
                const res = await fetch(`/api/stripe/session?id=${encodeURIComponent(sessionId)}`);
                const session = await res.json();
                console.log('[DEBUG] Stripe session:', session);

                if (!res.ok) {
                    console.error('[DEBUG] Session fetch failed:', session.error);
                    return;
                }

                // With capture_method: 'manual', check if payment_intent exists (means checkout completed)
                if (!session.payment_intent) {
                    console.log('[DEBUG] No payment_intent yet - checkout not completed');
                    return;
                }
                console.log('[DEBUG] PaymentIntent found:', session.payment_intent);

                const metadata = session.metadata || {};
                console.log('[DEBUG] Session metadata:', metadata);

                const { buyerUid, orderId, amountCents, quantity = '1' } = metadata;

                if (!buyerUid || !orderId) {
                    console.error('[DEBUG] Missing buyerUid or orderId in metadata');
                    return;
                }

                const paymentIntentId = session.payment_intent as string;
                console.log('[DEBUG] PaymentIntent ID:', paymentIntentId);

                // Check if booking already exists
                console.log('[DEBUG] Fetching trip from Firestore...');
                const tripRef = doc(db, 'trips', tripId);
                const tripSnap = await getDoc(tripRef);

                if (!tripSnap.exists()) {
                    console.error('[DEBUG] Trip not found in Firestore');
                    return;
                }

                const tripData = tripSnap.data() as TripDoc;
                console.log('[DEBUG] Trip data:', {
                    isActive: tripData.isActive,
                    availableSeats: tripData.availableSeats,
                    participants: tripData.participants,
                    bookingsCount: tripData.bookings?.length ?? 0,
                });

                // Check if already synced
                const bookingExists = (tripData.bookings ?? []).some((b) => b.oderId === orderId);
                const participantExists = tripData.participants.includes(buyerUid);
                console.log('[DEBUG] Already exists?', { bookingExists, participantExists });

                if (bookingExists || participantExists) {
                    console.log('[DEBUG] Booking already exists, skipping');
                    setSynced(true);
                    return;
                }

                // Validate trip is still bookable
                if (!tripData.isActive) {
                    console.error('[DEBUG] Trip is not active');
                    return;
                }
                if (tripData.availableSeats < Number(quantity)) {
                    console.error('[DEBUG] Not enough seats');
                    return;
                }

                // Create booking
                const newBooking = {
                    oderId: orderId,
                    participantId: buyerUid,
                    paymentIntentId,
                    status: 'authorized',
                    amountCents: Number(amountCents),
                    createdAt: new Date(),
                };
                console.log('[DEBUG] Creating booking:', newBooking);

                await updateDoc(tripRef, {
                    participants: arrayUnion(buyerUid),
                    availableSeats: tripData.availableSeats - Number(quantity),
                    bookings: arrayUnion(newBooking),
                    updatedAt: new Date(),
                });

                console.log('[DEBUG] ✅ Booking created successfully!');
                setSynced(true);
            } catch (err) {
                console.error('[DEBUG] Sync error:', err);
                setError('Erreur lors de la synchronisation');
            }
        };

        syncBooking();
    }, [tripId, sessionId, synced]);

    // Load trip data after sync
    useEffect(() => {
        const loadTrip = async () => {
            if (!tripId) {
                setLoading(false);
                return;
            }

            // Wait a bit for sync to complete
            await new Promise((resolve) => setTimeout(resolve, 500));

            try {
                const tripData = await getTripById(tripId);
                setTrip(tripData);
            } catch (e) {
                console.error('Erreur lors du chargement du trajet:', e);
            } finally {
                setLoading(false);
            }
        };

        loadTrip();
    }, [tripId, synced]);

    return (
        <div className="min-h-screen bg-[var(--dark-green)] py-8">
            <div className="md:wrapper wrapper bg-[var(--white)] rounded-xl">
                {/* Header */}
                <div className="mb-4 p-6 text-center">
                    <Link href="/join-trip" className="flex items-center gap-4 mb-4 hover:text-[var(--pink)]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour aux trajets
                    </Link>
                    <h1 className="text-4xl text-[var(--black)] font-staatliches tracking-wide mt-8">
                        Bravo ta réservation est confirmée !
                    </h1>
                </div>

                {error && (
                    <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                <div className="flex items-center justify-center flex-col gap-4 px-6">
                    <Image src={confirmation} alt="confirmation" width={300} height={300} />
                    <p className="text-center text-gray-700 text-base mt-10">
                        Tu peux désormais discuter avec ta conductrice pour préparer ensemble votre trajet.
                    </p>
                    <p className="text-center text-gray-500 text-sm">
                        Après le trajet, tu recevras un lien pour confirmer que tout s&apos;est bien passé.
                    </p>
                </div>

                {/* Contact section */}
                {loading ? (
                    <div className="flex justify-center px-6 mt-10">
                        <div className="rounded-xl shadow-sm border p-6 bg-[var(--pink)] max-w-md w-full mb-10 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-24 mb-4" />
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                <div className="flex flex-col gap-2">
                                    <div className="h-4 bg-gray-200 rounded w-32" />
                                    <div className="h-4 bg-gray-200 rounded w-40" />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : trip ? (
                    <div className="flex justify-center px-6 mt-10">
                        <div className="rounded-xl shadow-sm border p-6 bg-[var(--pink)] max-w-md w-full mb-10">
                            <h4 className="text-xl font-semibold text-[var(--black)] mb-4">Contact</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-[var(--blue)] rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-[var(--white)]" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col gap-1 ml-2">
                                        <span className="text-[var(--black)] font-medium text-base">
                                            {trip.driver?.firstName || 'Conductrice'}
                                        </span>
                                        <span className="text-gray-600 font-light">
                                            {trip.driver?.phoneNumber || 'Non disponible'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default function JoinTripSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[var(--dark-green)] py-8">
                    <div className="md:wrapper wrapper bg-[var(--white)] rounded-xl">
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4" />
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
