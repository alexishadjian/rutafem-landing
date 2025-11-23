import { useEffect, useState } from 'react';
import Datepicker, { DateValueType } from 'react-tailwindcss-datepicker';

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
    const [startDate, setStartDate] = useState<DateValueType>({
        startDate: null,
        endDate: null,
    });

    // Sync formData.date with startDate on mount
    useEffect(() => {
        if (formData.date) {
            try {
                const dateObj = new Date(formData.date);
                if (!isNaN(dateObj.getTime())) {
                    setStartDate({
                        startDate: dateObj,
                        endDate: null,
                    });
                }
            } catch {
                // Invalid date, keep null
            }
        } else {
            setStartDate({
                startDate: null,
                endDate: null,
            });
        }
    }, [formData.date]);

    const handleDateChange = (newValue: DateValueType) => {
        setStartDate(newValue);
        if (newValue?.startDate) {
            const dateValue =
                typeof newValue.startDate === 'string'
                    ? newValue.startDate
                    : newValue.startDate instanceof Date
                    ? newValue.startDate.toISOString().split('T')[0]
                    : '';
            updateFormData({ date: dateValue });
        } else {
            updateFormData({ date: '' });
        }
        if (errors.date) {
            setErrors((prev) => ({ ...prev, date: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<TripFormData> = {};

        if (!formData.date || !formData.date.trim()) {
            newErrors.date = 'Veuillez indiquer la date de départ';
        }
        if (!formData.time) {
            newErrors.time = 'Veuillez indiquer l&apos;heure de départ';
        }
        if (!formData.seats) {
            newErrors.seats = 'Veuillez indiquer le nombre de places disponibles';
        }
        if (!formData.price.trim()) {
            newErrors.price = 'Veuillez indiquer le prix par place';
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
        <div className="p-4 sm:p-6 mt-6 sm:mt-10 md:wrapper wrapper">
            <div className="bg-[var(--white)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl sm:text-2xl md:text-5xl font-bold font-montserrat text-[var(--black)] font-staatliches mb-4 sm:mb-6 text-center">
                        Informations du trajet
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label
                                    htmlFor="date"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Quand souhaite-tu partir ?{' '}
                                    <span className="text-[--accent-color]">*</span>
                                </label>
                                <Datepicker
                                    i18n="fr"
                                    startWeekOn="mon"
                                    primaryColor={'pink'}
                                    displayFormat="DD/MM/YYYY"
                                    useRange={false}
                                    asSingle
                                    value={startDate}
                                    onChange={handleDateChange}
                                    minDate={new Date()}
                                    inputClassName={
                                        'border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent text-sm w-full px-3 py-2.5'
                                    }
                                />
                                {errors.date && (
                                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                                        {errors.date}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="time"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    À quelle heure ?{' '}
                                    <span className="text-[--accent-color]">*</span>
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
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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

                        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8 pt-4">
                            <button
                                type="button"
                                onClick={onBack}
                                className="order-2 sm:order-1 px-4 sm:px-6 py-2.5 sm:py-3 text-black bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors text-sm sm:text-base"
                            >
                                ← Retour
                            </button>

                            <button
                                type="submit"
                                className="order-1 sm:order-2 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base bg-[var(--pink)] opacity-90 hover:opacity-100 rounded-lg"
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
