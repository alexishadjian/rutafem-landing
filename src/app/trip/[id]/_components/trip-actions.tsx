import { TripWithDriver } from '@/types/trips.types';

type TripActionsProps = {
    trip: TripWithDriver;
    isUserDriver: boolean;
    isUserParticipant: boolean;
    show: boolean;
    cancelling: boolean;
    onCancelTrip: () => void;
    leaving: boolean;
    onLeaveTrip: () => void;
};

export const TripActions = ({
    trip,
    isUserDriver,
    isUserParticipant,
    show,
    cancelling,
    onCancelTrip,
    leaving,
    onLeaveTrip,
}: TripActionsProps) => {
    if (!show) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 top-8">
            {isUserDriver ? (
                <div className="space-y-4">
                    {trip.isActive && (
                        <div className="space-y-3">
                            <button
                                onClick={onCancelTrip}
                                disabled={cancelling}
                                className="w-full bg-pink-500 hover:bg-pink-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {cancelling ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                        Annulation...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-5 h-5"
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
                                        Annuler le trajet
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {!trip.isActive && (
                        <div className="text-center py-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg
                                    className="w-6 h-6 text-red-600"
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
                            <p className="text-red-800 font-medium">Trajet annulé</p>
                        </div>
                    )}
                </div>
            ) : (
                isUserParticipant && (
                    <div className="space-y-4">
                        <div className="text-center py-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg
                                    className="w-6 h-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <p className="text-green-800 font-medium">
                                Vous participez à ce trajet
                            </p>
                        </div>
                        <button
                            onClick={onLeaveTrip}
                            disabled={leaving}
                            className="w-full bg-red-600 hover:bg-red-700 text-sm lg:text-base text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {leaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    Annulation...
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-5 h-5"
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
                                    Annuler ma participation
                                </>
                            )}
                        </button>
                    </div>
                )
            )}
        </div>
    );
};
