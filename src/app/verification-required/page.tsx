'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Icon from '../_components/ui/icon';

export default function VerificationRequiredPage() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
            return;
        }

        if (
            !loading &&
            user &&
            userProfile &&
            userProfile.isUserVerified &&
            userProfile.isUserDriverVerified
        ) {
            router.push('/auth/profile');
            return;
        }
    }, [user, userProfile, loading, router]);

    if (loading) {
        return (
            <div className="bg-[var(--white)] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="bg-[var(--dark-green)] flex-1 flex flex-col py-8 px-4">
            <div className="md:wrapper wrapper flex-1 flex items-center justify-center">
                <div className="max-w-md w-full bg-[var(--white)] rounded-3xl p-8 text-center shadow-xl">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-yellow-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-semibold text-[var(--black)] font-staatliches mb-2">
                            Vérification requise
                        </h2>
                        <p className="text-[var(--black)] mt-2">
                            Vous devez avoir un profil vérifié pour accéder à ce contenu !
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Link
                            href="/auth/profile"
                            className="w-full bg-[var(--orange)] hover:bg-[var(--orange)] opacity-90 hover:opacity-100 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Icon
                                name="check"
                                width={20}
                                height={20}
                                strokeColor="var(--white)"
                                strokeWidth={1}
                                fillColor="none"
                            />
                            Faire vérifier mon compte
                        </Link>

                        <div>
                            <Link
                                href="/join-trip"
                                className="text-[var(--black)] hover:text-[var(--orange)] font-medium transition-colors"
                            >
                                Retour à la recherche de trajets
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Pourquoi cette vérification ?</strong>
                            <br />
                            Nous vérifions l&apos;identité de nos utilisatrices pour garantir la
                            sécurité et la confiance dans notre communauté de covoiturage.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
