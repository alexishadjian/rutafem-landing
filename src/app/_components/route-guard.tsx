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

        // check if the user needs to be authenticated
        if (requireAuth && !user) {
            router.push('/verification-required');
            return;
        }

        // if there is no user and no authentication requirement, continue
        if (!user) return;

        // check if the user profile exists
        if (!userProfile) {
            router.push('/auth/login');
            return;
        }

        // check if the user is verified
        if (requireVerified && !userProfile.isUserVerified) {
            router.push('/verification-required');
            return;
        }

        // check if the user is a driver
        if (requireDriver && userProfile.role !== 'driver') {
            router.push('/auth/profile/driver-license');
            return;
        }

        // check if the driver is verified
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

    // display a loader during the verification
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

    // if the user needs to be authenticated but is not, display nothing
    if (requireAuth && !user) {
        return null;
    }

    // if the user needs to be verified but is not, display nothing
    if (requireVerified && user && userProfile && !userProfile.isUserVerified) {
        return null;
    }

    // if the user needs to be a driver but is not, display nothing
    if (requireDriver && user && userProfile && userProfile.role !== 'driver') {
        return null;
    }

    // if the user needs to be a verified driver but is not, display nothing
    if (requireDriverVerified && user && userProfile && !userProfile.isUserDriverVerified) {
        return null;
    }

    return <>{children}</>;
};
