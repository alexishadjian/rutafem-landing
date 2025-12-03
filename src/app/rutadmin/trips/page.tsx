'use client';

import { getAllTrips } from '@/lib/firebase/admin';
import { Trip } from '@/types/trips.types';
import { logFirebaseError } from '@/utils/errors';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminGuard } from '../_components/admin-guard';
import { AdminTripCard } from '../_components/trip-card';

type FilterStatus = 'all' | 'active' | 'cancelled';

export default function TripsPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setTrips(await getAllTrips());
            } catch (error) {
                logFirebaseError('TripsPage.loadData', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredTrips = trips.filter((trip) => {
        if (filter === 'active') return trip.isActive;
        if (filter === 'cancelled') return !trip.isActive;
        return true;
    });

    return (
        <AdminGuard>
            <main className="min-h-screen bg-[var(--dark-green)] py-8">
                <div className="wrapper">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/rutadmin"
                                className="text-[var(--white)] hover:text-[var(--pink)] transition-colors"
                            >
                                ← Retour
                            </Link>
                            <h1 className="text-[var(--white)] text-2xl font-bold">
                                Tous les trajets ({filteredTrips.length})
                            </h1>
                        </div>
                        <div className="flex gap-2">
                            {(['all', 'active', 'cancelled'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                        filter === status
                                            ? 'bg-[var(--pink)] text-[var(--black)]'
                                            : 'bg-[var(--dark-green)] text-[var(--white)]/60 hover:text-[var(--white)]'
                                    }`}
                                >
                                    {status === 'all'
                                        ? 'Tous'
                                        : status === 'active'
                                        ? 'Actifs'
                                        : 'Annulés'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--pink)]" />
                        </div>
                    ) : filteredTrips.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-[var(--white)]/40 text-lg">Aucun trajet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredTrips.map((trip) => (
                                <AdminTripCard key={trip.id} trip={trip} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </AdminGuard>
    );
}
