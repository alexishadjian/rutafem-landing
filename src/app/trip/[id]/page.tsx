'use client';

import { ConfirmationModal } from '@/app/_components/confirmation-modal';
import { RouteGuard } from '@/app/_components/route-guard';
import { useAuth } from '@/contexts/AuthContext';
import { cancelTrip, getParticipantsInfo, getTripById, leaveTrip } from '@/lib/firebase/trips';
import { db } from '@/lib/firebaseConfig';
import { TripWithDriver } from '@/types/trips.types';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

type DriverDoc = {
    stripeAccountId?: string | null;
};

type TripDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default function TripDetailsPage({ params }: TripDetailsPageProps) {
    const { user } = useAuth();
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

    // Charger les informations des participants si l'utilisateur est le créateur
    useEffect(() => {
        const fetchParticipants = async () => {
            if (!trip || !user || trip.driverId !== user.uid || trip.participants.length === 0) {
                return;
            }

            setLoadingParticipants(true);
            try {
                const participantsInfo = await getParticipantsInfo(trip.participants);
                setParticipants(participantsInfo);
            } catch (error) {
                console.error('Erreur lors du chargement des participants:', error);
            } finally {
                setLoadingParticipants(false);
            }
        };

        fetchParticipants();
    }, [trip, user]);

    const handleJoinTrip = async () => {
        if (!user || !trip) return;

        setJoining(true);
        setError('');
        setSuccess('');

        try {
            // Récupérer la destination (stripeAccountId) de la conductrice côté client
            const driverRes = await fetch('/api/stripe/connect/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId: trip.driver?.stripeAccountId ?? '' }),
            });
            // Si le profil conducteur ne contient pas l'accountId, on va le chercher depuis Firestore
            let destinationAccount: string | null = null;
            if (driverRes.ok) {
                const st = await driverRes.json();
                destinationAccount = st.accountId as string;
            }
            if (!destinationAccount) {
                // fallback: lire depuis Firestore directement côté client
                try {
                    const driverDoc = await getDoc(doc(db, 'users', trip.driverId));
                    if (driverDoc.exists()) {
                        const driverData = driverDoc.data() as DriverDoc | undefined;
                        destinationAccount = driverData?.stripeAccountId ?? null;
                    }
                } catch {
                    console.error(
                        'Erreur lors de la récupération du compte bancaire de la conductrice:',
                    );
                }
            }
            if (!destinationAccount)
                throw new Error('La conductrice doit connecter son compte bancaire');

            const amountCents = Math.round(Number(trip.pricePerSeat) * 100);
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tripId: trip.id,
                    buyerUid: user.uid,
                    quantity: 1,
                    amountCents,
                    destinationAccount,
                    tripLabel: `Trajet ${trip.departureCity}  ${trip.arrivalCity}`,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Erreur de paiement');
            window.location.href = json.url as string;
        } catch (error) {
            console.error('Erreur lors de la création du paiement:', error);
            setError(
                error instanceof Error ? error.message : 'Erreur lors de la création du paiement',
            );
        } finally {
            setJoining(false);
        }
    };

    const handleLeaveTrip = async () => {
        if (!user || !trip) return;

        setLeaving(true);
        setError('');
        setSuccess('');

        try {
            await leaveTrip(trip.id, user.uid);
            setSuccess('Vous avez annulé votre participation au trajet !');
            // Recharger les données du trajet pour mettre à jour les places disponibles
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

    const handleCancelTrip = () => {
        setShowCancelModal(true);
    };

    const confirmCancelTrip = async () => {
        if (!user || !trip) return;

        setCancelling(true);
        setError('');
        setSuccess('');
        setShowCancelModal(false);

        try {
            await cancelTrip(trip.id, user.uid);
            setSuccess('Trajet annulé avec succès !');
            // Recharger les données du trajet
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.slice(0, 5); // Format HH:MM
    };

    const isUserParticipant = user && trip && trip.participants.includes(user.uid);
    const isUserDriver = user && trip && trip.driverId === user.uid;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement du trajet...</p>
                </div>
            </div>
        );
    }

    if (error && !trip) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/join-trip"
                            className="text-pink-600 hover:text-pink-700 flex items-center gap-2 mb-4"
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
                        <h1 className="text-3xl font-bold text-gray-900">Détails du trajet</h1>
                    </div>

                    {/* Messages d'erreur/succès */}
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Informations principales */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-6 h-6 text-pink-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">
                                                {trip.departureCity} → {trip.arrivalCity}
                                            </h2>
                                            <p className="text-gray-600">{trip.departureAddress}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-600">
                                            {trip.pricePerSeat}€
                                        </div>
                                        <div className="text-sm text-gray-500">par place</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">
                                            Détails du trajet
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <svg
                                                    className="w-5 h-5 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                <span className="text-gray-700">
                                                    {formatDate(trip.departureDate)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <svg
                                                    className="w-5 h-5 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                <span className="text-gray-700">
                                                    {formatTime(trip.departureTime)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <svg
                                                    className="w-5 h-5 text-gray-400"
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
                                                <span className="text-gray-700">
                                                    {trip.availableSeats} place
                                                    {trip.availableSeats > 1 ? 's' : ''} disponible
                                                    {trip.availableSeats > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <svg
                                                    className="w-5 h-5 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 13l2.34-6.68A2 2 0 017.24 5h9.52a2 2 0 011.9 1.32L21 13m-18 0h18m-16 0v3a2 2 0 002 2h1a2 2 0 002-2v-1h4v1a2 2 0 002 2h1a2 2 0 002-2v-3"
                                                    />
                                                    <circle
                                                        cx="7.5"
                                                        cy="17.5"
                                                        r="1.5"
                                                        fill="currentColor"
                                                    />
                                                    <circle
                                                        cx="16.5"
                                                        cy="17.5"
                                                        r="1.5"
                                                        fill="currentColor"
                                                    />
                                                </svg>
                                                <span className="text-gray-700">
                                                    {trip.departureAddress}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">
                                            Conductrice
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                                                <span className="text-pink-600 font-semibold text-sm">
                                                    {trip.driver.firstName.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {trip.driver.firstName}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Conductrice vérifiée
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {trip.description && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h3 className="font-semibold text-gray-900 mb-3">
                                            Description
                                        </h3>
                                        <p className="text-gray-700 italic bg-gray-50 p-4 rounded-lg">
                                            &quot;{trip.description}&quot;
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
                                <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>

                                {isUserDriver ? (
                                    <div className="space-y-4">
                                        {trip.isActive && (
                                            <div className="space-y-3">
                                                <button
                                                    onClick={handleCancelTrip}
                                                    disabled={cancelling}
                                                    className="w-full bg-pink-500 hover:bg-pink-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {cancelling ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Annulation...
                                                        </>
                                                    ) : (
                                                        <>
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
                                                                    d="M6 18L18 6M6 6l12 12"
                                                                />
                                                            </svg>
                                                            Annuler le trajet
                                                        </>
                                                    )}
                                                </button>

                                                {/* <Link
                                                    href={`/create-trip?edit=${trip.id}`}
                                                    className="w-full bg-blue-400 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                    Modifier le trajet
                                                </Link> */}
                                            </div>
                                        )}

                                        {!trip.isActive && (
                                            <div className="text-center py-4">
                                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <svg
                                                        className="w-6 h-6 text-red-600"
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
                                                <p className="text-red-800 font-medium">
                                                    Trajet annulé
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : isUserParticipant ? (
                                    <div className="space-y-4">
                                        <div className="text-center py-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <svg
                                                    className="w-6 h-6 text-green-600"
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
                                            <p className="text-green-800 font-medium">
                                                Vous participez à ce trajet
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleLeaveTrip}
                                            disabled={leaving}
                                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {leaving ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Annulation...
                                                </>
                                            ) : (
                                                <>
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
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                    Annuler ma participation
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : trip.availableSeats > 0 ? (
                                    <button
                                        onClick={handleJoinTrip}
                                        disabled={joining}
                                        className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {joining ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Rejoindre...
                                            </>
                                        ) : (
                                            <>
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
                                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                    />
                                                </svg>
                                                Rejoindre le trajet
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-gray-600">Plus de places disponibles</p>
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-3">Contact</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <svg
                                                className="w-4 h-4 text-gray-400"
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
                                            <span className="text-gray-600">
                                                {trip.driver.phoneNumber}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Participants - Visible seulement pour le créateur */}
                    {isUserDriver && trip.participants.length > 0 && (
                        <div className="mt-8">
                            <div className="bg-white rounded-xl shadow-sm border p-6">
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
                </div>
            </div>

            {/* Modal de confirmation pour l'annulation du trajet */}
            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={confirmCancelTrip}
                title="Annuler le trajet"
                message="Êtes-vous sûr de vouloir annuler ce trajet ? Cette action est irréversible et tous les participants seront notifiés."
                confirmText="Oui, annuler le trajet"
                cancelText="Non, garder le trajet"
                type="danger"
                loading={cancelling}
            />
        </RouteGuard>
    );
}
