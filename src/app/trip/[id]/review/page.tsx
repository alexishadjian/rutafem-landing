'use client';

import { RouteGuard } from '@/app/_components/route-guard';
import Icon from '@/app/_components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { createReview, getReviewedIdsForTripByUser } from '@/lib/firebase/reviews';
import { getTripById } from '@/lib/firebase/trips';
import { fetchParticipantsDetails } from '@/services/trips';
import { TripWithDriver } from '@/types/trips.types';
import { isTripPastOrNow } from '@/utils/date';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, use, useEffect, useState } from 'react';

type PageProps = { params: Promise<{ id: string }> };

type ParticipantInfo = { id: string; firstName: string; lastName: string };

const ReviewContent = ({ tripId }: { tripId: string }) => {
    const searchParams = useSearchParams();
    const userIdParam = searchParams.get('userId');
    const { user } = useAuth();
    const id = tripId;
    const [trip, setTrip] = useState<TripWithDriver | null>(null);
    const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                const data = await getTripById(id);
                setTrip(data ?? null);
                if (data?.participants.length) {
                    const infos = await fetchParticipantsDetails(data);
                    setParticipants(infos);
                }
                if (user?.uid && data) {
                    const reviewedIds = await getReviewedIdsForTripByUser(user.uid, id);
                    const isDriver = data.driverId === user.uid;
                    const isParticipant = data.participants.includes(user.uid);
                    const passed = isTripPastOrNow(data.departureDate, data.departureTime);
                    if ((isDriver || isParticipant) && passed) {
                        if (isParticipant) {
                            setAlreadyReviewed(reviewedIds.includes(data.driverId));
                        } else {
                            setAlreadyReviewed(
                                data.participants.length === 0 ||
                                    data.participants.every((p) => reviewedIds.includes(p)),
                            );
                        }
                    }
                }
            } catch {
                setTrip(null);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, user?.uid]);

    const isParticipant = user && trip?.participants.includes(user.uid);
    const isDriver = user && trip?.driverId === user.uid;
    const tripPassed = Boolean(trip && isTripPastOrNow(trip.departureDate, trip.departureTime));
    const canReview = (isParticipant || isDriver) && tripPassed;

    const selectedReviewedId =
        isDriver && userIdParam && trip?.participants.includes(userIdParam)
            ? userIdParam
            : isDriver && trip?.participants.length === 1
              ? trip.participants[0]
              : isDriver
                ? null
                : (trip?.driverId ?? '');
    const reviewedId = selectedReviewedId ?? trip?.driverId ?? '';

    const handleSubmit = async () => {
        if (!user || !trip || rating < 1 || rating > 5) return;
        setError('');
        setSubmitting(true);
        try {
            await createReview({
                reviewerId: user.uid,
                reviewedId,
                tripId: trip.id,
                rating,
                comment: comment.trim() || 'Aucun commentaire',
            });
            setSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <RouteGuard requireAuth requireVerified>
                <div className="min-h-screen bg-[var(--dark-green)] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--pink)]" />
                </div>
            </RouteGuard>
        );
    }

    if (!trip) {
        return (
            <RouteGuard requireAuth requireVerified>
                <div className="min-h-screen bg-[var(--dark-green)] flex items-center justify-center p-6">
                    <div className="text-center text-white">
                        <p className="mb-4">Trajet non trouvé</p>
                        <Link href="/join-trip" className="text-[var(--pink)] hover:underline">
                            Retour aux trajets
                        </Link>
                    </div>
                </div>
            </RouteGuard>
        );
    }

    if (!canReview) {
        return (
            <RouteGuard requireAuth requireVerified>
                <div className="min-h-screen bg-[var(--dark-green)] flex items-center justify-center p-6">
                    <div className="text-center text-white">
                        <p className="mb-4">
                            {!tripPassed
                                ? 'Tu peux laisser un avis une fois le trajet effectué.'
                                : 'Tu ne peux noter que les trajets auxquels tu as participé.'}
                        </p>
                        <Link
                            href={`/trip/${id}`}
                            className="text-[var(--black)] hover:text-[var(--pink)]"
                        >
                            Retour au trajet
                        </Link>
                    </div>
                </div>
            </RouteGuard>
        );
    }

    if (alreadyReviewed) {
        return (
            <RouteGuard requireAuth requireVerified>
                <div className="min-h-screen bg-[var(--dark-green)] flex items-center justify-center p-6">
                    <div className="text-center text-white">
                        <p className="mb-4">Tu as déjà laissé un avis pour ce trajet.</p>
                        <Link href={`/trip/${id}`} className="text-[var(--pink)] hover:underline">
                            Retour au trajet
                        </Link>
                    </div>
                </div>
            </RouteGuard>
        );
    }

    if (submitted) {
        return (
            <RouteGuard requireAuth requireVerified>
                <div className="min-h-screen bg-[var(--dark-green)] py-8">
                    <div className="md:wrapper wrapper bg-[var(--white)] rounded-xl max-w-lg mx-auto p-6 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-[var(--black)] mb-2">
                            Avis envoyé !
                        </h2>
                        <p className="text-gray-600 mb-6">Merci pour ton retour.</p>
                        <Link
                            href={`/trip/${id}`}
                            className="inline-block bg-[var(--dark-green)] text-white py-3 px-6 rounded-xl font-medium hover:opacity-90"
                        >
                            Retour au trajet
                        </Link>
                    </div>
                </div>
            </RouteGuard>
        );
    }

    const selectedParticipant = participants.find((p) => p.id === selectedReviewedId);
    const reviewedName = isDriver
        ? (selectedParticipant?.firstName ?? 'ta passagère')
        : (trip.driver?.firstName ?? 'la conductrice');

    if (isDriver && trip.participants.length === 0) {
        return (
            <RouteGuard requireAuth requireVerified>
                <div className="min-h-screen bg-[var(--dark-green)] flex items-center justify-center p-6">
                    <div className="text-center text-white">
                        <p className="mb-4">Aucune passagère à noter pour ce trajet.</p>
                        <Link href={`/trip/${id}`} className="text-[var(--pink)] hover:underline">
                            Retour au trajet
                        </Link>
                    </div>
                </div>
            </RouteGuard>
        );
    }

    if (isDriver && trip.participants.length > 1 && !selectedReviewedId) {
        return (
            <RouteGuard requireAuth requireVerified>
                <div className="min-h-screen bg-[var(--dark-green)] py-8">
                    <div className="md:wrapper wrapper bg-[var(--white)] rounded-xl max-w-lg mx-auto p-6">
                        <Link
                            href={`/trip/${id}`}
                            className="flex items-center gap-2 mb-6 text-[var(--black)] hover:text-[var(--pink)]"
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
                            Retour au trajet
                        </Link>
                        <h1 className="text-2xl font-staatliches text-[var(--black)] mb-2">
                            Laisser un avis
                        </h1>
                        <p className="text-gray-600 mb-6">Sélectionne une passagère à noter</p>
                        <div className="space-y-2">
                            {participants.map((p) => (
                                <Link
                                    key={p.id}
                                    href={`/trip/${id}/review?userId=${p.id}`}
                                    className="block p-4 rounded-xl border border-gray-200 hover:bg-gray-50 font-medium"
                                >
                                    {p.firstName} {p.lastName}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </RouteGuard>
        );
    }

    return (
        <RouteGuard requireAuth requireVerified>
            <div className="min-h-screen bg-[var(--dark-green)] py-8">
                <div className="md:wrapper wrapper bg-[var(--white)] rounded-xl max-w-lg mx-auto p-6">
                    <Link
                        href={`/trip/${id}`}
                        className="flex items-center gap-2 mb-6 text-[var(--black)] hover:text-[var(--pink)]"
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
                        Retour au trajet
                    </Link>
                    <h1 className="text-2xl font-staatliches text-[var(--black)] mb-2">
                        Laisser un avis
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {trip.departureCity} → {trip.arrivalCity} ({trip.departureDate})
                    </p>
                    <p className="text-gray-700 mb-4">
                        Comment s&apos;est passé le trajet avec {reviewedName} ?
                    </p>

                    <div className="flex gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="p-1 hover:scale-110 transition-transform"
                            >
                                <Icon
                                    name="star"
                                    width={40}
                                    height={40}
                                    strokeColor={star <= rating ? '#F97316' : '#D4D4D8'}
                                    fillColor={star <= rating ? '#F97316' : 'none'}
                                />
                            </button>
                        ))}
                    </div>

                    <label className="block text-sm font-medium text-[var(--black)] mb-2">
                        Commentaire (optionnel)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Partage ton expérience..."
                        rows={4}
                        className="w-full p-3 border border-gray-200 rounded-xl resize-none mb-4"
                    />

                    {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                    <button
                        onClick={handleSubmit}
                        disabled={submitting || rating < 1}
                        className="w-full bg-[var(--yellow)] text-[var(--black)] py-3 px-6 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--black)] border-t-transparent" />
                                Envoi...
                            </span>
                        ) : (
                            'Envoyer mon avis'
                        )}
                    </button>
                </div>
            </div>
        </RouteGuard>
    );
};

export default function TripReviewPage({ params }: PageProps) {
    const { id } = use(params);
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[var(--dark-green)] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--pink)]" />
                </div>
            }
        >
            <ReviewContent tripId={id} />
        </Suspense>
    );
}
