'use client';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebaseConfig';
import { Trip, TripWithDriver } from '@/types/trip';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type TripCardProps = {
    trip: Trip | TripWithDriver;
};

export default function TripCard({ trip }: TripCardProps) {
    const { user } = useAuth();
    const [driverFirstName, setDriverFirstName] = useState<string | null>(null);
    const [loadingDriver, setLoadingDriver] = useState(false);

    useEffect(() => {
        const fetchDriverInfo = async () => {
            if (!user || !trip.driverId) {
                setDriverFirstName(null);
                return;
            }

            setLoadingDriver(true);
            try {
                const driverDoc = await getDoc(doc(db, 'users', trip.driverId));
                if (driverDoc.exists()) {
                    const driverData = driverDoc.data();
                    setDriverFirstName(driverData.firstName || null);
                } else {
                    setDriverFirstName(null);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des informations du pilote:', error);
                setDriverFirstName(null);
            } finally {
                setLoadingDriver(false);
            }
        };

        fetchDriverInfo();
    }, [user, trip.driverId]);

    const getDriverDisplayName = () => {
        if (!user) {
            return 'Pilote anonyme';
        }

        if (loadingDriver) {
            return 'Chargement...';
        }

        if (driverFirstName) {
            return driverFirstName;
        }

        return 'Pilote anonyme';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200 overflow-hidden">
            <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[--accent-color] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                />
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                />
                                <path
                                    d="M12 4v2M12 18v2M4 12h2M18 12h2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                />
                            </svg>
                        </div>
                        <div className="flex items-center">
                            <span className="font-medium text-lg text-gray-900">
                                {trip.departureCity}
                            </span>
                            <svg
                                className="w-5 h-5 text-gray-400 mx-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                />
                            </svg>
                            <span className="font-medium text-lg text-gray-900">
                                {trip.arrivalCity}
                            </span>
                        </div>
                    </div>

                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-lg font-semibold">
                        {trip.pricePerSeat}€
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                        <span className="font-medium">{getDriverDisplayName()}</span>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
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
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <span>{new Date(trip.departureDate).toLocaleDateString('fr-FR')}</span>
                        <span className="text-gray-400">•</span>
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
                        <span>{trip.departureTime.slice(0, 5)}</span>
                    </div>

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
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <span>
                            {trip.availableSeats} place{trip.availableSeats > 1 ? 's' : ''}{' '}
                            disponible{trip.availableSeats > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                <Link
                    href={`/trip/${trip.id}`}
                    className="w-full bg-[--accent-color] hover:bg-[--accent-color]/90 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                    </svg>
                    Voir les détails
                </Link>
            </div>
        </div>
    );
}
