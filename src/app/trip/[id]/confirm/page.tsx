'use client';

import { RouteGuard } from '@/app/_components/route-guard';
import { useAuth } from '@/contexts/AuthContext';
import { getTripById } from '@/lib/firebase/trips';
import { db } from '@/lib/firebaseConfig';
import { confirmation } from '@/public/images';
import { Booking, BookingDoc, TripWithDriver } from '@/types/trips.types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, use, useEffect, useState } from 'react';

type PageProps = { params: Promise<{ id: string }> };
type ConfirmationState = 'loading' | 'ready' | 'confirming' | 'confirmed' | 'disputing' | 'disputed' | 'error';

const ConfirmContent = ({ tripId }: { tripId: string }) => {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { user } = useAuth();

    const [trip, setTrip] = useState<TripWithDriver | null>(null);
    const [booking, setBooking] = useState<Booking | null>(null);
    const [state, setState] = useState<ConfirmationState>('loading');
    const [error, setError] = useState('');

    const isDriver = user?.uid === trip?.driverId;
    const isPassenger = user?.uid === booking?.participantId;
    const role = isDriver ? 'driver' : 'passenger';

    useEffect(() => {
        const load = async () => {
            if (!tripId || !orderId) {
                setError('Paramètres manquants');
                setState('error');
                return;
            }

            try {
                const tripData = await getTripById(tripId);
                if (!tripData) {
                    setError('Trajet non trouvé');
                    setState('error');
                    return;
                }
                setTrip(tripData);

                const foundBooking = tripData.bookings?.find((b) => b.oderId === orderId);
                if (!foundBooking) {
                    setError('Réservation non trouvée');
                    setState('error');
                    return;
                }
                setBooking(foundBooking);
                setState('ready');
            } catch {
                setError('Erreur lors du chargement');
                setState('error');
            }
        };
        load();
    }, [tripId, orderId]);

    // Confirm booking - updates Firestore directly from client
    const handleConfirm = async () => {
        if (!user || !trip || !booking || !orderId) return;
        setState('confirming');

        try {
            const tripRef = doc(db, 'trips', tripId);
            const tripSnap = await getDoc(tripRef);
            if (!tripSnap.exists()) throw new Error('Trajet non trouvé');

            const tripData = tripSnap.data();
            const bookings = (tripData.bookings ?? []) as BookingDoc[];
            const bookingIndex = bookings.findIndex((b) => b.oderId === orderId);

            if (bookingIndex === -1) throw new Error('Réservation non trouvée');

            const currentBooking = bookings[bookingIndex];
            if (currentBooking.status !== 'authorized') {
                throw new Error('Réservation déjà traitée');
            }

            // Update confirmation timestamp
            const now = new Date();
            const updatedBooking = { ...currentBooking };

            if (isDriver) {
                updatedBooking.driverConfirmedAt = now;
            } else {
                updatedBooking.passengerConfirmedAt = now;
            }

            // Check if both confirmed
            const bothConfirmed = updatedBooking.driverConfirmedAt && updatedBooking.passengerConfirmedAt;

            if (bothConfirmed) {
                // Capture payment via API (Stripe needs server-side)
                const res = await fetch('/api/stripe/booking/capture-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentIntentId: currentBooking.paymentIntentId }),
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Erreur capture paiement');
                }
                updatedBooking.status = 'captured';
                updatedBooking.capturedAt = now;
            }

            // Update Firestore
            const updatedBookings = [...bookings];
            updatedBookings[bookingIndex] = updatedBooking;

            await updateDoc(tripRef, { bookings: updatedBookings, updatedAt: now });

            setBooking(updatedBooking as Booking);
            setState('confirmed');
        } catch (err) {
            console.error('Confirm error:', err);
            setError(err instanceof Error ? err.message : 'Erreur');
            setState('error');
        }
    };

    // Dispute booking - updates Firestore directly from client
    const handleDispute = async () => {
        if (!user || !trip || !booking || !orderId) return;
        setState('disputing');

        try {
            const tripRef = doc(db, 'trips', tripId);
            const tripSnap = await getDoc(tripRef);
            if (!tripSnap.exists()) throw new Error('Trajet non trouvé');

            const tripData = tripSnap.data();
            const bookings = (tripData.bookings ?? []) as BookingDoc[];
            const bookingIndex = bookings.findIndex((b) => b.oderId === orderId);

            if (bookingIndex === -1) throw new Error('Réservation non trouvée');

            const currentBooking = bookings[bookingIndex];
            if (currentBooking.status !== 'authorized') {
                throw new Error('Réservation déjà traitée');
            }

            // Mark as disputed
            const now = new Date();
            const updatedBooking: BookingDoc = {
                ...currentBooking,
                status: 'disputed',
                disputedAt: now,
                disputedBy: role,
            };

            const updatedBookings = [...bookings];
            updatedBookings[bookingIndex] = updatedBooking;

            await updateDoc(tripRef, { bookings: updatedBookings, updatedAt: now });

            // Send dispute notification to admin
            const disputerName = isDriver ? trip.driver?.firstName : user.displayName || 'Utilisatrice';
            fetch('/api/email/dispute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tripId,
                    orderId,
                    disputedBy: role,
                    disputerName,
                    tripInfo: `${trip.departureCity} → ${trip.arrivalCity} (${trip.departureDate})`,
                }),
            }).catch((e) => console.error('[EMAIL] Failed:', e));

            setBooking(updatedBooking as Booking);
            setState('disputed');
        } catch (err) {
            console.error('Dispute error:', err);
            setError(err instanceof Error ? err.message : 'Erreur');
            setState('error');
        }
    };

    const canInteract = isDriver || isPassenger;
    const alreadyConfirmed = isDriver ? booking?.driverConfirmedAt : booking?.passengerConfirmedAt;
    const bookingStatus = booking?.status;

    if (state === 'loading') {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4" />
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (state === 'error' || !trip || !booking) {
        return (
            <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <p className="text-red-600 mb-4">{error || 'Erreur'}</p>
                <Link href="/join-trip" className="text-[var(--pink)] hover:underline">
                    Retour aux trajets
                </Link>
            </div>
        );
    }

    if (!canInteract) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-600 mb-4">Vous n&apos;êtes pas autorisé à confirmer cette réservation.</p>
                <Link href={`/trip/${tripId}`} className="text-[var(--pink)] hover:underline">
                    Voir le trajet
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6 text-center">
                <Link href={`/trip/${tripId}`} className="flex items-center gap-2 mb-4 hover:text-[var(--pink)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour au trajet
                </Link>
                <h1 className="text-3xl font-staatliches text-[var(--black)]">Confirmation du trajet</h1>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="font-medium text-lg">{trip.departureCity} → {trip.arrivalCity}</p>
                <p className="text-gray-600">{trip.departureDate} à {trip.departureTime}</p>
                <p className="text-gray-600">{trip.pricePerSeat}€ par place</p>
            </div>

            {bookingStatus === 'captured' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-green-800 font-medium">Paiement confirmé !</p>
                    <p className="text-green-700 text-sm mt-1">Le trajet a été validé par les deux parties.</p>
                </div>
            )}

            {bookingStatus === 'disputed' && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-orange-800 font-medium">Litige signalé</p>
                    <p className="text-orange-700 text-sm mt-1">Notre équipe va examiner la situation.</p>
                </div>
            )}

            {bookingStatus === 'cancelled' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
                    <p className="text-red-800 font-medium">Réservation annulée</p>
                </div>
            )}

            {bookingStatus === 'authorized' && (
                <>
                    {alreadyConfirmed ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-blue-800 font-medium">Vous avez confirmé !</p>
                            <p className="text-blue-700 text-sm mt-1">
                                En attente de la confirmation de {isDriver ? 'la voyageuse' : 'la conductrice'}.
                            </p>
                        </div>
                    ) : state === 'confirmed' ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
                            <Image src={confirmation} alt="confirmation" width={200} height={200} className="mx-auto mb-4" />
                            <p className="text-green-800 font-medium">Confirmation enregistrée !</p>
                        </div>
                    ) : state === 'disputed' ? (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-center">
                            <p className="text-orange-800 font-medium">Problème signalé</p>
                            <p className="text-orange-700 text-sm mt-1">Notre équipe vous contactera rapidement.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-gray-700 text-center mb-6">
                                {isDriver
                                    ? 'Confirmez que le trajet avec cette voyageuse s\'est bien passé.'
                                    : 'Confirmez que votre trajet s\'est bien passé.'}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleDispute}
                                    disabled={state === 'disputing'}
                                    className="w-full bg-white border-2 border-red-400 text-red-600 py-3 px-6 rounded-xl font-medium hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {state === 'disputing' ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600" />
                                            Envoi...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            Signaler un problème
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={state === 'confirming'}
                                    className="w-full bg-[var(--dark-green)] text-white py-3 px-6 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {state === 'confirming' ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                            Confirmation...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Tout s&apos;est bien passé
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-4">
                                Sans action de votre part, le paiement sera automatiquement validé 24h après le trajet.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default function TripConfirmPage({ params }: PageProps) {
    const { id } = use(params);

    return (
        <RouteGuard requireAuth={true} requireVerified={true}>
            <div className="min-h-screen bg-[var(--dark-green)] py-8">
                <div className="md:wrapper wrapper bg-[var(--white)] rounded-xl max-w-lg mx-auto">
                    <Suspense
                        fallback={
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
                            </div>
                        }
                    >
                        <ConfirmContent tripId={id} />
                    </Suspense>
                </div>
            </div>
        </RouteGuard>
    );
}
