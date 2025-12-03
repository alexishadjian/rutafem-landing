'use client';

import {
    getAdminStats,
    getAllTrips,
    getAllUsers,
    getPendingVerifications,
} from '@/lib/firebase/admin';
import { AdminStats, AdminUser, PendingVerification } from '@/types/admin.types';
import { Trip } from '@/types/trips.types';
import { logFirebaseError } from '@/utils/errors';
import { useEffect, useState } from 'react';
import { AdminGuard } from './_components/admin-guard';
import { SectionHeader } from './_components/section-header';
import { StatCard } from './_components/stat-card';
import { AdminTripCard } from './_components/trip-card';
import { AdminUserCard } from './_components/user-card';
import { VerificationCard } from './_components/verification-card';
import { VerificationModal } from './_components/verification-modal';

const PREVIEW_LIMIT = 3;

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [verifications, setVerifications] = useState<PendingVerification[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [selectedVerification, setSelectedVerification] = useState<PendingVerification | null>(
        null,
    );
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [statsData, verificationsData, tripsData, usersData] = await Promise.all([
                getAdminStats(),
                getPendingVerifications(),
                getAllTrips(),
                getAllUsers(),
            ]);
            setStats(statsData);
            setVerifications(verificationsData);
            setTrips(tripsData);
            setUsers(usersData);
        } catch (error) {
            logFirebaseError('AdminDashboard.loadData', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleVerificationAction = () => {
        loadData();
    };

    return (
        <AdminGuard>
            <main className="min-h-screen bg-[var(--dark-green)] py-8">
                <div className="wrapper">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-[var(--white)] text-3xl font-bold mb-2">
                            Dashboard Admin
                        </h1>
                        <p className="text-[var(--white)]">Panneau d&apos;administration RutaFem</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--pink)]" />
                        </div>
                    ) : (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <StatCard
                                    title="Utilisatrices"
                                    value={stats?.totalUsers ?? 0}
                                    icon="👥"
                                    color="pink"
                                />
                                <StatCard
                                    title="Vérifications en attente"
                                    value={stats?.pendingVerifications ?? 0}
                                    icon="⏳"
                                    color="yellow"
                                />
                                <StatCard
                                    title="Trajets actifs"
                                    value={stats?.activeTrips ?? 0}
                                    icon="🚗"
                                    color="blue"
                                />
                                <StatCard
                                    title="Total trajets"
                                    value={stats?.totalTrips ?? 0}
                                    icon="📊"
                                    color="orange"
                                />
                            </div>

                            {/* Verifications Section */}
                            <section className="mb-8">
                                <SectionHeader
                                    title="Vérifications en attente"
                                    count={verifications.length}
                                    viewAllLink="/rutadmin/verifications"
                                />
                                {verifications.length === 0 ? (
                                    <p className="text-[var(--white)] text-center py-8">
                                        Aucune vérification en attente
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {verifications.slice(0, PREVIEW_LIMIT).map((user) => (
                                            <VerificationCard
                                                key={user.uid}
                                                user={user}
                                                onClick={() => setSelectedVerification(user)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Trips Section */}
                            <section className="mb-8">
                                <SectionHeader
                                    title="Trajets récents"
                                    count={trips.length}
                                    viewAllLink="/rutadmin/trips"
                                />
                                {trips.length === 0 ? (
                                    <p className="text-[var(--white)] text-center py-8">
                                        Aucun trajet
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {trips.slice(0, PREVIEW_LIMIT).map((trip) => (
                                            <AdminTripCard key={trip.id} trip={trip} />
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Users Section */}
                            <section>
                                <SectionHeader
                                    title="Utilisatrices"
                                    count={users.length}
                                    viewAllLink="/rutadmin/users"
                                />
                                {users.length === 0 ? (
                                    <p className="text-[var(--white)]/40 text-center py-8">
                                        Aucune utilisatrice
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {users.slice(0, PREVIEW_LIMIT).map((user) => (
                                            <AdminUserCard key={user.uid} user={user} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>

                {/* Verification Modal */}
                {selectedVerification && (
                    <VerificationModal
                        user={selectedVerification}
                        onClose={() => setSelectedVerification(null)}
                        onAction={handleVerificationAction}
                    />
                )}
            </main>
        </AdminGuard>
    );
}
