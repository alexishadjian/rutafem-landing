'use client';

import { AddressAutocomplete, AddressSuggestion } from '@/app/_components/ui/address-autocomplete';
import { TwoWomanLaughing } from '@/public/images';
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
    departureCity: string;
    arrivalCity: string;
    departureAddress: string;
    arrivalAddress: string;
    departureLatitude: number;
    departureLongitude: number;
    arrivalLatitude: number;
    arrivalLongitude: number;
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
            newErrors.arrival = "Veuillez indiquer votre ville d'arrivée";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateForm()) onNext();
    };

    const handleDepartureSelect = (s: AddressSuggestion) => {
        updateFormData({
            departurePlace: s.fulltext,
            departureAddress: s.fulltext,
            departureCity: s.city,
            departureLongitude: s.longitude,
            departureLatitude: s.latitude,
        });
        if (errors.departurePlace) setErrors((prev) => ({ ...prev, departurePlace: undefined }));
    };

    const handleArrivalSelect = (s: AddressSuggestion) => {
        updateFormData({
            arrival: s.fulltext,
            arrivalAddress: s.fulltext,
            arrivalCity: s.city,
            arrivalLongitude: s.longitude,
            arrivalLatitude: s.latitude,
        });
        if (errors.arrival) setErrors((prev) => ({ ...prev, arrival: undefined }));
    };

    return (
        <div className="p-6 md:wrapper wrapper">
            <div className="bg-[var(--white)] rounded-3xl p-6 md:p-8 relative">
                <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
                    <div className="flex justify-center lg:justify-start mb-6 lg:flex-1 lg:self-end lg:-mb-8 lg:pb-0">
                        <Image
                            src={TwoWomanLaughing}
                            alt="Bienvenue sur RutaFem !"
                            sizes="(max-width: 1024px) 100vw, 600px"
                            style={{ objectFit: 'cover' }}
                            width={600}
                            height={600}
                            className="rounded-2xl w-full h-auto lg:rounded-b-none"
                        />
                    </div>

                    <div className="flex flex-col lg:flex-1">
                        <div className="text-center lg:text-left mb-6">
                            <h2 className="text-2xl md:text-5xl font-bold font-montserrat text-[var(--black)] font-staatliches mb-4">
                                Crée ton trajet !
                            </h2>
                            <p className="text-base md:text-md text-gray-700 leading-relaxed">
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
                                <AddressAutocomplete
                                    id="departure-place"
                                    value={formData.departurePlace}
                                    onChange={(v) => updateFormData({ departurePlace: v })}
                                    onSelect={handleDepartureSelect}
                                    placeholder="Ex: Gare de Lyon, 75000 Paris"
                                    hasError={!!errors.departurePlace}
                                    mode="address"
                                    className="sm:px-4 sm:py-3"
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
                                    Lieu d&apos;arrivée{' '}
                                    <span className="text-[--accent-color]">*</span>
                                </label>
                                <AddressAutocomplete
                                    id="arrival"
                                    value={formData.arrival}
                                    onChange={(v) => updateFormData({ arrival: v })}
                                    onSelect={handleArrivalSelect}
                                    placeholder="Ex: Lyon"
                                    hasError={!!errors.arrival}
                                    mode="address"
                                    className="sm:px-4 sm:py-3"
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
                                className="px-6 py-3 text-base md:text-lg bg-[var(--pink)] rounded-lg"
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
