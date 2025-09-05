'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

type RouteGuardProps = {
    children: ReactNode;
    requireAuth?: boolean;
    requireVerified?: boolean;
    requireDriver?: boolean;
    requireDriverVerified?: boolean;
    redirectTo?: string;
};

export const RouteGuard = ({
    children,
    requireAuth = false,
    requireVerified = false,
    requireDriver = false,
    requireDriverVerified = false,
    redirectTo = '/auth/login',
}: RouteGuardProps) => {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        // Vérifier si l'utilisateur doit être connecté
        if (requireAuth && !user) {
            router.push('/verification-required');
            return;
        }

        // Si pas d'utilisateur et pas d'exigence d'auth, continuer
        if (!user) return;

        // Vérifier si le profil utilisateur existe
        if (!userProfile) {
            router.push('/auth/login');
            return;
        }

        // Vérifier la vérification utilisateur
        if (requireVerified && !userProfile.isUserVerified) {
            router.push('/verification-required');
            return;
        }

        // Vérifier le rôle driver
        if (requireDriver && userProfile.role !== 'driver') {
            router.push('/auth/profile/driver-license');
            return;
        }

        // Vérifier la vérification driver
        if (requireDriverVerified && !userProfile.isUserDriverVerified) {
            router.push('/verification-required');
            return;
        }
    }, [
        user,
        userProfile,
        loading,
        requireAuth,
        requireVerified,
        requireDriver,
        requireDriverVerified,
        redirectTo,
        router,
    ]);

    // Afficher un loader pendant la vérification
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Vérification des permissions...</p>
                </div>
            </div>
        );
    }

    // Si l'utilisateur doit être connecté mais ne l'est pas
    if (requireAuth && !user) {
        return null;
    }

    // Si l'utilisateur doit être vérifié mais ne l'est pas
    if (requireVerified && user && userProfile && !userProfile.isUserVerified) {
        return null;
    }

    // Si l'utilisateur doit être driver mais ne l'est pas
    if (requireDriver && user && userProfile && userProfile.role !== 'driver') {
        return null;
    }

    // Si l'utilisateur doit être driver vérifié mais ne l'est pas
    if (requireDriverVerified && user && userProfile && !userProfile.isUserDriverVerified) {
        return null;
    }

    return <>{children}</>;
};
