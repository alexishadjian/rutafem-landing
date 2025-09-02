type TripFormData = {
    departure: string;
    arrival: string;
    date: string;
    seats: string;
    price: string;
    departurePlace: string;
    description: string;
};

type ConfirmationStepProps = {
    formData: TripFormData;
    onBack: () => void;
};

export default function ConfirmationStep({ formData, onBack }: ConfirmationStepProps) {
    const formatDate = (dateString: string) => {
        if (!dateString) return '[Date non spécifiée]';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
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

                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-montserrat text-[--accent-color] mb-3 sm:mb-4">
                            Trajet créé avec succès ! 🎉
                        </h2>

                        <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 px-2">
                            Ton trajet de covoiturage a été publié. D&apos;autres utilisatrices
                            pourront maintenant le voir et demander à y participer.
                        </p>

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
                                        {formData.departure || '[Ville de départ]'} →{' '}
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

                        <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 px-2">
                            Tu recevras une notification dès qu&apos;une utilisatrice
                            s&apos;intéressera à ton trajet.
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={onBack}
                            className="btn px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base"
                        >
                            ← Retour au formulaire
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
