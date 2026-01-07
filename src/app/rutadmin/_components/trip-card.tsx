import { Trip } from '@/types/trips.types';
import { formatDate } from '@/utils/date';
import Link from 'next/link';

type AdminTripCardProps = { trip: Trip };

export const AdminTripCard = ({ trip }: AdminTripCardProps) => (
    <Link
        href={`/rutadmin/trips/${trip.id}`}
        className="bg-[var(--white)] rounded-xl p-4 block hover:bg-[var(--white)]/80 transition-colors"
    >
        <div className="flex items-center justify-between mb-2">
            <p className="text-[var(--dark-green)] font-medium">
                {trip.departureCity} → {trip.arrivalCity}
            </p>
            <span
                className={`px-2 py-1 rounded text-xs ${
                    trip.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}
            >
                {trip.isActive ? 'Actif' : 'Annulé'}
            </span>
        </div>
        <div className="flex items-center gap-4 text-[var(--white)]/60 text-sm">
            <span>📅 {formatDate(new Date(trip.departureDate))}</span>
            <span>⏰ {trip.departureTime}</span>
            <span>
                💺 {trip.availableSeats}/{trip.totalSeats}
            </span>
            <span>💰 {trip.pricePerSeat}€</span>
        </div>
    </Link>
);
