'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

const ADMIN_EMAILS = ['admin@rutafem.com'];

type AdminGuardProps = { children: ReactNode };

export const AdminGuard = ({ children }: AdminGuardProps) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (loading) return;
        if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
            router.push('/');
            return;
        }
        setIsAdmin(true);
    }, [user, loading, router]);

    if (loading || !isAdmin) {
        return (
            <div className="min-h-screen bg-[var(--dark-green)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--pink)]" />
            </div>
        );
    }

    return <>{children}</>;
};
