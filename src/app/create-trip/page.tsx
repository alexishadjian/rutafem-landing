'use client';

import { RouteGuard } from '@/app/_components/route-guard';
import Stepper from '@/components/ui/stepper';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import ConfirmationStep from './_components/confirmation-step';
import TripFormStep from './_components/trip-form-step';
import WelcomeStep from './_components/welcome-step';

type TripFormData = {
    departure: string;
    arrival: string;
    date: string;
    time: string;
    seats: string;
    price: string;
    departurePlace: string;
    description: string;
};

export default function CreateTripPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentStep = parseInt(searchParams.get('step') || '1');

    const [formData, setFormData] = useState<TripFormData>({
        departure: '',
        arrival: '',
        date: '',
        time: '',
        seats: '1',
        price: '',
        departurePlace: '',
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
                return <WelcomeStep onNext={goToNextStep} />;
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
                return <WelcomeStep onNext={goToNextStep} />;
        }
    };

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

                    {renderCurrentStep()}
                </section>
            </div>
        </RouteGuard>
    );
}
