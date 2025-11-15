'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

type SmartButtonProps = {
    children: ReactNode;
    href?: string;
    onClick?: () => void;
    requireAuth?: boolean;
    requireVerified?: boolean;
    requireDriver?: boolean;
    requireDriverVerified?: boolean;
    className?: string;
    disabled?: boolean;
};

export const SmartButton = ({
    children,
    href,
    onClick,
    requireAuth = false,
    requireVerified = false,
    requireDriver = false,
    requireDriverVerified = false,
    className = '',
    disabled = false,
}: SmartButtonProps) => {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    const handleClick = () => {
        if (disabled) return;

        // Si pas d'exigences, exécuter l'action normalement
        if (!requireAuth && !requireVerified && !requireDriver && !requireDriverVerified) {
            if (href) {
                router.push(href);
            } else if (onClick) {
                onClick();
            }
            return;
        }

        // Vérifier l'authentification
        if (requireAuth && !user) {
            router.push('/verification-required');
            return;
        }

        if (!user) return;

        // Vérifier le profil utilisateur
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

        // Toutes les vérifications passées, exécuter l'action
        if (href) {
            router.push(href);
        } else if (onClick) {
            onClick();
        }
    };

    return (
        <button onClick={handleClick} disabled={disabled || loading} className={className}>
            {children}
        </button>
    );
};
