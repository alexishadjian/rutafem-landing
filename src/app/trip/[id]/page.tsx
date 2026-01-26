'use client';

import { ReviewsSection } from '@/app/_components/reviews-section';
import { RouteGuard } from '@/app/_components/route-guard';
import { useAuth } from '@/contexts/AuthContext';
import { getReviewsByUserId } from '@/lib/firebase/reviews';
import { getTripById } from '@/lib/firebase/trips';
import { db } from '@/lib/firebaseConfig';
import { fetchParticipantsDetails, startTripCheckout } from '@/services/trips';
import { Review } from '@/types/reviews.types';
import { BookingDoc, TripWithDriver } from '@/types/trips.types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { TripActions } from './_components/trip-actions';
import { TripAlert } from './_components/trip-alert';
import { TripContact } from './_components/trip-contact';
import { TripInfo } from './_components/trip-info';

type TripDetailsPageProps = {
    params: Promise<{ id: string }>;
};

export default function TripDetailsPage({ params }: TripDetailsPageProps) {
    const { user, userProfile } = useAuth();
    const resolvedParams = use(params);

    const [trip, setTrip] = useState<TripWithDriver | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [participants, setParticipants] = useState<
        {
            id: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
            email: string;
        }[]
    >([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch trip data
    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const tripData = await getTripById(resolvedParams.id);
                if (!tripData) {
                    setError('Trajet non trouvé');
                    return;
                }
                setTrip(tripData);
            } catch (err) {
                console.error('Erreur lors du chargement du trajet:', err);
                setError('Erreur lors du chargement du trajet');
            } finally {
                setLoading(false);
            }
        };
        fetchTrip();
    }, [resolvedParams.id]);

    // Fetch participants for everyone
    useEffect(() => {
        const fetchParticipants = async () => {
            if (!trip || trip.participants.length === 0) return;

            setLoadingParticipants(true);
            try {
                const participantsInfo = await fetchParticipantsDetails(trip);
                setParticipants(participantsInfo);
            } catch (err) {
                console.error('Erreur lors du chargement des participants:', err);
            } finally {
                setLoadingParticipants(false);
            }
        };
        fetchParticipants();
    }, [trip]);

    // Fetch driver reviews
    useEffect(() => {
        if (!trip?.driver.id) return;

        let isMounted = true;
        const fetchReviews = async () => {
            setLoadingReviews(true);
            try {
                const driverReviews = await getReviewsByUserId(trip.driver.id);
                if (isMounted) setReviews(driverReviews);
            } catch (err) {
                console.error('Erreur lors du chargement des avis:', err);
            } finally {
                if (isMounted) setLoadingReviews(false);
            }
        };
        fetchReviews();
        return () => {
            isMounted = false;
        };
    }, [trip?.driver.id]);

    // Join trip handler
    const handleJoinTrip = async () => {
        if (!user || !trip) return;

        setJoining(true);
        setError('');
        setSuccess('');

        try {
            const { url } = await startTripCheckout(trip, user.uid);
            window.location.href = url;
        } catch (err) {
            console.error('Erreur lors de la création du paiement:', err);
            setError(err instanceof Error ? err.message : 'Erreur lors de la création du paiement');
        } finally {
            setJoining(false);
        }
    };

    // leave a trip (cancel booking with refund) - Firestore update done client-side
    const handleLeaveTrip = async () => {
        if (!user || !trip) return;

        // Find user's active booking
        const userBooking = trip.bookings?.find(
            (b) => b.participantId === user.uid && b.status === 'authorized',
        );
        if (!userBooking) {
            setError('Réservation non trouvée');
            return;
        }

        setLeaving(true);
        setError('');
        setSuccess('');

        try {
            // 1. Cancel PaymentIntent on Stripe
            const res = await fetch('/api/stripe/booking/cancel-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentIntentId: userBooking.paymentIntentId }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur annulation paiement');
            }

            // 2. Update Firestore (client-side where user is authenticated)
            const tripRef = doc(db, 'trips', trip.id);
            const tripSnap = await getDoc(tripRef);
            if (!tripSnap.exists()) throw new Error('Trajet non trouvé');

            const tripData = tripSnap.data();
            const bookings = (tripData.bookings ?? []) as BookingDoc[];
            const bookingIndex = bookings.findIndex((b) => b.oderId === userBooking.oderId);

            if (bookingIndex !== -1) {
                const now = new Date();
                bookings[bookingIndex] = {
                    ...bookings[bookingIndex],
                    status: 'cancelled',
                    cancelledAt: now,
                };

                await updateDoc(tripRef, {
                    bookings,
                    participants: tripData.participants.filter((p: string) => p !== user.uid),
                    availableSeats: tripData.availableSeats + 1,
                    updatedAt: now,
                });
            }

            // Send cancellation email to driver
            if (trip.driver?.email) {
                fetch('/api/email/cancellation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        recipientEmail: trip.driver.email,
                        recipientName: trip.driver.firstName,
                        cancellerName: userProfile?.firstName || 'Une passagère',
                        cancellerRole: 'passenger',
                        tripId: trip.id,
                        departureCity: trip.departureCity,
                        arrivalCity: trip.arrivalCity,
                        departureDate: trip.departureDate,
                        departureTime: trip.departureTime,
                        departureAddress: trip.departureAddress,
                        arrivalAddress: trip.arrivalAddress,
                        pricePerSeat: trip.pricePerSeat,
                    }),
                }).catch((e) => console.error('[EMAIL] Failed:', e));
            }

            setSuccess('Votre réservation a été annulée et remboursée !');
            const updatedTrip = await getTripById(resolvedParams.id);
            if (updatedTrip) setTrip(updatedTrip);
        } catch (error) {
            console.error("Erreur lors de l'annulation:", error);
            setError(error instanceof Error ? error.message : "Erreur lors de l'annulation");
        } finally {
            setLeaving(false);
        }
    };

    // cancel a trip
    const handleCancelTrip = () => {
        confirmCancelTrip();
    };

    // confirm the cancellation of a trip (cancel all active bookings) - Firestore update done client-side
    const confirmCancelTrip = async () => {
        if (!user || !trip) return;

        setCancelling(true);
        setError('');
        setSuccess('');

        try {
            const activeBookings = trip.bookings?.filter((b) => b.status === 'authorized') ?? [];

            // 1. Cancel all PaymentIntents on Stripe
            await Promise.all(
                activeBookings.map(async (booking) => {
                    const res = await fetch('/api/stripe/booking/cancel-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentIntentId: booking.paymentIntentId }),
                    });
                    if (!res.ok) console.error(`Failed to cancel payment for ${booking.oderId}`);
                }),
            );

            // 2. Update Firestore (client-side where user is authenticated)
            const tripRef = doc(db, 'trips', trip.id);
            const tripSnap = await getDoc(tripRef);
            if (!tripSnap.exists()) throw new Error('Trajet non trouvé');

            const tripData = tripSnap.data();
            const bookings = (tripData.bookings ?? []) as BookingDoc[];
            const now = new Date();

            // Mark all active bookings as cancelled
            const updatedBookings = bookings.map((b) =>
                b.status === 'authorized'
                    ? { ...b, status: 'cancelled' as const, cancelledAt: now }
                    : b,
            );

            // Get participants from cancelled bookings to remove
            const cancelledParticipants = activeBookings.map((b) => b.participantId);
            const updatedParticipants = tripData.participants.filter(
                (p: string) => !cancelledParticipants.includes(p),
            );

            await updateDoc(tripRef, {
                bookings: updatedBookings,
                participants: updatedParticipants,
                availableSeats: tripData.availableSeats + activeBookings.length,
                isActive: false,
                updatedAt: now,
            });

            // Send cancellation emails to all passengers
            const driverName = userProfile?.firstName || 'La conductrice';
            participants.forEach((participant) => {
                if (cancelledParticipants.includes(participant.id) && participant.email) {
                    fetch('/api/email/cancellation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            recipientEmail: participant.email,
                            recipientName: participant.firstName,
                            cancellerName: driverName,
                            cancellerRole: 'driver',
                            tripId: trip.id,
                            departureCity: trip.departureCity,
                            arrivalCity: trip.arrivalCity,
                            departureDate: trip.departureDate,
                            departureTime: trip.departureTime,
                            departureAddress: trip.departureAddress,
                            arrivalAddress: trip.arrivalAddress,
                            pricePerSeat: trip.pricePerSeat,
                        }),
                    }).catch((e) => console.error('[EMAIL] Failed:', e));
                }
            });

            setSuccess('Trajet annulé ! Toutes les réservations ont été remboursées.');
            const updatedTrip = await getTripById(resolvedParams.id);
            if (updatedTrip) setTrip(updatedTrip);
        } catch (error) {
            console.error("Erreur lors de l'annulation du trajet:", error);
            setError(error instanceof Error ? error.message : "Erreur lors de l'annulation");
        } finally {
            setCancelling(false);
        }
    };

    // Computed values
    const isUserParticipant = Boolean(user && trip?.participants.includes(user.uid));
    const isUserDriver = Boolean(user && trip?.driverId === user.uid);
    const isUserVerified = Boolean(userProfile?.isUserVerified);
    const availableSeats = trip?.availableSeats ?? 0;
    const canJoinTrip =
        Boolean(trip?.isActive) &&
        availableSeats > 0 &&
        isUserVerified &&
        Boolean(user) &&
        !isUserDriver &&
        !isUserParticipant;

    const hasContactAccess = isUserDriver || isUserParticipant;
    const contactPhoneNumber = hasContactAccess ? (trip?.driver.phoneNumber ?? '') : '';
    const contactMessage = hasContactAccess
        ? 'Tu peux contacter ta conductrice dès maintenant.'
        : 'Les informations de contact seront visibles une fois ta réservation confirmée.';

    const driverAverageRating =
        trip?.driver.averageRating ??
        (reviews.length > 0
            ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10) / 10
            : undefined);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--dark-green)] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4" />
                    <p className="text-gray-600">Chargement du trajet...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !trip) {
        return (
            <div className="min-h-screen bg-[var(--dark-green)] flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Erreur</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link href="/join-trip" className="btn">
                        Retour aux trajets
                    </Link>
                </div>
            </div>
        );
    }

    if (!trip) return null;

    return (
        <RouteGuard requireAuth={true} requireVerified={true}>
            <div className="flex-1 flex flex-col bg-[var(--dark-green)] py-12">
                <div className="md:wrapper wrapper bg-[var(--white)] rounded-xl flex-1">
                    {/* Header */}
                    <div className="mb-4 p-6">
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
                        <h1 className="text-3xl font-bold text-gray-900 font-staatliches">
                            Détails du trajet
                        </h1>
                        <p className="text-gray-600 text-base mt-2">
                            Découvre toutes les infos de ce trajet : itinéraire, horaires,
                            conductrice et conditions.
                        </p>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 mx-6">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 mx-6">
                            <p className="text-green-800">{success}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-6">
                        {/* Main information */}
                        <div className="lg:col-span-2">
                            <TripInfo
                                trip={trip}
                                driverAverageRating={driverAverageRating}
                                participants={participants}
                                loadingParticipants={loadingParticipants}
                                actionButton={
                                    <TripActions
                                        trip={trip}
                                        isUserDriver={isUserDriver}
                                        isUserParticipant={isUserParticipant}
                                        canJoinTrip={canJoinTrip}
                                        joining={joining}
                                        onJoinTrip={handleJoinTrip}
                                        leaving={leaving}
                                        onLeaveTrip={handleLeaveTrip}
                                        cancelling={cancelling}
                                        onCancelTrip={handleCancelTrip}
                                    />
                                }
                            />
                        </div>

                        {/* Contact + Alert */}
                        <div className="lg:col-span-2 space-y-6">
                            <TripContact
                                driverName={trip.driver.firstName}
                                phoneNumber={contactPhoneNumber}
                                message={contactMessage}
                            />
                            {hasContactAccess && <TripAlert tripId={trip.id} />}
                        </div>
                    </div>

                    {/* Reviews section */}
                    {reviews.length > 0 && (
                        <div className="mt-8 p-4">
                            <ReviewsSection
                                title="Quelques avis sur ta conductrice"
                                reviews={reviews}
                                loading={loadingReviews}
                            />
                        </div>
                    )}
                </div>
            </div>
        </RouteGuard>
    );
}
