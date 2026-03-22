'use client';

import { getAllUsers } from '@/lib/firebase/admin';
import { AdminUser } from '@/types/admin.types';
import { logFirebaseError } from '@/utils/errors';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminGuard } from '../_components/admin-guard';
import { AdminUserCard } from '../_components/user-card';

type FilterRole = 'all' | 'passenger' | 'driver';

export default function UsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [filter, setFilter] = useState<FilterRole>('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setUsers(await getAllUsers());
            } catch (error) {
                logFirebaseError('UsersPage.loadData', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredUsers = users.filter((user) => {
        const matchesRole = filter === 'all' || user.role === filter;
        const matchesSearch =
            search === '' ||
            `${user.firstName} ${user.lastName} ${user.email}`
                .toLowerCase()
                .includes(search.toLowerCase());
        return matchesRole && matchesSearch;
    });

    return (
        <AdminGuard>
            <main className="min-h-screen bg-[var(--dark-green)] py-8">
                <div className="wrapper">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/rutadmin"
                                className="text-[var(--white)] hover:text-[var(--pink)] transition-colors"
                            >
                                ← Retour
                            </Link>
                            <h1 className="text-[var(--white)] text-2xl font-bold">
                                Utilisatrices ({filteredUsers.length})
                            </h1>
                        </div>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-[var(--dark-green)] text-[var(--white)] rounded-lg px-4 py-2 border border-[var(--white)]/10 focus:border-[var(--pink)] outline-none"
                            />
                            <div className="flex gap-2">
                                {(['all', 'passenger', 'driver'] as const).map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setFilter(role)}
                                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                            filter === role
                                                ? 'bg-[var(--pink)] text-[var(--white)]'
                                                : 'bg-[var(--dark-green)] text-[var(--white)] hover:text-[var(--pink)]'
                                        }`}
                                    >
                                        {role === 'all'
                                            ? 'Toutes'
                                            : role === 'passenger'
                                              ? 'Passagères'
                                              : 'Conductrices'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--pink)]" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-[var(--white)]/40 text-lg">Aucune utilisatrice</p>
                        </div>
                    ) : (
                        <>
                            {/* Verified Users */}
                            <section className="mb-8">
                                <h2 className="text-[var(--white)] text-xl font-semibold mb-4 flex items-center gap-3">
                                    Utilisatrices vérifiées
                                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-sm font-medium">
                                        {filteredUsers.filter((u) => u.isUserVerified).length}
                                    </span>
                                </h2>
                                {filteredUsers.filter((u) => u.isUserVerified).length === 0 ? (
                                    <p className="text-[var(--white)]/40 text-center py-8">
                                        Aucune utilisatrice vérifiée
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredUsers
                                            .filter((u) => u.isUserVerified)
                                            .map((user) => (
                                                <AdminUserCard key={user.uid} user={user} />
                                            ))}
                                    </div>
                                )}
                            </section>

                            {/* Non-verified Users */}
                            <section>
                                <h2 className="text-[var(--white)] text-xl font-semibold mb-4 flex items-center gap-3">
                                    Utilisatrices non vérifiées
                                    <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-sm font-medium">
                                        {filteredUsers.filter((u) => !u.isUserVerified).length}
                                    </span>
                                </h2>
                                {filteredUsers.filter((u) => !u.isUserVerified).length === 0 ? (
                                    <p className="text-[var(--white)]/40 text-center py-8">
                                        Aucune utilisatrice non vérifiée
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredUsers
                                            .filter((u) => !u.isUserVerified)
                                            .map((user) => (
                                                <AdminUserCard key={user.uid} user={user} />
                                            ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </main>
        </AdminGuard>
    );
}
