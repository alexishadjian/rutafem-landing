'use client';

import { TwoWomanLaughing } from '@/public/images';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

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

type GeoSuggestion = {
    fulltext: string;
    city: string;
    longitude: number; // longitude
    latitude: number; // latitude
};

const GEOPLATEFORME_API = 'https://data.geopf.fr/geocodage/completion';

const fetchSuggestions = async (text: string): Promise<GeoSuggestion[]> => {
    if (text.length < 3) return [];
    const url = `${GEOPLATEFORME_API}?text=${encodeURIComponent(
        text,
    )}&type=StreetAddress,PositionOfInterest&maximumResponses=5`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map(
        (r: { fulltext: string; city: string; x: number; y: number }) => ({
            fulltext: r.fulltext,
            city: r.city,
            longitude: r.x,
            latitude: r.y,
        }),
    );
};

type AddressAutocompleteProps = {
    id: string;
    value: string;
    onChange: (value: string) => void;
    onSelect: (suggestion: GeoSuggestion) => void;
    placeholder: string;
    hasError: boolean;
};

const AddressAutocomplete = ({
    id,
    value,
    onChange,
    onSelect,
    placeholder,
    hasError,
}: AddressAutocompleteProps) => {
    const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const debouncedFetch = useCallback(async (text: string) => {
        const results = await fetchSuggestions(text);
        setSuggestions(results);
        setIsOpen(results.length > 0);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => debouncedFetch(value), 300);
        return () => clearTimeout(timer);
    }, [value, debouncedFetch]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (suggestion: GeoSuggestion) => {
        onChange(suggestion.fulltext);
        onSelect(suggestion);
        setIsOpen(false);
        setSuggestions([]);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <input
                type="text"
                id={id}
                autoComplete="off"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent text-sm sm:text-base ${
                    hasError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={placeholder}
            />
            {isOpen && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((s, i) => (
                        <li
                            key={i}
                            onClick={() => handleSelect(s)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                            {s.fulltext}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
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

    const handleDepartureSelect = (s: GeoSuggestion) => {
        updateFormData({
            departurePlace: s.fulltext,
            departureAddress: s.fulltext,
            departureCity: s.city,
            departureLongitude: s.longitude,
            departureLatitude: s.latitude,
        });
        if (errors.departurePlace) setErrors((prev) => ({ ...prev, departurePlace: undefined }));
    };

    const handleArrivalSelect = (s: GeoSuggestion) => {
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
