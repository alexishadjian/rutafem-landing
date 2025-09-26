'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';


export default function BankingPage() {
    const { user, userProfile, loading } = useAuth();

    const router = useRouter();

    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!loading && (!user || !userProfile)) router.push('/auth/login');
    }, [user, userProfile, loading, router]);

    const startOnboarding = async () => {
        if (!user) return;
        try {
            setIsLoadingAction(true);
            setError('');
            setSuccess('');

            const createRes = await fetch('/api/stripe/connect/create-or-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid, existingAccountId: userProfile?.stripeAccountId, email: user.email }),
            });
            const createJson = await createRes.json();
            if (!createRes.ok) throw new Error(createJson.error || 'Erreur Stripe');

            const returnUrl = `${window.location.origin}/auth/profile`;
            const linkRes = await fetch('/api/stripe/connect/account-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId: createJson.accountId, returnUrl }),
            });
            const linkJson = await linkRes.json();
            if (!linkRes.ok) throw new Error(linkJson.error || 'Erreur AccountLink');
            // Sauvegarde côté client (Firetore) après redirection retour
            try {
                await updateDoc(doc(db, 'users', user.uid), { stripeAccountId: createJson.accountId });
            } catch {
                setError('Erreur lors de la mise à jour du compte bancaire');
            }

            window.location.href = linkJson.url as string;
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Erreur');
        } finally {
            setIsLoadingAction(false);
        }
    };

    if (loading || !user || !userProfile) return null;

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <h1 className="text-2xl font-semibold text-gray-900">Compte bancaire Stripe</h1>
                <p className="text-gray-600">
                    Connectez votre compte bancaire via Stripe pour recevoir les paiements de vos
                    passagères.
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">{success}</p>
                    </div>
                )}

                <button
                    onClick={startOnboarding}
                    disabled={isLoadingAction}
                    className="w-full flex justify-center py-3 px-4 rounded-lg text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
                >
                    {isLoadingAction ? 'Redirection...' : 'Connecter mon compte bancaire'}
                </button>
            </div>
        </div>
    );
}


