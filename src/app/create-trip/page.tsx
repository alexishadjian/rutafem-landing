'use client';

import { RouteGuard } from '@/app/_components/route-guard';
import Icon from '@/app/_components/ui/icon';
import Stepper from '@/components/ui/stepper';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import ConfirmationStep from './_components/confirmation-step';
import TripFormStep from './_components/trip-form-step';
import WelcomeStep from './_components/welcome-step';

type TripFormData = {
    departurePlace: string;
    arrival: string;
    date: string;
    time: string;
    seats: string;
    price: string;
    description: string;
};

function CreateTripContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentStep = parseInt(searchParams.get('step') || '1');
    const { userProfile } = useAuth();
    const [stripeOk, setStripeOk] = useState<boolean | null>(null);

    const [formData, setFormData] = useState<TripFormData>({
        departurePlace: '',
        arrival: '',
        date: '',
        time: '',
        seats: '1',
        price: '',
        description: '',
    });

    const updateFormData = (data: Partial<TripFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const goToNextStep = () => {
        const nextStep = Math.min(currentStep + 1, 3);
        router.push(`/create-trip?step=${nextStep}`);
    };

    const goToStep = (step: number) => {
        router.push(`/create-trip?step=${step}`);
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <WelcomeStep
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={goToNextStep}
                    />
                );
            case 2:
                return (
                    <TripFormStep
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={goToNextStep}
                        onBack={() => goToStep(1)}
                    />
                );
            case 3:
                return <ConfirmationStep formData={formData} onBack={() => goToStep(2)} />;
            default:
                return (
                    <WelcomeStep
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={goToNextStep}
                    />
                );
        }
    };

    // check Stripe Connect (payouts_enabled) and block if not connected
    useState(() => {
        const check = async () => {
            if (!userProfile?.stripeAccountId) {
                setStripeOk(false);
                return;
            }
            try {
                const res = await fetch('/api/stripe/connect/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accountId: userProfile.stripeAccountId }),
                });
                if (!res.ok) {
                    setStripeOk(false);
                    return;
                }
                const json = await res.json();
                setStripeOk(Boolean(json.payouts_enabled));
            } catch {
                setStripeOk(false);
            }
        };
        check();
    });

    return (
        <RouteGuard
            requireAuth={true}
            requireVerified={true}
            requireDriver={true}
            requireDriverVerified={true}
        >
            <div
                id="welcome-message"
                className="bg-[var(--dark-green)] flex-1 flex flex-col py-6 lg:p-12"
            >
                <div className="p-6">
                    <Stepper totalSteps={3} currentStep={currentStep} />
                </div>

                {stripeOk === false ? (
                    <div className="md:wrapper wrapper flex-1 flex items-center justify-center py-8">
                        <div className="max-w-md w-full bg-[var(--white)] rounded-3xl p-8 text-center shadow-xl">
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon
                                        name="creditCard"
                                        width={32}
                                        height={32}
                                        strokeColor="var(--orange)"
                                        strokeWidth={2}
                                        fillColor="none"
                                    />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-semibold text-[var(--black)] font-staatliches mb-2">
                                    Compte bancaire requis
                                </h2>
                                <p className="text-[var(--black)] mt-2">
                                    Pour publier un trajet, connecte d&apos;abord ton compte
                                    bancaire Stripe.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => router.push('/auth/profile/')}
                                    className="w-full bg-[var(--orange)] hover:bg-[var(--orange)] opacity-90 hover:opacity-100 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Icon
                                        name="lock"
                                        width={20}
                                        height={20}
                                        strokeColor="none"
                                        fillColor="var(--white)"
                                    />
                                    Connecter mon compte bancaire
                                </button>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Pourquoi cette connexion ?</strong>
                                    <br />
                                    Nous utilisons Stripe pour sécuriser tes paiements et te
                                    permettre de recevoir tes gains en toute sécurité.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    renderCurrentStep()
                )}
            </div>
        </RouteGuard>
    );
}

export default function CreateTripPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement...</p>
                    </div>
                </div>
            }
        >
            <Suspense fallback={<div>Chargement...</div>}>
                <CreateTripContent />
            </Suspense>
        </Suspense>
    );
}
