'use client';

import Icon from '@/app/_components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { createTrip } from '@/lib/firebase/trips';
import { CreateTripData } from '@/types/trips.types';
import { formatDate, formatTime } from '@/utils/date';
import { createTripSchema } from '@/utils/validation';
import { useRouter } from 'next/navigation';
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

type ConfirmationStepProps = {
    formData: TripFormData;
    onBack: () => void;
};

export default function ConfirmationStep({ formData }: ConfirmationStepProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);

    const handleCreateTrip = async () => {
        if (!user) {
            setError('Vous devez être connecté pour publier un trajet');
            return;
        }

        if (!acceptTerms) {
            setError(
                'Vous devez accepter les conditions générales de vente et le partage d&apos;informations pour publier un trajet',
            );
            return;
        }

        setIsCreating(true);
        setError('');

        try {
            const parsed = createTripSchema.parse({
                departureTime: formData.time,
                departureDate: formData.date,
                departureCity: formData.departureCity,
                arrivalCity: formData.arrivalCity,
                arrivalAddress: formData.arrivalAddress,
                departureLatitude: formData.departureLatitude,
                departureLongitude: formData.departureLongitude,
                arrivalLatitude: formData.arrivalLatitude,
                arrivalLongitude: formData.arrivalLongitude,
                totalSeats: formData.seats,
                pricePerSeat: formData.price,
                departureAddress: formData.departureAddress,
                description: formData.description,
            }) as CreateTripData;

            // Minimum loading time to show feedback
            await Promise.all([
                createTrip(user.uid, parsed),
                new Promise((resolve) => setTimeout(resolve, 1000)),
            ]);

            router.push('/create-trip/success');
        } catch (error) {
            console.error('Erreur lors de la création du trajet:', error);
            setError(
                error instanceof Error ? error.message : 'Erreur lors de la création du trajet',
            );
            setIsCreating(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 mt-6 sm:mt-10 md:wrapper wrapper">
            <div className="bg-[var(--white)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl md:text-5xl font-bold font-montserrat text-[var(--black)] font-staatliches mb-4 sm:mb-6 text-center">
                            Informations du trajet
                        </h2>

                        <p className="text-base text-gray-700 mb-4 sm:mb-6 px-2 text-start">
                            Vérifie les informations ci-dessous et clique sur “Publier le trajet”
                            pour confirmer la création et publication de ton trajet. 💜
                        </p>

                        <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-left">
                            <h3 className="font-semibold text-gray-800 mb-4 sm:mb-6 text-start text-xl sm:text-2xl">
                                Récapitulatif :
                            </h3>

                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100 gap-3">
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="bg-[var(--yellow)] rounded-full p-2">
                                            <Icon
                                                name="mapPoint"
                                                strokeColor="var(--black)"
                                                fillColor="var(--black)"
                                                width={16}
                                                height={16}
                                                strokeWidth={1}
                                            />
                                        </div>
                                        <span className="text-gray-600 text-sm sm:text-base">
                                            Trajet :
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-800 text-sm sm:text-base text-right">
                                        {formData.departurePlace || '[Lieu de départ]'} →{' '}
                                        {formData.arrival || "[Ville d'arrivée]"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100 gap-3">
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="bg-[var(--yellow)] rounded-full p-2">
                                            <Icon
                                                name="calendar"
                                                strokeColor="var(--black)"
                                                fillColor="none"
                                                width={16}
                                                height={16}
                                                strokeWidth={1}
                                            />
                                        </div>
                                        <span className="text-gray-600 text-sm sm:text-base">
                                            Date :
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-800 text-sm sm:text-base text-right">
                                        {formatDate(formData.date)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100 gap-3">
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="bg-[var(--yellow)] rounded-full p-2">
                                            <Icon
                                                name="clock"
                                                strokeColor="var(--black)"
                                                fillColor="none"
                                                width={16}
                                                height={16}
                                                strokeWidth={1}
                                            />
                                        </div>
                                        <span className="text-gray-600 text-sm sm:text-base">
                                            Horaire :
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-800 text-sm sm:text-base text-right">
                                        {formatTime(formData.time)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100 gap-3">
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="bg-[var(--yellow)] rounded-full p-2">
                                            <Icon
                                                name="user"
                                                strokeColor="var(--black)"
                                                fillColor="none"
                                                width={16}
                                                height={16}
                                                strokeWidth={1}
                                            />
                                        </div>
                                        <span className="text-gray-600 text-sm sm:text-base">
                                            Places disponibles :
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-800 text-sm sm:text-base text-right">
                                        {formData.seats || '[Nombre]'} place
                                        {formData.seats && parseInt(formData.seats) > 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100 gap-3">
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="bg-[var(--yellow)] rounded-full p-2">
                                            <Icon
                                                name="euro"
                                                strokeColor="var(--black)"
                                                fillColor="var(--black)"
                                                width={16}
                                                height={16}
                                                strokeWidth={1}
                                            />
                                        </div>
                                        <span className="text-gray-600 text-sm sm:text-base">
                                            Prix :
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-800 text-sm sm:text-base text-right">
                                        {formData.price ? `${formData.price}€` : '[Prix]'} par place
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2 sm:py-3 border-gray-100 gap-3">
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="bg-[var(--yellow)] rounded-full p-2">
                                            <Icon
                                                name="mapPoint"
                                                strokeColor="none"
                                                fillColor="var(--black)"
                                                width={16}
                                                height={16}
                                                strokeWidth={1}
                                            />
                                        </div>
                                        <span className="text-gray-600 text-sm sm:text-base">
                                            Lieu de départ :
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-800 text-sm sm:text-base text-right">
                                        {formData.departurePlace || '[Lieu]'}
                                    </span>
                                </div>

                                {formData.description && (
                                    <div className="pt-2 sm:pt-3">
                                        <span className="text-gray-600 text-sm sm:text-base block mb-2">
                                            Description :
                                        </span>
                                        <p className="text-gray-800 text-sm sm:text-base italic bg-gray-50 p-3 rounded-lg">
                                            &ldquo;{formData.description}&rdquo;
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <div className="flex items-start gap-3 p-4 rounded-lg">
                            <input
                                type="checkbox"
                                id="acceptTerms"
                                checked={acceptTerms}
                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border-2 border-black checked:bg-pink-600 checked:border-pink-600"
                            />
                            <label
                                htmlFor="acceptTerms"
                                className="text-sm text-gray-700 leading-relaxed text-start"
                            >
                                J&apos;accepte les{' '}
                                <a
                                    href="/conditions-generales-de-vente"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-pink-600 hover:text-pink-700 underline"
                                >
                                    conditions générales de vente
                                </a>{' '}
                                et j&apos;autorise le partage de mes informations de contact
                                (prénom, numéro de téléphone) avec les autres participants du trajet
                                pour faciliter la communication et l&apos;organisation du
                                covoiturage.
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <button
                            onClick={() => router.push('/create-trip?step=2')}
                            className="px-4 sm:px-6 py-2.5 sm:py-3 text-black bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors text-sm sm:text-base"
                        >
                            ← Retour
                        </button>
                        <button
                            onClick={handleCreateTrip}
                            disabled={isCreating || !acceptTerms}
                            className={`order-1 sm:order-2 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-colors ${isCreating || !acceptTerms
                                    ? 'bg-gray-400 cursor-not-allowed opacity-60'
                                    : 'bg-[var(--pink)] opacity-90 hover:opacity-100'
                                }`}
                        >
                            {isCreating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Création...
                                </>
                            ) : (
                                'Publier le trajet'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
