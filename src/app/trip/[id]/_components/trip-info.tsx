import Icon from '@/app/_components/ui/icon';
import UserInformation from '@/app/_components/user-information';
import { TripWithDriver } from '@/types/trips.types';
import { formatDate } from '@/utils/date';
import { ReactNode } from 'react';

type Participant = {
    id: string;
    firstName: string;
    averageRating?: number;
};

type TripInfoProps = {
    trip: TripWithDriver;
    driverAverageRating?: number;
    participants: Participant[];
    loadingParticipants: boolean;
    actionButton: ReactNode;
};

export const TripInfo = ({
    trip,
    driverAverageRating,
    participants,
    loadingParticipants,
    actionButton,
}: TripInfoProps) => (
    <div className="bg-white rounded-xl shadow-sm border border-black p-6 mb-6">
        {/* Header with route and price */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[var(--pink)] rounded-full flex items-center justify-center">
                    <Icon
                        name="mapPoint"
                        strokeColor="none"
                        fillColor="var(--black) "
                        width={16}
                        height={16}
                        strokeWidth={1}
                    />
                </div>
                <h2 className="text-xl font-medium text-gray-900">
                    {trip.departureCity} → {trip.arrivalCity}
                </h2>
            </div>
            <div className="text-lg font-semibold text-[var(--black)] bg-[var(--light-blue)] px-3 py-1 rounded-xl">
                {trip.pricePerSeat}€
            </div>
        </div>

        {/* Trip details */}
        <div>
            <h3 className="font-semibold text-gray-900 mb-3 font-staatliches">Détails du trajet</h3>
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
                        {trip.availableSeats} place{trip.availableSeats > 1 ? 's' : ''} disponible
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
        </div>

        {/* Driver section */}
        <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Conductrice</h3>
            <UserInformation
                firstName={trip.driver.firstName}
                rating={driverAverageRating ? Math.round(driverAverageRating) : undefined}
                subtitle="Conductrice vérifiée"
                avatarColor="#FBD5E1"
            />
        </div>

        {/* Passengers section */}
        <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">
                Passagères ({participants.length}/{trip.totalSeats})
            </h3>
            {loadingParticipants ? (
                <div className="space-y-3">
                    {[...Array(trip.participants.length || 1)].map((_, i) => (
                        <div key={i} className="animate-pulse flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/3" />
                                <div className="h-3 bg-gray-200 rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : participants.length > 0 ? (
                <div className="space-y-3">
                    {participants.map((participant) => (
                        <UserInformation
                            key={participant.id}
                            firstName={participant.firstName}
                            rating={
                                participant.averageRating
                                    ? Math.round(participant.averageRating)
                                    : undefined
                            }
                            subtitle="Passagère vérifiée"
                            avatarColor="#C5DCF9"
                        />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 italic">Aucune passagère pour le moment</p>
            )}
        </div>

        {actionButton && <div className="mt-6">{actionButton}</div>}

        {trip.description && (
            <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 text-base italic p-4 rounded-lg">
                    &quot;{trip.description}&quot;
                </p>
            </div>
        )}
    </div>
);
