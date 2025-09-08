import { useState } from 'react';

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

type TripFormStepProps = {
    formData: TripFormData;
    updateFormData: (data: Partial<TripFormData>) => void;
    onNext: () => void;
    onBack: () => void;
};

export default function TripFormStep({
    formData,
    updateFormData,
    onNext,
    onBack,
}: TripFormStepProps) {
    const [errors, setErrors] = useState<Partial<TripFormData>>({});

    const validateForm = (): boolean => {
        const newErrors: Partial<TripFormData> = {};

        if (!formData.departure.trim()) {
            newErrors.departure = 'Veuillez indiquer une ville de départ';
        }
        if (!formData.arrival.trim()) {
            newErrors.arrival = 'Veuillez indiquer une ville d&apos;arrivée';
        }
        if (!formData.date) {
            newErrors.date = 'Veuillez indiquer une date de départ';
        }
        if (!formData.time) {
            newErrors.time = 'Veuillez indiquer une heure de départ';
        }
        if (!formData.seats) {
            newErrors.seats = 'Veuillez indiquer le nombre de places disponibles';
        }
        if (!formData.price.trim()) {
            newErrors.price = 'Veuillez indiquer le prix par place';
        }
        if (!formData.departurePlace.trim()) {
            newErrors.departurePlace = 'Veuillez indiquer le lieu de départ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
        <div className="p-4 sm:p-6 mt-6 sm:mt-10">
            <div className="bg-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-montserrat text-[--accent-color] mb-4 sm:mb-6 text-center">
                        Publier ton trajet
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label
                                    htmlFor="departure"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Ville de départ <span className="text-[--accent-color]">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="departure"
                                    value={formData.departure}
                                    onChange={(e) => handleInputChange('departure', e.target.value)}
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent text-sm sm:text-base ${
                                        errors.departure ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Ex: Paris"
                                />
                                {errors.departure && (
                                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                                        {errors.departure}
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label
                                    htmlFor="date"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Date du trajet <span className="text-[--accent-color]">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent text-sm sm:text-base ${
                                        errors.date ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.date && (
                                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                                        {errors.date}
                                    </p>
                                )}
                            </div>

                            <div className="mb-4 sm:mb-6">
                                <label
                                    htmlFor="time"
                                    className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
                                >
                                    Heure de départ <span className="text-[--accent-color]">*</span>
                                </label>
                                <input
                                    type="time"
                                    id="time"
                                    value={formData.time}
                                    onChange={(e) => handleInputChange('time', e.target.value)}
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent text-sm sm:text-base ${
                                        errors.time ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.time && (
                                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                                        {errors.time}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="seats"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Places disponibles{' '}
                                    <span className="text-[--accent-color]">*</span>
                                </label>
                                <select
                                    id="seats"
                                    value={formData.seats}
                                    onChange={(e) => handleInputChange('seats', e.target.value)}
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent text-sm sm:text-base ${
                                        errors.seats ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="1">1 place</option>
                                    <option value="2">2 places</option>
                                    <option value="3">3 places</option>
                                    <option value="4">4 places</option>
                                </select>
                                {errors.seats && (
                                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                                        {errors.seats}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label
                                    htmlFor="price"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Prix par place (€){' '}
                                    <span className="text-[--accent-color]">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    min="0"
                                    step="0.50"
                                    value={formData.price}
                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent text-sm sm:text-base ${
                                        errors.price ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Ex: 25.00"
                                />
                                {errors.price && (
                                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                                        {errors.price}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="departure-place"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Lieu de départ <span className="text-[--accent-color]">*</span>
                                </label>
                                <textarea
                                    id="departure-place"
                                    rows={1}
                                    value={formData.departurePlace}
                                    onChange={(e) =>
                                        handleInputChange('departurePlace', e.target.value)
                                    }
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent text-sm sm:text-base resize-none ${
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
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Description (optionnel)
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent text-sm sm:text-base resize-none"
                                placeholder="Précisions sur le trajet, points de rencontre..."
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onBack}
                                className="order-2 sm:order-1 px-4 sm:px-6 py-2.5 sm:py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                            >
                                ← Retour
                            </button>

                            <button
                                type="submit"
                                className="order-1 sm:order-2 btn px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base"
                            >
                                Continuer →
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
