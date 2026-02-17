'use client';

import { SmartButton } from '@/app/_components/ui/smart-button';
import { filterPastTrips, filterTrips, getActiveTrips, sortTrips } from '@/lib/firebase/trips';
import { Trip, TripFilters, TripSortOption } from '@/types/trips.types';
import { useEffect, useState } from 'react';
import Button from '../_components/ui/button';
import SearchBar from './_components/search-bar';
import TripCard from './_components/trip-card';

const INITIAL_DISPLAY_COUNT = 6;
const LOAD_MORE_COUNT = 6;

const SORT_OPTIONS: { value: TripSortOption; label: string }[] = [
    { value: 'default', label: 'Par défaut' },
    { value: 'price_asc', label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix décroissant' },
    { value: 'time_asc', label: 'Départ le plus tôt' },
    { value: 'time_desc', label: 'Départ le plus tard' },
];

export default function JoinTripPage() {
    const [allTrips, setAllTrips] = useState<Trip[]>([]);
    const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [displayedCount, setDisplayedCount] = useState(INITIAL_DISPLAY_COUNT);
    const [sortOption, setSortOption] = useState<TripSortOption>('default');
    const [currentFilters, setCurrentFilters] = useState<TripFilters | null>(null);
    const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const tripsData = await getActiveTrips();
                // Filter out past trips
                const futureTrips = filterPastTrips(tripsData);
                setAllTrips(futureTrips);
                setFilteredTrips(futureTrips);
            } catch (err) {
                console.error('Erreur lors du chargement des trajets:', err);
                setError('Erreur lors du chargement des trajets');
            } finally {
                setLoading(false);
            }
        };
        fetchTrips();
    }, []);

    const applyFiltersAndSort = (
        trips: Trip[],
        filters: TripFilters | null,
        sort: TripSortOption,
        maxPrice: number | null,
    ) => {
        let result = trips;
        if (filters || maxPrice !== null) {
            const filtersWithPrice: TripFilters = filters
                ? { ...filters, maxPrice }
                : {
                    departureCity: '',
                    arrivalCity: '',
                    maxPrice,
                    date: null,
                    minSeats: null,
                };
            result = filterTrips(result, filtersWithPrice);
        }
        result = sortTrips(result, sort);
        return result;
    };

    const handleSearch = (filters: TripFilters) => {
        const isReset =
            !filters.departureCity && !filters.arrivalCity && !filters.date && !filters.minSeats;
        if (isReset) {
            setCurrentFilters(null);
            setMaxPriceFilter(null);
            setFilteredTrips(allTrips);
        } else {
            setCurrentFilters(filters);
            const results = applyFiltersAndSort(allTrips, filters, sortOption, maxPriceFilter);
            setFilteredTrips(results);
        }
        setDisplayedCount(INITIAL_DISPLAY_COUNT);
    };

    const handleSortChange = (newSort: TripSortOption) => {
        setSortOption(newSort);
        const results = applyFiltersAndSort(allTrips, currentFilters, newSort, maxPriceFilter);
        setFilteredTrips(results);
    };

    const handlePriceFilterChange = (value: string) => {
        const newMaxPrice = value ? Number(value) : null;
        setMaxPriceFilter(newMaxPrice);
        const results = applyFiltersAndSort(allTrips, currentFilters, sortOption, newMaxPrice);
        setFilteredTrips(results);
        setDisplayedCount(INITIAL_DISPLAY_COUNT);
    };

    const handleLoadMore = () => setDisplayedCount((prev) => prev + LOAD_MORE_COUNT);

    const displayedTrips = filteredTrips.slice(0, displayedCount);
    const hasMoreTrips = displayedCount < filteredTrips.length;

    return (
        <div className="min-h-screen bg-[var(--dark-green)] py-6 lg:p-12">
            <div className="md:wrapper wrapper bg-[var(--white)] rounded-xl">
                <div className="px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-staatliches">
                                Trouver un trajet
                            </h3>
                            <p className="text-gray-600 mt-2">
                                Rejoins des trajets de covoiturage entre femmes
                            </p>
                        </div>
                        <SmartButton
                            href="/create-trip"
                            requireAuth={true}
                            requireVerified={true}
                            requireDriver={true}
                            requireDriverVerified={true}
                            className="bg-[var(--orange)] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-3"
                        >
                            <span className="text-2xl">+</span>
                            <span>Publier un trajet</span>
                        </SmartButton>
                    </div>
                </div>

                <div className="px-4 sm:px-6 lg:px-8 py-6">
                    <SearchBar onSearch={handleSearch} />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center sm:text-left">
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-staatliches">
                            {filteredTrips.length === allTrips.length
                                ? 'Les trajets de la communauté'
                                : `${filteredTrips.length} trajet${filteredTrips.length > 1 ? 's' : ''
                                } trouvé${filteredTrips.length > 1 ? 's' : ''}`}
                        </h3>
                        <p className="text-gray-600 mt-2">
                            {filteredTrips.length === allTrips.length
                                ? 'Retrouve ici tous les trajets publiés par nos conductrices.'
                                : 'Résultats correspondant à ta recherche.'}
                        </p>
                    </div>

                    {/* Sort and Price filters */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label
                                htmlFor="price-filter"
                                className="text-sm text-gray-600 whitespace-nowrap"
                            >
                                Prix maximum :
                            </label>
                            <select
                                id="price-filter"
                                value={maxPriceFilter ?? ''}
                                onChange={(e) => handlePriceFilterChange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent text-sm"
                            >
                                <option value="">Tous les prix</option>
                                <option value="15">Jusqu&apos;à 15€</option>
                                <option value="25">Jusqu&apos;à 25€</option>
                                <option value="35">Jusqu&apos;à 35€</option>
                                <option value="50">Jusqu&apos;à 50€</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label
                                htmlFor="sort"
                                className="text-sm text-gray-600 whitespace-nowrap"
                            >
                                Trier par :
                            </label>
                            <select
                                id="sort"
                                value={sortOption}
                                onChange={(e) => handleSortChange(e.target.value as TripSortOption)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent text-sm"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-6 lg:px-8 pb-12">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4" />
                                <p className="text-gray-600">Chargement des trajets...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button onClick={() => window.location.reload()} className="btn">
                                Réessayer
                            </button>
                        </div>
                    ) : filteredTrips.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {allTrips.length === 0
                                    ? 'Pas encore de trajets disponibles pour cette date'
                                    : 'Aucun trajet trouvé'}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {allTrips.length === 0
                                    ? "Sois la première à publier un trajet !"
                                    : 'Aucun trajet ne correspond à tes critères. Essaie de modifier tes filtres.'}
                            </p>
                            {allTrips.length === 0 && (
                                <SmartButton
                                    href="/create-trip"
                                    requireAuth={true}
                                    requireVerified={true}
                                    requireDriver={true}
                                    requireDriverVerified={true}
                                    className="btn"
                                >
                                    Publier un trajet
                                </SmartButton>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedTrips.map((trip) => (
                                    <TripCard key={trip.id} trip={trip} />
                                ))}
                            </div>
                            {hasMoreTrips && (
                                <div className="flex justify-center mt-8">
                                    <Button
                                        text="Voir plus de trajets"
                                        color="pink"
                                        fill={true}
                                        className="text-white"
                                        onClick={handleLoadMore}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
