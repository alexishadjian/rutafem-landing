'use client';

import Icon from '@/app/_components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebaseConfig';
import { cn } from '@/lib/utils';
import { Trip, TripWithDriver } from '@/types/trips.types';
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

    const shouldStackCities = trip.departureCity.length > 18 || trip.arrivalCity.length > 18;

    return (
        <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200 overflow-hidden">
            <div className="p-4 sm:p-5">
                <div className="flex gap-3 justify-between items-start sm:items-center sm:justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 flex-grow-0 w-10 h-10 min-w-10 min-h-10 max-w-10 max-h-10 rounded-full bg-[var(--pink)] flex items-center justify-center">
                            <Icon
                                name="mapPoint"
                                strokeWidth={1}
                                strokeColor="var(--black)"
                                fillColor="var(--black)"
                                width={14}
                                height={16}
                            />
                        </div>
                        <div
                            className={cn(
                                'flex min-w-0 sm:flex-row sm:items-center',
                                shouldStackCities
                                    ? 'flex-col items-start gap-1'
                                    : 'flex-row items-center gap-1',
                            )}
                        >
                            <span
                                className="font-medium text-base text-gray-900 break-words sm:truncate"
                                title={trip.departureCity}
                            >
                                {trip.departureCity}
                            </span>
                            <svg
                                className={cn(
                                    'w-5 h-5 text-gray-400 transition-transform sm:rotate-0 sm:mx-1 sm:my-0',
                                    shouldStackCities ? 'rotate-90 my-1' : 'rotate-0 mx-1',
                                )}
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
                            <span
                                className="font-medium text-base text-gray-900 break-words sm:truncate"
                                title={trip.arrivalCity}
                            >
                                {trip.arrivalCity}
                            </span>
                        </div>
                    </div>
                    <div className="bg-[var(--light-blue)] text-[var(--black)] px-3 py-1 rounded-full text-base font-medium ml-auto w-fit">
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
                    className="w-full bg-[var(--yellow)] hover:bg-[var(--yellow)]/90 text-[var(--black)] py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                    Voir les détails du trajet
                </Link>
            </div>
        </div>
    );
}
