'use client';

import { getUserTrips } from '@/lib/firebase/trips';
import { Trip } from '@/types/trips.types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type UserTripsProps = {
    userId: string;
};

export default function UserTrips({ userId }: UserTripsProps) {
    const [createdTrips, setCreatedTrips] = useState<Trip[]>([]);
    const [participatedTrips, setParticipatedTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserTrips = async () => {
            try {
                const { createdTrips, participatedTrips } = await getUserTrips(userId);
                setCreatedTrips(createdTrips);
                setParticipatedTrips(participatedTrips);
            } catch (error) {
                console.error('Erreur lors du chargement des trajets:', error);
                setError('Erreur lors du chargement des trajets');
            } finally {
                setLoading(false);
            }
        };

        fetchUserTrips();
    }, [userId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.slice(0, 5);
    };

    const TripCard = ({ trip, isCreated = false }: { trip: Trip; isCreated?: boolean }) => (
        <Link
            href={`/trip/${trip.id}`}
            className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
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
                        <h4 className="font-medium text-gray-900">
                            {trip.departureCity} → {trip.arrivalCity}
                        </h4>
                        <p className="text-sm text-gray-500">{trip.departureAddress}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">{trip.pricePerSeat}€</div>
                    <div className="text-xs text-gray-500">par place</div>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
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
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <span>{formatDate(trip.departureDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>{formatTime(trip.departureTime)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    <span>
                        {isCreated
                            ? `${trip.participants.length}/${trip.totalSeats} participants`
                            : `${trip.availableSeats} place${
                                  trip.availableSeats > 1 ? 's' : ''
                              } disponible${trip.availableSeats > 1 ? 's' : ''}`}
                    </span>
                </div>
            </div>
        </Link>
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
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
                <p className="text-red-600 mb-2">Erreur</p>
                <p className="text-gray-600 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Trajets créés */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
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
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                        Mes trajets créés
                    </h3>
                    <span className="text-sm text-gray-500">
                        {createdTrips.length} trajet{createdTrips.length > 1 ? 's' : ''}
                    </span>
                </div>

                {createdTrips.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg
                                className="w-6 h-6 text-gray-400"
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
                        <p className="text-gray-600 mb-3">Aucun trajet créé</p>
                        <Link
                            href="/create-trip"
                            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 text-sm font-medium"
                        >
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
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            Publier mon premier trajet
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {createdTrips.map((trip) => (
                            <TripCard key={trip.id} trip={trip} isCreated={true} />
                        ))}
                    </div>
                )}
            </div>

            {/* Trajets auxquels je participe */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <svg
                            className="w-5 h-5 text-green-600"
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
                        Mes trajets à venir
                    </h3>
                    <span className="text-sm text-gray-500">
                        {participatedTrips.length} trajet{participatedTrips.length > 1 ? 's' : ''}
                    </span>
                </div>

                {participatedTrips.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg
                                className="w-6 h-6 text-gray-400"
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
                        </div>
                        <p className="text-gray-600 mb-3">Aucun trajet à venir</p>
                        <Link
                            href="/join-trip"
                            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 text-sm font-medium"
                        >
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
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            Rechercher un trajet
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {participatedTrips.map((trip) => (
                            <TripCard key={trip.id} trip={trip} isCreated={false} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
