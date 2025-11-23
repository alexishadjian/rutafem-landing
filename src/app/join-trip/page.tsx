'use client';

import { SmartButton } from '@/app/_components/ui/smart-button';
import { getActiveTrips } from '@/lib/firebase/trips';
import { Trip } from '@/types/trips.types';
import { useEffect, useState } from 'react';
import Button from '../_components/ui/button';
import SearchBar from './_components/search-bar';
import TripCard from './_components/trip-card';

const INITIAL_DISPLAY_COUNT = 6;
const LOAD_MORE_COUNT = 6;

// TODO : filtrer, afficher seulement la ville

export default function JoinTripPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [displayedCount, setDisplayedCount] = useState(INITIAL_DISPLAY_COUNT);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const tripsData = await getActiveTrips();
                setTrips(tripsData);
            } catch (error) {
                console.error('Erreur lors du chargement des trajets:', error);
                setError('Erreur lors du chargement des trajets');
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, []);

    const handleLoadMore = () => {
        setDisplayedCount((prev) => prev + LOAD_MORE_COUNT);
    };

    const displayedTrips = trips.slice(0, displayedCount);
    const hasMoreTrips = displayedCount < trips.length;

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
                    <SearchBar />
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center sm:text-left">
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-staatliches">
                            Les trajets de la communauté
                        </h3>
                        <p className="text-gray-600 mt-2">
                            Retrouve ici tous les trajets publiés par nos conductrices. Chaque
                            profil est vérifié pour t’assurer des voyages fiables et bienveillants.
                        </p>
                    </div>
                </div>
                <div className="px-4 sm:px-6 lg:px-8 pb-12">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
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
                    ) : trips.length === 0 ? (
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
                                Aucun trajet disponible
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Il n&apos;y a actuellement aucun trajet disponible. Soyez la
                                première à en créer un !
                            </p>
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
