import Button from '@/app/_components/ui/button';
import { useState } from 'react';
import Datepicker, { DateValueType } from 'react-tailwindcss-datepicker';

export default function SearchBar() {
    const [startDate, setStartDate] = useState<DateValueType>({
        startDate: null,
        endDate: null,
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <div className="space-y-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher un trajet (ville de départ, ville d'arrivée...)"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent text-sm sm:text-base"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label
                            htmlFor="price-filter"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Prix maximum
                        </label>
                        <select
                            id="price-filter"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent text-sm"
                        >
                            <option value="">Tous les prix</option>
                            <option value="15">- 15€</option>
                            <option value="25">16€ - 35€</option>
                            <option value="35">36€ - 50€</option>
                            <option value="50">+ 50€</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="date-filter"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Date de départ
                        </label>
                        <Datepicker
                            i18n="fr"
                            startWeekOn="mon"
                            primaryColor={'pink'}
                            displayFormat="DD/MM/YYYY"
                            useRange={false}
                            asSingle
                            value={startDate}
                            onChange={(newValue: DateValueType) => setStartDate(newValue)}
                            inputClassName={
                                'border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent text-sm w-full px-3 py-2.5'
                            }
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="seats-filter"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Places disponibles
                        </label>
                        <select
                            id="seats-filter"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent text-sm"
                        >
                            <option value="">Toutes les places</option>
                            <option value="1">1 place</option>
                            <option value="2">2+ places</option>
                            <option value="3">3+ places</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="flexible-dates"
                                className="w-full px-3 py-2.5 border border-black rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent text-sm"
                            />
                            <p className="text-sm">Mes dates sont flexibles</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="flexible-dates"
                                className="w-full px-3 py-2.5 border border-black rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent text-sm"
                            />
                            <p className="text-sm md:whitespace-nowrap">
                                Suggérer des trajets à proximité de mon point de départ
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Button text="Rechercher" color="pink" fill={true} className="text-white" />
                </div>
            </div>
        </div>
    );
}
