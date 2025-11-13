'use client';

import { RouteGuard } from '@/app/_components/route-guard';
import { useAuth } from '@/contexts/AuthContext';
import Stepper from '@/components/ui/stepper';
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

    // Vérifier Stripe Connect (payouts_enabled) et bloquer si non connecté
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
            <div className="create-trip">
                <section id="welcome-message" className="wrapper">
                    <div className="p-6">
                        <Stepper totalSteps={3} currentStep={currentStep} />
                    </div>

                    {stripeOk === false ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-yellow-800">
                            <h3 className="font-semibold mb-2">Compte bancaire requis</h3>
                            <p className="mb-4">Pour publier un trajet, connecte d'abord ton compte bancaire Stripe.</p>
                            <button
                                onClick={() => router.push('/auth/profile/banking')}
                                className="btn"
                            >
                                Connecter mon compte bancaire
                            </button>
                        </div>
                    ) : (
                        renderCurrentStep()
                    )}
                </section>
            </div>
        </RouteGuard>
    );
}

export default function CreateTripPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
