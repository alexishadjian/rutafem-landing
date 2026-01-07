'use client';

import Icon from '@/app/_components/ui/icon';
import { Trip } from '@/types/trips.types';
import Link from 'next/link';
import { TripCard } from './carried-trip-card';

type TripsSectionProps = {
    upcomingTrips: Trip[];
    completedTrips: Trip[];
    loading?: boolean;
};

export const TripsSection = ({ upcomingTrips, completedTrips, loading }: TripsSectionProps) => {
    if (loading) {
        return (
            <div className="grid md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h3 className="text-3xl font-semibold text-[var(--black)] font-staatliches">
                Mes trajets
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-[var(--black)]">
                            Mes trajets à venir
                        </h3>
                        <span className="text-sm text-gray-500">
                            {upcomingTrips.length} trajet{upcomingTrips.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    {upcomingTrips.length === 0 ? (
                        <div className="bg-[var(--light-grey)] rounded-3xl border-2 border-[var(--dark-green)] p-8 text-center">
                            <p className="text-gray-600 mb-4">Aucun trajet à venir</p>
                            <Link
                                href="/join-trip"
                                className="inline-flex items-center gap-2 bg-[var(--yellow)] text-[var(--black)] rounded-lg px-5 py-3 font-medium hover:opacity-90 transition-opacity"
                            >
                                <Icon
                                    name="plus"
                                    width={24}
                                    height={24}
                                    fillColor="none"
                                    strokeColor="var(--black)"
                                />
                                <span>Chercher un trajet</span>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {upcomingTrips.slice(0, 2).map((trip) => (
                                    <TripCard key={trip.id} trip={trip} />
                                ))}
                            </div>
                            {upcomingTrips.length > 2 && (
                                <div className="flex justify-center">
                                    <Link
                                        href="/join-trip"
                                        className="inline-block bg-[var(--yellow)] text-[var(--black)] rounded-lg py-3 px-6 text-center font-medium hover:opacity-90 transition-opacity"
                                    >
                                        Voir tous les trajets
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-[var(--black)]">
                            Mes trajets réalisés
                        </h3>
                        <span className="text-sm text-gray-500">
                            {completedTrips.length} trajet{completedTrips.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    {completedTrips.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                            <p className="text-gray-600">Aucun trajet réalisé</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {completedTrips.slice(0, 2).map((trip) => (
                                    <TripCard key={trip.id} trip={trip} reviewCount={2} />
                                ))}
                            </div>
                            {completedTrips.length > 2 && (
                                <div className="flex justify-center">
                                    <Link
                                        href="/join-trip"
                                        className="inline-block bg-[var(--yellow)] text-[var(--black)] rounded-lg py-3 px-6 text-center font-medium hover:opacity-90 transition-opacity"
                                    >
                                        Voir tous les trajets
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
