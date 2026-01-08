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

        if (!requireAuth && !requireVerified && !requireDriver && !requireDriverVerified) {
            onClick?.();
            if (href) {
                router.push(href);
            }
            return;
        }

        // check auth
        if (requireAuth && !user) {
            onClick?.();
            router.push('/verification-required');
            return;
        }

        if (!user) return;

        // check user profile
        if (!userProfile) {
            onClick?.();
            router.push('/auth/login');
            return;
        }

        // check user verification
        if (requireVerified && !userProfile.isUserVerified) {
            onClick?.();
            router.push('/verification-required');
            return;
        }

        // check driver role
        if (requireDriver && userProfile.role !== 'driver') {
            onClick?.();
            router.push('/auth/profile/driver-license');
            return;
        }

        // check driver verification
        if (requireDriverVerified && !userProfile.isUserDriverVerified) {
            onClick?.();
            router.push('/verification-required');
            return;
        }

        // all checks passed, execute action
        onClick?.();
        if (href) {
            router.push(href);
        }
    };

    return (
        <button onClick={handleClick} disabled={disabled || loading} className={className}>
            {children}
        </button>
    );
};
