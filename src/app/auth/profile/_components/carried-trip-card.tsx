import Icon from '@/app/_components/ui/icon';
import { Trip } from '@/types/trips.types';
import { formatShortDate, formatTime } from '@/utils/date';
import Link from 'next/link';

type TripCardProps = {
    trip: Trip;
    reviewCount?: number;
};

export const TripCard = ({ trip, reviewCount }: TripCardProps) => {
    return (
        <Link
            href={`/trip/${trip.id}`}
            className="block bg-white rounded-2xl md:rounded-3xl border-2 border-[var(--dark-green)] p-3 md:p-4 hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between gap-2 md:gap-4">
                <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
                    <div className="flex items-start gap-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-[var(--pink)] rounded-full flex items-center justify-center flex-shrink-0">
                            <Icon
                                name="mapPoint"
                                width={16}
                                height={16}
                                fillColor="var(--black)"
                                strokeColor="none"
                            />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="font-semibold text-sm md:text-base text-[var(--black)] break-words">
                                {trip.departureCity} → {trip.arrivalCity}
                            </h4>
                            <p className="text-xs md:text-sm text-gray-600 line-clamp-1 break-words">
                                {trip.departureAddress}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 md:gap-x-6 text-xs md:text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Icon
                                name="calendar"
                                width={14}
                                height={14}
                                fillColor="none"
                                strokeColor="currentColor"
                            />
                            <span className="whitespace-nowrap">
                                {formatShortDate(trip.departureDate)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Icon
                                name="clock"
                                width={14}
                                height={14}
                                fillColor="var(--black)"
                                strokeColor="none"
                            />
                            <span className="whitespace-nowrap">
                                {formatTime(trip.departureTime)}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 text-xs md:text-sm text-gray-600">
                        <span className="whitespace-nowrap">
                            {trip.participants.length} participant
                            {trip.participants.length > 1 ? 's' : ''}
                        </span>
                        {reviewCount !== undefined && reviewCount > 0 && (
                            <span className="flex items-center gap-1 whitespace-nowrap">
                                <Icon
                                    name="star"
                                    width={16}
                                    height={16}
                                    fillColor="gray"
                                    strokeColor="none"
                                />
                                {reviewCount} avis
                            </span>
                        )}
                    </div>
                </div>
                <div className="bg-[var(--light-blue)] text-[var(--black)] rounded-2xl md:rounded-3xl px-2 py-1 md:px-3 md:py-2 flex-shrink-0">
                    <div className="text-sm md:text-base font-medium whitespace-nowrap">
                        {trip.pricePerSeat}€
                    </div>
                </div>
            </div>
        </Link>
    );
};
