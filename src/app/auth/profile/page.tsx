'use client';

import { useAuth } from '@/contexts/AuthContext';
import { logoutUser } from '@/lib/firebaseAuth';
import Link from 'next/link';
import { ConfirmationModal } from '@/app/_components/confirmation-modal';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserTrips from './_components/user-trips';

export default function ProfilePage() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const [stripeStatus, setStripeStatus] = useState<
        | { charges_enabled: boolean; payouts_enabled: boolean; accountId: string }
        | null
    >(null);
    const [checkingStripe, setCheckingStripe] = useState(false);
    const [unlinkOpen, setUnlinkOpen] = useState(false);
    const [unlinkLoading, setUnlinkLoading] = useState(false);
    const [stripeMessage, setStripeMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    const unlinkStripe = async () => {
        if (!user || !userProfile?.stripeAccountId) return;
        try {
            setUnlinkLoading(true);
            setError('');
            setSuccess('');
            const res = await fetch('/api/stripe/connect/unlink', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId: userProfile.stripeAccountId }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Erreur Stripe');
            await updateDoc(doc(db, 'users', user.uid), { stripeAccountId: '' });
            setSuccess('Compte bancaire déconnecté avec succès');
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Erreur');
        } finally {
            setUnlinkLoading(false);
            setUnlinkOpen(false);
        }
    };

    // Redirection vers login si pas connecté
    useEffect(() => {
        if (!loading && (!user || !userProfile)) {
            router.push('/auth/login');
        }
    }, [user, userProfile, loading, router]);

    useEffect(() => {
        const check = async () => {
            if (!userProfile?.stripeAccountId) return;
            setCheckingStripe(true);
            try {
                const res = await fetch('/api/stripe/connect/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accountId: userProfile?.stripeAccountId }),
                });
                const json = await res.json();
                if (res.ok) setStripeStatus(json);
            } finally {
                setCheckingStripe(false);
            }
        };
        check();
    }, [userProfile?.stripeAccountId]);

    const handleLogout = async () => {
        try {
            await logoutUser();
            router.push('/auth/login');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement de votre profil...</p>
                </div>
            </div>
        );
    }

    // Si pas connecté, on affiche rien (la redirection se fait dans useEffect)
    if (!user || !userProfile) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">RutaFem</h1>
                    <h2 className="text-2xl font-semibold text-gray-700">Mon Profil</h2>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    {/* En-tête du profil */}
                    <div className="text-center pb-6 border-b border-gray-200">
                        <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-12 h-12 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">
                            {userProfile.firstName} {userProfile.lastName}
                        </h3>
                        <p className="text-gray-600">{userProfile.email}</p>
                    </div>

                    {/* Informations du profil */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Nom complet</span>
                            <span className="text-sm text-gray-900">
                                {userProfile.firstName} {userProfile.lastName}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Email</span>
                            <span className="text-sm text-gray-900">{userProfile.email}</span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Téléphone</span>
                            <span className="text-sm text-gray-900">{userProfile.phoneNumber}</span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Rôle</span>
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${userProfile.role === 'driver'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {userProfile.role === 'driver' ? 'Chauffeuse' : 'Passagère'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">
                                Statut de vérification
                            </span>
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${userProfile.verificationStatus === 'Vérifié'
                                    ? 'bg-green-100 text-green-800'
                                    : userProfile.verificationStatus === 'Rejeté'
                                        ? 'bg-red-100 text-red-800'
                                        : userProfile.verificationStatus === 'En cours'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}
                            >
                                {userProfile.verificationStatus === 'Vérifié' ? (
                                    <>
                                        <svg
                                            className="w-4 h-4 mr-1"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Vérifiée
                                    </>
                                ) : userProfile.verificationStatus === 'Rejeté' ? (
                                    <>
                                        <svg
                                            className="w-4 h-4 mr-1"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Rejetée
                                    </>
                                ) : userProfile.verificationStatus === 'En cours' ? (
                                    <>
                                        <svg
                                            className="w-4 h-4 mr-1"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        En cours
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-4 h-4 mr-1"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        A vérifier
                                    </>
                                )}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">
                                Vérification permis
                            </span>
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${userProfile.driverLicenseVerificationStatus === 'Vérifié'
                                    ? 'bg-green-100 text-green-800'
                                    : userProfile.driverLicenseVerificationStatus === 'Rejeté'
                                        ? 'bg-red-100 text-red-800'
                                        : userProfile.driverLicenseVerificationStatus === 'En cours'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}
                            >
                                {userProfile.driverLicenseVerificationStatus === 'Vérifié' ? (
                                    <>
                                        <svg
                                            className="w-4 h-4 mr-1"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Vérifiée
                                    </>
                                ) : userProfile.driverLicenseVerificationStatus === 'Rejeté' ? (
                                    <>
                                        <svg
                                            className="w-4 h-4 mr-1"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Rejeté
                                    </>
                                ) : userProfile.driverLicenseVerificationStatus === 'En cours' ? (
                                    <>
                                        <svg
                                            className="w-4 h-4 mr-1"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        En cours
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-4 h-4 mr-1"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        A vérifier
                                    </>
                                )}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">
                                Compte créé le
                            </span>
                            <span className="text-sm text-gray-900">
                                {userProfile.createdAt.toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Notice de vérification */}
                    {userProfile.verificationStatus === 'A vérifier' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-blue-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Vérification requise
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p>
                                            Pour utiliser RutaFem en toute sécurité, vous devez
                                            vérifier votre identité.
                                        </p>
                                        <p className="mt-1">
                                            Envoyez vos documents pour accéder à tous les services.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notice en cours de vérification */}
                    {userProfile.verificationStatus === 'En cours' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-blue-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 0116 0zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Vérification en cours
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p>
                                            Vos documents ont été envoyés et sont en cours de
                                            vérification par notre équipe.
                                        </p>
                                        <p className="mt-1">
                                            Vous recevrez une notification une fois la vérification
                                            terminée.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-6 space-y-4">
                        {userProfile.verificationStatus === 'A vérifier' && (
                            <Link
                                href="/auth/profile/verification"
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Vérifier mon profil
                            </Link>
                        )}

                        {userProfile.driverLicenseVerificationStatus === 'A vérifier' && (
                            <Link
                                href="/auth/profile/driver-license"
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Devenir chauffeuse
                            </Link>
                        )}

                        {userProfile.role === 'driver' && (!stripeStatus || !stripeStatus.payouts_enabled) && (
                            <button
                                onClick={async () => {
                                    if (!user) return;
                                    try {
                                        setStripeMessage('');
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

                                        try {
                                            await updateDoc(doc(db, 'users', user.uid), { stripeAccountId: createJson.accountId });
                                        } catch {
                                            setStripeMessage('Erreur lors de la mise à jour du compte bancaire');
                                        }
                                        window.location.href = linkJson.url as string;
                                    } catch (e: unknown) {
                                        setStripeMessage(e instanceof Error ? e.message : 'Erreur');
                                    }
                                }}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 10h18M5 10V7a2 2 0 012-2h10a2 2 0 012 2v3m-2 4h.01M6 14h.01M10 14h.01M14 14h.01M18 14h.01M6 18h12a2 2 0 002-2V8H4v8a2 2 0 002 2z"
                                    />
                                </svg>
                                Connecter mon compte bancaire
                            </button>
                        )}

                        {userProfile.role === 'driver' && stripeStatus?.payouts_enabled && (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <div className="flex-1 w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-medium text-green-700 bg-green-50 border border-green-200">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Compte bancaire connecté
                                </div>
                                <button
                                    onClick={() => setUnlinkOpen(true)}
                                    className="w-full sm:w-auto inline-flex justify-center items-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Déconnecter mon compte
                                </button>
                            </div>
                        )}
                        {stripeMessage && (
                            <div className="text-sm text-red-600">{stripeMessage}</div>
                        )}

                        <button
                            onClick={handleLogout}
                            className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-200"
                        >
                            <svg
                                className="w-5 h-5 mr-2 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            Se déconnecter
                        </button>
                    </div>
                </div>

                <ConfirmationModal
                    isOpen={unlinkOpen}
                    onClose={() => setUnlinkOpen(false)}
                    onConfirm={async () => {
                        if (!user || !userProfile?.stripeAccountId) return;
                        try {
                            setUnlinkLoading(true);
                            setStripeMessage('');
                            const res = await fetch('/api/stripe/connect/unlink', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ accountId: userProfile.stripeAccountId }),
                            });
                            const json = await res.json();
                            if (!res.ok) throw new Error(json.error || 'Erreur Stripe');
                            await updateDoc(doc(db, 'users', user.uid), { stripeAccountId: '' });
                            setStripeMessage('Compte bancaire déconnecté.');
                        } catch (e: unknown) {
                            setStripeMessage(e instanceof Error ? e.message : 'Erreur');
                        } finally {
                            setUnlinkLoading(false);
                            setUnlinkOpen(false);
                        }
                    }}
                    title="Déconnecter le compte bancaire"
                    message="Cette action supprime le lien entre votre profil RutaFem et votre compte Stripe. Vous pourrez le reconnecter plus tard si nécessaire."
                    confirmText="Déconnecter"
                    cancelText="Annuler"
                    type="danger"
                    loading={unlinkLoading}
                />

                {/* Section Trajets */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <svg
                                className="w-6 h-6 text-pink-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            Mes trajets
                        </h2>
                    </div>

                    {user && <UserTrips userId={user.uid} />}
                </div>
            </div>
        </div>
    );
}
