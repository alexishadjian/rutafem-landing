import Icon from '@/app/_components/ui/icon';
import UserInformation from '@/app/_components/user-information';
import { TripWithDriver } from '@/types/trips.types';
import { formatDate } from '@/utils/date';

type TripInfoProps = {
    trip: TripWithDriver;
    canJoinTrip: boolean;
    joining: boolean;
    onJoinTrip: () => void;
    driverAverageRating?: number;
};

export const TripInfo = ({
    trip,
    canJoinTrip,
    joining,
    onJoinTrip,
    driverAverageRating,
}: TripInfoProps) => (
    <div className="bg-white rounded-xl shadow-sm border border-black p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <svg
                        className="w-6 h-6 text-pink-600"
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
                <div>
                    <h2 className="text-xl font-medium text-gray-900">
                        {trip.departureCity} → {trip.arrivalCity}
                    </h2>
                </div>
            </div>
            <div className="text-right">
                <div className="text-lg font-semibold text-[var(--black)] bg-[var(--light-blue)] px-3 py-1 rounded-xl ml-auto w-fit">
                    {trip.pricePerSeat}€
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols gap-6">
            <div>
                <h3 className="font-semibold text-gray-900 mb-3 font-staatliches">
                    Détails du trajet
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <span className="text-gray-700">{formatDate(trip.departureDate)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="text-gray-700">{trip.departureTime}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <span className="text-gray-700">
                            {trip.availableSeats} place
                            {trip.availableSeats > 1 ? 's' : ''} disponible
                            {trip.availableSeats > 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 ml-1">
                        <Icon
                            name="city"
                            strokeColor="var(--black)"
                            fillColor="none"
                            width={16}
                            height={16}
                            strokeWidth={2}
                        />
                        <span className="text-gray-700">{trip.departureAddress}</span>
                    </div>
                </div>
                <div className="mt-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">Conductrice</h3>
                    <UserInformation
                        firstName={trip.driver.firstName}
                        rating={driverAverageRating ? Math.round(driverAverageRating) : undefined}
                        subtitle="Conductrice vérifiée"
                        avatarColor="#FBD5E1"
                    />
                    {canJoinTrip && (
                        <button
                            onClick={onJoinTrip}
                            disabled={joining}
                            className="mt-5 w-full bg-[var(--yellow)] hover:bg-[var(--yellow)]/90 text-[var(--black)] py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {joining ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--black)]" />
                                    Rejoindre...
                                </>
                            ) : (
                                <>Rejoindre ce trajet</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>

        {trip.description && (
            <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 italic bg-gray-50 p-4 rounded-lg">
                    &quot;{trip.description}&quot;
                </p>
            </div>
        )}
    </div>
);
