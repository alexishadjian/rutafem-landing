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
        <div className="p-6 mt-10">
            <div className="bg-gray-100 rounded-3xl p-6 md:p-8">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-10 h-10 text-green-600"
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

                        <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-[--accent-color] mb-4">
                            Trajet créé avec succès ! 🎉
                        </h2>

                        <p className="text-lg text-gray-700 mb-6">
                            Ton trajet de covoiturage a été publié. D&apos;autres utilisatrices
                            pourront maintenant le voir et demander à y participer.
                        </p>

                        <div className="bg-white rounded-lg p-6 mb-6 text-left">
                            <h3 className="font-semibold text-gray-800 mb-4 text-center">
                                Récapitulatif :
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Trajet :</span>
                                    <span className="font-medium text-gray-800">
                                        {formData.departure || '[Ville de départ]'} →{' '}
                                        {formData.arrival || "[Ville d'arrivée]"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Date :</span>
                                    <span className="font-medium text-gray-800">
                                        {formatDate(formData.date)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Places disponibles :</span>
                                    <span className="font-medium text-gray-800">
                                        {formData.seats || '[Nombre]'} place
                                        {formData.seats && parseInt(formData.seats) > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Prix :</span>
                                    <span className="font-medium text-gray-800">
                                        {formData.price ? `${formData.price}€` : '[Prix]'} par place
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Lieu de départ :</span>
                                    <span className="font-medium text-gray-800">
                                        {formData.departurePlace || '[Lieu]'}
                                    </span>
                                </div>
                                {formData.description && (
                                    <div className="pt-2">
                                        <span className="text-gray-600">Description :</span>
                                        <p className="text-gray-800 mt-1 italic">
                                            &ldquo;{formData.description}&rdquo;
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-6">
                            Tu recevras une notification dès qu&apos;une utilisatrice
                            s&apos;intéressera à ton trajet.
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <button onClick={onBack} className="btn px-8 py-3">
                            ← Retour au formulaire
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
