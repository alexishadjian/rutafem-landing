import { useAuth } from '@/contexts/AuthContext';
import { createTrip } from '@/lib/firebase/trips';
import { CreateTripData } from '@/types/trips.types';
import { formatDate } from '@/utils/date';
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
};

type ConfirmationStepProps = {
    formData: TripFormData;
    onBack: () => void;
};

export default function ConfirmationStep({ formData }: ConfirmationStepProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const [isCreated, setIsCreated] = useState(false);
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
                departureCity: formData.departurePlace,
                arrivalCity: formData.arrival,
                totalSeats: formData.seats,
                pricePerSeat: formData.price,
                departureAddress: formData.departurePlace,
                description: formData.description,
            }) as CreateTripData;

            await createTrip(user.uid, parsed);
            setIsCreated(true);
        } catch (error) {
            console.error('Erreur lors de la création du trajet:', error);
            setError(
                error instanceof Error ? error.message : 'Erreur lors de la création du trajet',
            );
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 mt-6 sm:mt-10">
            <div className="bg-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="mb-6 sm:mb-8">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <svg
                                className="w-8 h-8 sm:w-10 sm:h-10 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>

                        {isCreated ? (
                            <>
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-montserrat text-[--accent-color] mb-3 sm:mb-4">
                                    Trajet créé avec succès ! 🎉
                                </h2>

                                <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 px-2">
                                    Ton trajet de covoiturage a été publié. D&apos;autres
                                    utilisatrices pourront maintenant le voir et demander à y
                                    participer.
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-montserrat text-[--accent-color] mb-3 sm:mb-4">
                                    Confirmer la création du trajet
                                </h2>

                                <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 px-2">
                                    Vérifie les informations ci-dessous et clique sur &quot;Publier
                                    le trajet&quot; pour le publier.
                                </p>
                            </>
                        )}

                        <div className="bg-white rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 text-left">
                            <h3 className="font-semibold text-gray-800 mb-4 sm:mb-6 text-center text-lg sm:text-xl">
                                Récapitulatif :
                            </h3>

                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-gray-100">
                                    <span className="text-gray-600 text-sm sm:text-base mb-1 sm:mb-0">
                                        Trajet :
                                    </span>
                                    <span className="font-medium text-gray-800 text-sm sm:text-base">
                                        {formData.departurePlace || '[Lieu de départ]'} →{' '}
                                        {formData.arrival || "[Ville d'arrivée]"}
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-gray-100">
                                    <span className="text-gray-600 text-sm sm:text-base mb-1 sm:mb-0">
                                        Date :
                                    </span>
                                    <span className="font-medium text-gray-800 text-sm sm:text-base">
                                        {formatDate(formData.date)}
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-gray-100">
                                    <span className="text-gray-600 text-sm sm:text-base mb-1 sm:mb-0">
                                        Places disponibles :
                                    </span>
                                    <span className="font-medium text-gray-800 text-sm sm:text-base">
                                        {formData.seats || '[Nombre]'} place
                                        {formData.seats && parseInt(formData.seats) > 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-gray-100">
                                    <span className="text-gray-600 text-sm sm:text-base mb-1 sm:mb-0">
                                        Prix :
                                    </span>
                                    <span className="font-medium text-gray-800 text-sm sm:text-base">
                                        {formData.price ? `${formData.price}€` : '[Prix]'} par place
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-gray-100">
                                    <span className="text-gray-600 text-sm sm:text-base mb-1 sm:mb-0">
                                        Lieu de départ :
                                    </span>
                                    <span className="font-medium text-gray-800 text-sm sm:text-base">
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

                        {isCreated && (
                            <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 px-2">
                                Tu recevras une notification dès qu&apos;une utilisatrice
                                s&apos;intéressera à ton trajet.
                            </p>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}
                    </div>

                    {!isCreated && (
                        <div className="mb-6">
                            <div className="flex items-start gap-3 p-4 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="acceptTerms"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-900 rounded"
                                />
                                <label
                                    htmlFor="acceptTerms"
                                    className="text-sm text-gray-700 leading-relaxed"
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
                                    (prénom, numéro de téléphone) avec les autres participants du
                                    trajet pour faciliter la communication et l&apos;organisation du
                                    covoiturage.
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {isCreated ? (
                            <button
                                onClick={() => router.push('/join-trip')}
                                className="btn px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base"
                            >
                                ← Retour aux trajets
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => router.push('/create-trip?step=2')}
                                    className="btn-secondary px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base"
                                >
                                    ← Retour
                                </button>
                                <button
                                    onClick={handleCreateTrip}
                                    disabled={isCreating || !acceptTerms}
                                    className="btn px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
