'use client';

import { AddressAutocomplete } from '@/app/_components/ui/address-autocomplete';
import Button from '@/app/_components/ui/button';
import { TripFilters } from '@/types/trips.types';
import { useState } from 'react';
import Datepicker, { DateValueType } from 'react-tailwindcss-datepicker';

type SearchBarProps = {
    onSearch: (filters: TripFilters) => void;
};

const INITIAL_FILTERS: TripFilters = {
    departureCity: '',
    arrivalCity: '',
    maxPrice: null,
    date: null,
    minSeats: null,
};

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [filters, setFilters] = useState<TripFilters>(INITIAL_FILTERS);
    const [dateValue, setDateValue] = useState<DateValueType>({ startDate: null, endDate: null });

    const updateFilter = <K extends keyof TripFilters>(key: K, value: TripFilters[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleDateChange = (newValue: DateValueType) => {
        setDateValue(newValue);
        if (!newValue?.startDate) {
            updateFilter('date', null);
            return;
        }
        // Handle both string and Date formats
        if (typeof newValue.startDate === 'string') {
            updateFilter('date', newValue.startDate);
        } else {
            // Format as YYYY-MM-DD using local timezone (avoids UTC offset issues)
            const d = newValue.startDate;
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                2,
                '0',
            )}-${String(d.getDate()).padStart(2, '0')}`;
            updateFilter('date', dateStr);
        }
    };

    const handleSeatsChange = (value: string) => {
        updateFilter('minSeats', value ? Number(value) : null);
    };

    const handleSearch = () => onSearch(filters);

    const handleReset = () => {
        setFilters(INITIAL_FILTERS);
        setDateValue({ startDate: null, endDate: null });
        onSearch(INITIAL_FILTERS);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <div className="space-y-4">
                {/* City inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ville de départ
                        </label>
                        <AddressAutocomplete
                            id="departure-city"
                            value={filters.departureCity}
                            onChange={(city) => updateFilter('departureCity', city)}
                            onSelect={(s) => updateFilter('departureCity', s.city)}
                            placeholder="Ex: Paris, Lyon..."
                            mode="city"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ville d&apos;arrivée
                        </label>
                        <AddressAutocomplete
                            id="arrival-city"
                            value={filters.arrivalCity}
                            onChange={(city) => updateFilter('arrivalCity', city)}
                            onSelect={(s) => updateFilter('arrivalCity', s.city)}
                            placeholder="Ex: Marseille, Bordeaux..."
                            mode="city"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date de départ
                        </label>
                        <Datepicker
                            i18n="fr"
                            startWeekOn="mon"
                            primaryColor="pink"
                            displayFormat="DD/MM/YYYY"
                            useRange={false}
                            asSingle
                            value={dateValue}
                            onChange={handleDateChange}
                            minDate={new Date()}
                            inputClassName="border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent text-sm w-full px-3 py-2.5"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="seats-filter"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Places minimum
                        </label>
                        <select
                            id="seats-filter"
                            value={filters.minSeats ?? ''}
                            onChange={(e) => handleSeatsChange(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent text-sm"
                        >
                            <option value="">Toutes les places</option>
                            <option value="1">1+ place</option>
                            <option value="2">2+ places</option>
                            <option value="3">3+ places</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-2 sm:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                id="flexible-dates"
                                disabled
                                className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-[var(--pink)] accent-[var(--pink)]"
                            />
                            <span className="text-sm text-gray-500">
                                Mes dates sont flexibles (bientôt disponible)
                            </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                id="nearby-trips"
                                disabled
                                className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-[var(--pink)] accent-[var(--pink)]"
                            />
                            <span className="text-sm text-gray-500 md:whitespace-nowrap">
                                Suggérer des trajets à proximité (bientôt disponible)
                            </span>
                        </label>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button
                        text="Rechercher"
                        color="pink"
                        fill={true}
                        className="text-white"
                        onClick={handleSearch}
                    />
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                        Réinitialiser
                    </button>
                </div>
            </div>
        </div>
    );
}
