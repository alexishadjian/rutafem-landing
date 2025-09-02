import { useState } from 'react';

type TripFormData = {
    departure: string;
    arrival: string;
    date: string;
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
            newErrors.departure = 'La ville de départ est requise';
        }
        if (!formData.arrival.trim()) {
            newErrors.arrival = "La ville d'arrivée est requise";
        }
        if (!formData.date) {
            newErrors.date = 'La date est requise';
        }
        if (!formData.seats) {
            newErrors.seats = 'Le nombre de places est requis';
        }
        if (!formData.price.trim()) {
            newErrors.price = 'Le prix est requis';
        }
        if (!formData.departurePlace.trim()) {
            newErrors.departurePlace = 'Le lieu de départ est requis';
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
        <div className="p-6 mt-10">
            <div className="bg-gray-100 rounded-3xl p-6 md:p-8">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-[--accent-color] mb-6 text-center">
                        Créer ton trajet
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent ${
                                        errors.departure ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Ex: Paris"
                                />
                                {errors.departure && (
                                    <p className="text-red-500 text-sm mt-1">{errors.departure}</p>
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
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent ${
                                        errors.arrival ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Ex: Lyon"
                                />
                                {errors.arrival && (
                                    <p className="text-red-500 text-sm mt-1">{errors.arrival}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent ${
                                        errors.date ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.date && (
                                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
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
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent ${
                                        errors.seats ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="1">1 place</option>
                                    <option value="2">2 places</option>
                                    <option value="3">3 places</option>
                                    <option value="4">4 places</option>
                                </select>
                                {errors.seats && (
                                    <p className="text-red-500 text-sm mt-1">{errors.seats}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="price"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Prix par place (€) <span className="text-[--accent-color]">*</span>
                            </label>
                            <input
                                type="number"
                                id="price"
                                min="0"
                                step="0.50"
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent ${
                                    errors.price ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Ex: 25.00"
                            />
                            {errors.price && (
                                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
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
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent ${
                                    errors.departurePlace ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Ex: Gare de Lyon, 75000 Paris"
                            />
                            {errors.departurePlace && (
                                <p className="text-red-500 text-sm mt-1">{errors.departurePlace}</p>
                            )}
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent"
                                placeholder="Précisions sur le trajet, points de rencontre..."
                            />
                        </div>

                        <div className="flex justify-between mt-8">
                            <button
                                type="button"
                                onClick={onBack}
                                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                ← Retour
                            </button>

                            <button type="submit" className="btn px-8 py-3">
                                Continuer -&gt;
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
