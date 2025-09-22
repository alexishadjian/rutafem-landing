import { HeroBanner } from '@/public/images';
import Image from 'next/image';
import { useState } from 'react';

type TripFormData = {
    departurePlace: string;
    arrival: string;
    date: string;
    time: string;
    seats: string;
    price: string;
    description: string;
};

type WelcomeStepProps = {
    formData: TripFormData;
    updateFormData: (data: Partial<TripFormData>) => void;
    onNext: () => void;
};

export default function WelcomeStep({ formData, updateFormData, onNext }: WelcomeStepProps) {
    const [errors, setErrors] = useState<Partial<TripFormData>>({});

    const validateForm = (): boolean => {
        const newErrors: Partial<TripFormData> = {};

        if (!formData.departurePlace.trim()) {
            newErrors.departurePlace = 'Veuillez indiquer votre lieu de départ';
        }
        if (!formData.arrival.trim()) {
            newErrors.arrival = 'Veuillez indiquer votre ville d&apos;arrivée';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateForm()) {
            onNext();
        }
    };

    const handleInputChange = (field: keyof TripFormData, value: string) => {
        updateFormData({ [field]: value });
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <div className="p-6 mt-10">
            <div className="bg-gray-100 rounded-3xl p-6 md:p-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
                    <div className="flex justify-center lg:justify-start mb-6 lg:mb-0 lg:flex-1">
                        <Image
                            src={HeroBanner}
                            alt="Bienvenue sur RutaFem !"
                            sizes="(max-width: 1024px) 100vw, 600px"
                            style={{ objectFit: 'cover' }}
                            width={600}
                            height={600}
                            className="rounded-2xl w-full h-auto"
                        />
                    </div>

                    <div className="flex flex-col lg:flex-1">
                        <div className="text-center lg:text-left mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-[--accent-color] mb-4">
                                Bienvenue !
                            </h2>

                            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                                Ici, tu peux proposer ton trajet de covoiturage. Plus nous
                                partageons, plus nous rendons les voyages accessibles, sûrs et
                                solidaires. 💜
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="departure-place"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Lieu de départ <span className="text-[--accent-color]">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="departure-place"
                                    value={formData.departurePlace}
                                    onChange={(e) =>
                                        handleInputChange('departurePlace', e.target.value)
                                    }
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent text-sm sm:text-base ${
                                        errors.departurePlace ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Ex: Gare de Lyon, 75000 Paris"
                                />
                                {errors.departurePlace && (
                                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                                        {errors.departurePlace}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="arrival"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Ville d&apos;arrivée{' '}
                                    <span className="text-[--accent-color]">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="arrival"
                                    value={formData.arrival}
                                    onChange={(e) => handleInputChange('arrival', e.target.value)}
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent text-sm sm:text-base ${
                                        errors.arrival ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Ex: Lyon"
                                />
                                {errors.arrival && (
                                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                                        {errors.arrival}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-center lg:justify-start mt-6">
                            <button
                                onClick={handleNext}
                                className="btn px-6 py-3 text-base md:text-lg"
                            >
                                Continuer →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
