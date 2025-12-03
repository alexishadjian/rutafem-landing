'use client';

import { getPendingVerifications } from '@/lib/firebase/admin';
import { PendingVerification } from '@/types/admin.types';
import { logFirebaseError } from '@/utils/errors';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminGuard } from '../_components/admin-guard';
import { VerificationCard } from '../_components/verification-card';
import { VerificationModal } from '../_components/verification-modal';

export default function VerificationsPage() {
    const [verifications, setVerifications] = useState<PendingVerification[]>([]);
    const [selected, setSelected] = useState<PendingVerification | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setVerifications(await getPendingVerifications());
        } catch (error) {
            logFirebaseError('VerificationsPage.loadData', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <AdminGuard>
            <main className="min-h-screen bg-[var(--dark-green)] py-8">
                <div className="wrapper">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link
                            href="/rutadmin"
                            className="text-[var(--white)] hover:text-[var(--pink)] transition-colors"
                        >
                            ← Retour
                        </Link>
                        <h1 className="text-[var(--white)] text-2xl font-bold">
                            Vérifications en attente ({verifications.length})
                        </h1>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--pink)]" />
                        </div>
                    ) : verifications.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-[var(--white)] text-lg">
                                Aucune vérification en attente 🎉
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {verifications.map((user) => (
                                <VerificationCard
                                    key={user.uid}
                                    user={user}
                                    onClick={() => setSelected(user)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {selected && (
                    <VerificationModal
                        user={selected}
                        onClose={() => setSelected(null)}
                        onAction={loadData}
                    />
                )}
            </main>
        </AdminGuard>
    );
}
