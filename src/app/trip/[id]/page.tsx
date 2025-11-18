'use client';

import { ConfirmationModal } from '@/app/_components/confirmation-modal';
import { ReviewsSection } from '@/app/_components/reviews-section';
import { RouteGuard } from '@/app/_components/route-guard';
import { useAuth } from '@/contexts/AuthContext';
import { getReviewsByUserId } from '@/lib/firebase/reviews';
import { cancelTrip, getTripById, leaveTrip } from '@/lib/firebase/trips';
import { fetchParticipantsDetails, startTripCheckout } from '@/services/trips';
import { Review } from '@/types/reviews.types';
import { TripWithDriver } from '@/types/trips.types';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { TripActions } from './_components/trip-actions';
import { TripContact } from './_components/trip-contact';
import { TripInfo } from './_components/trip-info';

type TripDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
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
        }[]
    >([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const tripData = await getTripById(resolvedParams.id);
                if (!tripData) {
                    setError('Trajet non trouvé');
                    return;
                }
                setTrip(tripData);
            } catch (error) {
                console.error('Erreur lors du chargement du trajet:', error);
                setError('Erreur lors du chargement du trajet');
            } finally {
                setLoading(false);
            }
        };

        fetchTrip();
    }, [resolvedParams.id]);

    // get participants information if the user is the creator
    useEffect(() => {
        const fetchParticipants = async () => {
            if (!trip || !user || trip.driverId !== user.uid || trip.participants.length === 0) {
                return;
            }

            setLoadingParticipants(true);
            try {
                const participantsInfo = await fetchParticipantsDetails(trip);
                setParticipants(participantsInfo);
            } catch (error) {
                console.error('Erreur lors du chargement des participants:', error);
            } finally {
                setLoadingParticipants(false);
            }
        };

        fetchParticipants();
    }, [trip, user]);

    useEffect(() => {
        if (!trip?.driver.id) {
            return;
        }
        let isMounted = true;
        const fetchReviews = async () => {
            setLoadingReviews(true);
            try {
                const driverReviews = await getReviewsByUserId(trip.driver.id);
                if (isMounted) {
                    setReviews(driverReviews);
                }
            } catch (fetchError) {
                console.error('Erreur lors du chargement des avis:', fetchError);
            } finally {
                if (isMounted) {
                    setLoadingReviews(false);
                }
            }
        };
        fetchReviews();
        return () => {
            isMounted = false;
        };
    }, [trip?.driver.id]);

    // join a trip
    const handleJoinTrip = async () => {
        if (!user || !trip) return;

        setJoining(true);
        setError('');
        setSuccess('');

        try {
            const { url } = await startTripCheckout(trip, user.uid);
            window.location.href = url;
        } catch (error) {
            console.error('Erreur lors de la création du paiement:', error);
            setError(
                error instanceof Error ? error.message : 'Erreur lors de la création du paiement',
            );
        } finally {
            setJoining(false);
        }
    };

    // leave a trip
    const handleLeaveTrip = async () => {
        if (!user || !trip) return;

        setLeaving(true);
        setError('');
        setSuccess('');

        try {
            await leaveTrip(trip.id, user.uid);
            setSuccess('Vous avez annulé votre participation au trajet !');
            // reload the trip data to update the available seats
            const updatedTrip = await getTripById(resolvedParams.id);
            if (updatedTrip) {
                setTrip(updatedTrip);
            }
        } catch (error) {
            console.error("Erreur lors de l'annulation de la participation:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de l'annulation de la participation",
            );
        } finally {
            setLeaving(false);
        }
    };

    // cancel a trip
    const handleCancelTrip = () => {
        setShowCancelModal(true);
    };

    // confirm the cancellation of a trip
    const confirmCancelTrip = async () => {
        if (!user || !trip) return;

        setCancelling(true);
        setError('');
        setSuccess('');
        setShowCancelModal(false);

        try {
            await cancelTrip(trip.id, user.uid);
            setSuccess('Trajet annulé avec succès !');
            // reload the trip data to update the available seats
            const updatedTrip = await getTripById(resolvedParams.id);
            if (updatedTrip) {
                setTrip(updatedTrip);
            }
        } catch (error) {
            console.error("Erreur lors de l'annulation du trajet:", error);
            setError(
                error instanceof Error ? error.message : "Erreur lors de l'annulation du trajet",
            );
        } finally {
            setCancelling(false);
        }
    };

    const isUserParticipant = Boolean(user && trip && trip.participants.includes(user.uid));
    const isUserDriver = Boolean(user && trip && trip.driverId === user.uid);
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
    const showActionsSection = hasContactAccess;
    const contactPhoneNumber = hasContactAccess
        ? trip?.driver.phoneNumber ?? '06XXXXXXXX'
        : '06XXXXXXXX';
    const contactMessage = hasContactAccess
        ? 'Tu peux contacter ta conductrice dès maintenant.'
        : 'Les informations de contact seront visibles une fois ta réservation confirmée.';

    const calculateAverageRating = (): number | undefined => {
        if (trip?.driver.averageRating !== undefined) {
            return trip.driver.averageRating;
        }
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
            return Math.round((sum / reviews.length) * 10) / 10;
        }
        return undefined;
    };

    const driverAverageRating = calculateAverageRating();

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--dark-green)] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement du trajet...</p>
                </div>
            </div>
        );
    }

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

                    {/* Error/success messages */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <p className="text-green-800">{success}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-6">
                        {/* Main information */}
                        <div className="lg:col-span-2">
                            <TripInfo
                                trip={trip}
                                canJoinTrip={canJoinTrip}
                                joining={joining}
                                onJoinTrip={handleJoinTrip}
                                driverAverageRating={driverAverageRating}
                            />
                        </div>

                        {/* Actions + contact information */}
                        <div className="lg:col-span-2 space-y-6">
                            <TripActions
                                trip={trip}
                                isUserDriver={isUserDriver}
                                isUserParticipant={isUserParticipant}
                                show={showActionsSection}
                                cancelling={cancelling}
                                onCancelTrip={handleCancelTrip}
                                leaving={leaving}
                                onLeaveTrip={handleLeaveTrip}
                            />
                            <TripContact
                                driverName={trip.driver.firstName}
                                phoneNumber={contactPhoneNumber}
                                message={contactMessage}
                            />
                        </div>
                    </div>

                    {/* Section Participants - Only visible for the creator */}
                    {isUserDriver && trip.participants.length > 0 && (
                        <div className="mt-8">
                            <div className="rounded-xl p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <svg
                                        className="w-5 h-5 text-pink-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                    Participants ({trip.participants.length})
                                </h3>

                                {loadingParticipants ? (
                                    <div className="space-y-3">
                                        {[...Array(trip.participants.length)].map((_, index) => (
                                            <div key={index} className="animate-pulse">
                                                <div className="flex items-center gap-3 p-3">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                                    <div className="flex-1">
                                                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {participants.map((participant) => (
                                            <div
                                                key={participant.id}
                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-pink-600">
                                                        {participant.firstName.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">
                                                        {participant.firstName}{' '}
                                                        {participant.lastName}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
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
                                                        <span>{participant.phoneNumber}</span>
                                                    </div>
                                                </div>
                                                <a
                                                    href={`tel:${participant.phoneNumber}`}
                                                    className="p-2 text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-lg transition-colors"
                                                    title="Appeler"
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
                                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                        />
                                                    </svg>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="mt-8">
                        <ReviewsSection
                            title="Quelques avis sur ta conductrice"
                            reviews={reviews}
                            loading={loadingReviews}
                        />
                    </div>
                </div>
            </div>

            {/* Confirmation modal for the cancellation of the trip */}
            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={confirmCancelTrip}
                title="Annuler le trajet"
                message="Êtes-vous sûr de vouloir annuler ce trajet ? Cette action est irréversible et toutes les participantes seront notifiées."
                confirmText="Oui, annuler le trajet"
                cancelText="Non, garder le trajet"
                type="danger"
                loading={cancelling}
            />
        </RouteGuard>
    );
}
