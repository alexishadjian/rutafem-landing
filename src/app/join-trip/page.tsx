'use client';

import { SmartButton } from '@/app/_components/smart-button';
import SearchBar from './_components/search-bar';
import TripCard from './_components/trip-card';
import { mockTrips } from './_data/mock-trips';

export default function JoinTripPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
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
                        className="btn bg-[--accent-color] hover:bg-[--accent-color]/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        + Publier un trajet
                    </SmartButton>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <SearchBar />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockTrips.map((trip) => (
                        <TripCard key={trip.id} trip={trip} />
                    ))}
                </div>
            </div>
        </div>
    );
}
