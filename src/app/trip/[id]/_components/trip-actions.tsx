import { ConfirmationModal } from '@/app/_components/confirmation-modal';
import { TripWithDriver } from '@/types/trips.types';
import Link from 'next/link';
import { useState } from 'react';

type TripActionsProps = {
    trip: TripWithDriver;
    isUserDriver: boolean;
    isUserParticipant: boolean;
    canJoinTrip: boolean;
    joining: boolean;
    onJoinTrip: () => void;
    leaving: boolean;
    onLeaveTrip: () => void;
    cancelling: boolean;
    onCancelTrip: () => void;
};

// Check if trip date/time has passed
const isTripPassed = (trip: TripWithDriver): boolean => {
    const [hours, minutes] = trip.departureTime.split(':').map(Number);
    const tripDateTime = new Date(trip.departureDate);
    tripDateTime.setHours(hours, minutes, 0, 0);
    return tripDateTime < new Date();
};

export const TripActions = ({
    trip,
    isUserDriver,
    isUserParticipant,
    canJoinTrip,
    joining,
    onJoinTrip,
    leaving,
    onLeaveTrip,
    cancelling,
    onCancelTrip,
}: TripActionsProps) => {
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const isCompleted = trip.status === 'completed';
    const isPending = trip.status === 'pending';
    const isOngoing = trip.status === 'ongoing';
    const tripPassed = isTripPassed(trip);

    // Determine which button to show
    const showReviewButton = isUserParticipant && isCompleted;
    const showLeaveButton = isUserParticipant && isPending && !isCompleted && !tripPassed;
    const showCancelButton = isUserDriver && !isOngoing && !tripPassed && trip.isActive;
    const showJoinButton = canJoinTrip && !tripPassed;

    // No button to show
    if (!showReviewButton && !showLeaveButton && !showCancelButton && !showJoinButton) {
        return null;
    }

    const buttonClass =
        'w-full bg-[var(--yellow)] hover:bg-[var(--yellow)]/90 text-[var(--black)] py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

    // Review button (completed trip)
    if (showReviewButton) {
        return (
            <Link href={`/trip/${trip.id}/review`} className={buttonClass}>
                Je donne mon avis
            </Link>
        );
    }

    // Leave button (participant, pending)
    if (showLeaveButton) {
        return (
            <>
                <button
                    onClick={() => setShowLeaveModal(true)}
                    disabled={leaving}
                    className={buttonClass}
                >
                    {leaving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--black)]" />
                            Annulation...
                        </>
                    ) : (
                        'Annuler ma participation'
                    )}
                </button>

                <ConfirmationModal
                    isOpen={showLeaveModal}
                    onClose={() => setShowLeaveModal(false)}
                    onConfirm={() => {
                        setShowLeaveModal(false);
                        onLeaveTrip();
                    }}
                    title="Annuler ma participation"
                    message="Es-tu sûre de vouloir annuler ta participation à ce trajet ?"
                    confirmText="Oui, annuler"
                    cancelText="Non, garder"
                    type="danger"
                    loading={leaving}
                />
            </>
        );
    }

    // Cancel button (driver, not ongoing, not passed)
    if (showCancelButton) {
        return (
            <>
                <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={cancelling}
                    className={buttonClass}
                >
                    {cancelling ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--black)]" />
                            Annulation...
                        </>
                    ) : (
                        'Annuler le trajet'
                    )}
                </button>

                <ConfirmationModal
                    isOpen={showCancelModal}
                    onClose={() => setShowCancelModal(false)}
                    onConfirm={() => {
                        setShowCancelModal(false);
                        onCancelTrip();
                    }}
                    title="Annuler le trajet"
                    message="Es-tu sûre de vouloir annuler ce trajet ? Toutes les participantes seront notifiées."
                    confirmText="Oui, annuler"
                    cancelText="Non, garder"
                    type="danger"
                    loading={cancelling}
                />
            </>
        );
    }

    // Join button (can join)
    if (showJoinButton) {
        return (
            <button onClick={onJoinTrip} disabled={joining} className={buttonClass}>
                {joining ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--black)]" />
                        Rejoindre...
                    </>
                ) : (
                    'Rejoindre ce trajet'
                )}
            </button>
        );
    }

    return null;
};
