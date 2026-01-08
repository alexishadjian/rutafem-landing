'use client';

import { ConfirmationModal } from '@/app/_components/confirmation-modal';
import { ReviewsSection } from '@/app/_components/reviews-section';
import Icon from '@/app/_components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { logoutUser } from '@/lib/firebase/auth';
import { getReviewsByUserId, getReviewsLeftByUserId } from '@/lib/firebase/reviews';
import { getUserTrips } from '@/lib/firebase/trips';
import { db } from '@/lib/firebaseConfig';
import {
    createOrLinkStripeAccount,
    createStripeAccountLink,
    getStripeStatus,
    unlinkStripeAccount,
} from '@/services/stripe';
import { Review } from '@/types/reviews.types';
import { Trip } from '@/types/trips.types';
import { doc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TripsSection } from './_components/trips-section';
import { UserContact } from './_components/user-contact';
import { UserInformations } from './_components/user-informations';
import { VerificationStatus } from './_components/verification-status';

export default function ProfilePage() {
    const { user, userProfile, loading, refreshUserProfile } = useAuth();
    const router = useRouter();
    const [stripeStatus, setStripeStatus] = useState<{
        charges_enabled: boolean;
        payouts_enabled: boolean;
        accountId: string;
    } | null>(null);
    const [unlinkOpen, setUnlinkOpen] = useState(false);
    const [unlinkLoading, setUnlinkLoading] = useState(false);
    const [stripeMessage, setStripeMessage] = useState<string>('');
    const [trips, setTrips] = useState<{ upcoming: Trip[]; completed: Trip[] }>({
        upcoming: [],
        completed: [],
    });
    const [reviews, setReviews] = useState<{ received: Review[]; left: Review[] }>({
        received: [],
        left: [],
    });
    const [tripsLoading, setTripsLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    useEffect(() => {
        if (!loading && (!user || !userProfile)) {
            router.push('/auth/login');
        }
    }, [user, userProfile, loading, router]);

    useEffect(() => {
        const check = async () => {
            if (!userProfile?.stripeAccountId) return;
            try {
                const status = await getStripeStatus(userProfile.stripeAccountId);
                setStripeStatus(status);
            } finally {
            }
        };
        check();
    }, [userProfile?.stripeAccountId]);

    useEffect(() => {
        const fetchTrips = async () => {
            if (!user?.uid) return;
            try {
                setTripsLoading(true);
                const { createdTrips, participatedTrips } = await getUserTrips(user.uid);
                const now = new Date();
                const upcoming = [...createdTrips, ...participatedTrips]
                    .filter((trip) => {
                        const tripDate = new Date(`${trip.departureDate} ${trip.departureTime}`);
                        return tripDate >= now;
                    })
                    .sort((a, b) => {
                        const dateA = new Date(`${a.departureDate} ${a.departureTime}`);
                        const dateB = new Date(`${b.departureDate} ${b.departureTime}`);
                        return dateA.getTime() - dateB.getTime();
                    });
                const completed = [...createdTrips, ...participatedTrips]
                    .filter((trip) => {
                        const tripDate = new Date(`${trip.departureDate} ${trip.departureTime}`);
                        return tripDate < now;
                    })
                    .sort((a, b) => {
                        const dateA = new Date(`${a.departureDate} ${a.departureTime}`);
                        const dateB = new Date(`${b.departureDate} ${b.departureTime}`);
                        return dateB.getTime() - dateA.getTime();
                    });
                setTrips({ upcoming, completed });
            } catch (error) {
                console.error('Erreur lors du chargement des trajets:', error);
            } finally {
                setTripsLoading(false);
            }
        };
        fetchTrips();
    }, [user?.uid]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!user?.uid) return;
            try {
                setReviewsLoading(true);
                const [received, left] = await Promise.all([
                    getReviewsByUserId(user.uid),
                    getReviewsLeftByUserId(user.uid),
                ]);
                setReviews({ received, left });
            } catch (error) {
                console.error('Erreur lors du chargement des avis:', error);
            } finally {
                setReviewsLoading(false);
            }
        };
        fetchReviews();
    }, [user?.uid]);

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
            <div className="min-h-screen bg-[var(--dark-green)] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--pink)] mx-auto mb-4"></div>
                    <p className="text-white">Chargement de votre profil...</p>
                </div>
            </div>
        );
    }

    if (!user || !userProfile) {
        return null;
    }

    const isVerified = userProfile.isUserVerified;

    return (
        <div className="min-h-screen bg-[var(--dark-green)] py-4 md:py-8 px-2 md:px-4">
            <div className="md:wrapper wrapper max-w-full">
                <div className="bg-[var(--white)] rounded-xl shadow-sm border border-gray-200 p-3 md:p-6 mt-2 md:mt-4">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[var(--black)] font-staatliches mb-4 md:mb-6">
                        Mon Profil
                    </h1>

                    {/* Bentoo Layout */}
                    <div className="grid md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
                        <div className="md:col-span-2 md:row-span-2">
                            <UserInformations userProfile={userProfile} />
                        </div>
                        <div className="md:col-span-2">
                            <UserContact userProfile={userProfile} />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                onClick={handleLogout}
                                className="w-full h-full flex justify-center items-center gap-2 py-2 md:py-3 px-3 md:px-4 border border-gray-300 rounded-xl md:rounded-2xl shadow-sm text-xs md:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-200 min-h-[48px]"
                            >
                                <svg
                                    className="w-5 h-5 text-gray-500"
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
                                <span>Se déconnecter</span>
                            </button>
                        </div>
                    </div>

                    {/* Gestion du compte bancaire */}
                    {userProfile.role === 'driver' && (
                        <>
                            {!stripeStatus || !stripeStatus.payouts_enabled ? (
                                <button
                                    onClick={async () => {
                                        if (!user) return;
                                        try {
                                            setStripeMessage('');
                                            const { accountId } = await createOrLinkStripeAccount({
                                                uid: user.uid,
                                                existingAccountId: userProfile?.stripeAccountId,
                                                email: user.email,
                                            });
                                            const returnUrl = `${window.location.origin}/auth/profile`;
                                            const { url } = await createStripeAccountLink(
                                                accountId,
                                                returnUrl,
                                            );
                                            try {
                                                await updateDoc(doc(db, 'users', user.uid), {
                                                    stripeAccountId: accountId,
                                                    updatedAt: new Date(),
                                                });
                                            } catch {
                                                // Silent fail, we will retry or user is already linked
                                            }
                                            window.location.href = url;
                                        } catch (e: unknown) {
                                            setStripeMessage(
                                                e instanceof Error ? e.message : 'Erreur',
                                            );
                                        }
                                    }}
                                    className="w-full mb-4 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--blue)] opacity-90 hover:opacity-100 hover:shadow-sm"
                                >
                                    <Icon
                                        name="creditCard"
                                        width={24}
                                        height={24}
                                        fillColor="none"
                                        strokeColor="var(--white)"
                                    />
                                    <span>Connecter mon compte bancaire</span>
                                </button>
                            ) : (
                                <div className="flex flex-col md:flex-row gap-3 mb-4">
                                    <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Icon
                                                name="check"
                                                width={20}
                                                height={20}
                                                fillColor="var(--dark-green)"
                                                strokeColor="none"
                                            />
                                            <span className="text-sm font-medium text-green-700">
                                                Compte bancaire connecté
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setUnlinkOpen(true)}
                                        className="md:w-auto inline-flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                    >
                                        <Icon
                                            name="creditCard"
                                            width={18}
                                            height={18}
                                            fillColor="none"
                                            strokeColor="var(--white)"
                                        />
                                        <span>Déconnecter mon compte bancaire</span>
                                    </button>
                                </div>
                            )}

                            {stripeMessage && (
                                <div className="text-sm text-red-600 mb-4">{stripeMessage}</div>
                            )}
                        </>
                    )}

                    {/* Verification Cards */}
                    {(!userProfile.idCardFront ||
                        !userProfile.idCardBack ||
                        (userProfile.role === 'driver' &&
                            (!userProfile.driverLicenseFront ||
                                !userProfile.driverLicenseBack))) && (
                        <div className="mb-6 space-y-4">
                            <h3 className="text-xl font-semibold text-[var(--black)] font-staatliches">
                                Vérifications requises
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {(!userProfile.idCardFront || !userProfile.idCardBack) && (
                                    <Link
                                        href="/auth/profile/verification"
                                        className="inline-flex items-center gap-2 py-2 px-4 bg-[var(--orange)] text-[var(--white)] hover:opacity-100 hover:shadow-sm opacity-90 rounded-lg font-medium transition-colors"
                                    >
                                        <span>Vérifier mon identité</span>
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                )}

                                {userProfile.role === 'driver' &&
                                    (!userProfile.driverLicenseFront ||
                                        !userProfile.driverLicenseBack) && (
                                        <Link
                                            href="/auth/profile/driver-license"
                                            className="inline-flex items-center gap-2 py-2 px-4 bg-[var(--pink)] text-[var(--white)] hover:opacity-100 hover:shadow-sm opacity-90 rounded-lg font-medium transition-colors"
                                        >
                                            <span>Vérifier mon permis</span>
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    )}
                            </div>
                        </div>
                    )}

                    {isVerified ? (
                        <>
                            <div className="bg-[var(--white)] p-6 mt-4">
                                <TripsSection
                                    upcomingTrips={trips.upcoming}
                                    completedTrips={trips.completed}
                                    loading={tripsLoading}
                                />
                            </div>

                            <div className="bg-[var(--white)] p-6 mt-4">
                                <div className="mb-6">
                                    <h3 className="text-3xl font-semibold text-[var(--black)] font-staatliches">
                                        Mes avis
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Ici, tu peux consulter les avis laissés par les voyageuses
                                        et conductrices après vos trajets partagés. Chaque retour
                                        compte pour renforcer la confiance et la bienveillance dans
                                        la communauté Rutafem.
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <ReviewsSection
                                        title="Mes avis reçus"
                                        reviews={reviews.received}
                                        loading={reviewsLoading}
                                    />
                                    <ReviewsSection
                                        title="Mes avis laissés"
                                        reviews={reviews.left}
                                        loading={reviewsLoading}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="mt-4">
                            <VerificationStatus />
                        </div>
                    )}
                </div>

                <ConfirmationModal
                    isOpen={unlinkOpen}
                    onClose={() => setUnlinkOpen(false)}
                    onConfirm={async () => {
                        if (!user || !userProfile?.stripeAccountId) return;
                        try {
                            setUnlinkLoading(true);
                            setStripeMessage('');
                            await unlinkStripeAccount(userProfile.stripeAccountId);
                            await updateDoc(doc(db, 'users', user.uid), { stripeAccountId: '' });
                            await refreshUserProfile();
                            setStripeStatus(null);
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
            </div>
        </div>
    );
}
