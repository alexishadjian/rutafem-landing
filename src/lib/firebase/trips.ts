import {
    CreateTripData,
    Trip,
    TripDoc,
    TripFilters,
    TripSortOption,
    TripWithDriver,
} from '@/types/trips.types';
import { timestampToDate } from '@/utils/date';
import {
    collection,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    query,
    Query,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore';

import { logFirebaseError } from '@/utils/errors';
import { db } from '../firebaseConfig';

const tripsCollection = collection(db, 'trips');

const mapTripDoc = (tripId: string, data: TripDoc): Trip => ({
    id: tripId,
    departureTime: data.departureTime,
    departureDate: data.departureDate,
    departureCity: data.departureCity,
    arrivalCity: data.arrivalCity,
    arrivalAddress: data.arrivalAddress,
    departureLatitude: data.departureLatitude,
    departureLongitude: data.departureLongitude,
    arrivalLatitude: data.arrivalLatitude,
    arrivalLongitude: data.arrivalLongitude,
    totalSeats: data.totalSeats,
    availableSeats: data.availableSeats,
    pricePerSeat: data.pricePerSeat,
    departureAddress: data.departureAddress,
    description: data.description,
    driverId: data.driverId,
    participants: data.participants,
    isActive: data.isActive,
    status: data.status ?? 'pending',
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
});

const sortByDeparture = (a: Trip, b: Trip) => {
    const dateA = new Date(`${a.departureDate} ${a.departureTime}`);
    const dateB = new Date(`${b.departureDate} ${b.departureTime}`);
    return dateA.getTime() - dateB.getTime();
};

const fetchTrips = async (tripQuery: Query<DocumentData>): Promise<Trip[]> => {
    const snapshot = await getDocs(tripQuery);
    return snapshot.docs
        .map((tripDoc) => mapTripDoc(tripDoc.id, tripDoc.data() as TripDoc))
        .sort(sortByDeparture);
};

export const createTrip = async (driverId: string, tripData: CreateTripData): Promise<string> => {
    try {
        const tripRef = doc(tripsCollection);
        await setDoc(tripRef, {
            ...tripData,
            driverId,
            participants: [],
            availableSeats: tripData.totalSeats,
            isActive: true,
            status: tripData.status ?? 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return tripRef.id;
    } catch (error) {
        logFirebaseError('createTrip', error);
        throw new Error('Erreur lors de la création du trajet');
    }
};

export const getActiveTrips = async (): Promise<Trip[]> => {
    try {
        return fetchTrips(
            query(tripsCollection, where('isActive', '==', true), where('availableSeats', '>', 0)),
        );
    } catch (error) {
        logFirebaseError('getActiveTrips', error);
        throw new Error('Erreur lors de la récupération des trajets');
    }
};

export const getTripById = async (tripId: string): Promise<TripWithDriver | null> => {
    try {
        const tripDoc = await getDoc(doc(db, 'trips', tripId));
        if (!tripDoc.exists()) {
            return null;
        }

        const trip = mapTripDoc(tripDoc.id, tripDoc.data() as TripDoc);

        try {
            const driverDoc = await getDoc(doc(db, 'users', trip.driverId));
            if (!driverDoc.exists()) {
                throw new Error('Conductrice non trouvée');
            }
            const driverData = driverDoc.data();
            return {
                ...trip,
                driver: {
                    id: trip.driverId,
                    firstName: (driverData.firstName as string) ?? '',
                    lastName: (driverData.lastName as string) ?? '',
                    email: (driverData.email as string) ?? '',
                    phoneNumber: (driverData.phoneNumber as string) ?? '',
                    averageRating: driverData.averageRating as number | undefined,
                    totalReviews: driverData.totalReviews as number | undefined,
                },
            };
        } catch (driverError) {
            logFirebaseError('getTripDriver', driverError);
            return {
                ...trip,
                driver: {
                    id: trip.driverId,
                    firstName: 'Conductrice',
                    lastName: '',
                    email: '',
                    phoneNumber: '',
                },
            };
        }
    } catch (error) {
        logFirebaseError('getTripById', error);
        throw new Error('Erreur lors de la récupération du trajet');
    }
};

export const joinTrip = async (tripId: string, userId: string): Promise<void> => {
    try {
        const tripRef = doc(db, 'trips', tripId);
        const tripSnapshot = await getDoc(tripRef);
        if (!tripSnapshot.exists()) {
            throw new Error('Trajet non trouvé');
        }

        const tripData = tripSnapshot.data() as TripDoc;

        if (tripData.participants.includes(userId)) {
            throw new Error('Vous participez déjà à ce trajet');
        }
        if (tripData.availableSeats <= 0) {
            throw new Error('Plus de places disponibles pour ce trajet');
        }
        if (!tripData.isActive) {
            throw new Error("Ce trajet n'est plus actif");
        }

        await updateDoc(tripRef, {
            participants: [...tripData.participants, userId],
            availableSeats: tripData.availableSeats - 1,
            updatedAt: new Date(),
        });
    } catch (error) {
        logFirebaseError('joinTrip', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Erreur lors de la participation au trajet');
    }
};

export const leaveTrip = async (tripId: string, userId: string): Promise<void> => {
    try {
        const tripRef = doc(db, 'trips', tripId);
        const tripSnapshot = await getDoc(tripRef);
        if (!tripSnapshot.exists()) {
            throw new Error('Trajet non trouvé');
        }

        const tripData = tripSnapshot.data() as TripDoc;
        if (!tripData.participants.includes(userId)) {
            throw new Error('Vous ne participez pas à ce trajet');
        }
        if (!tripData.isActive) {
            throw new Error("Ce trajet n'est plus actif");
        }

        await updateDoc(tripRef, {
            participants: tripData.participants.filter((id) => id !== userId),
            availableSeats: tripData.availableSeats + 1,
            updatedAt: new Date(),
        });
    } catch (error) {
        logFirebaseError('leaveTrip', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erreur lors de l'annulation de la participation au trajet");
    }
};

export const cancelTrip = async (tripId: string, userId: string): Promise<void> => {
    try {
        const tripRef = doc(db, 'trips', tripId);
        const tripSnapshot = await getDoc(tripRef);
        if (!tripSnapshot.exists()) {
            throw new Error('Trajet non trouvé');
        }

        const tripData = tripSnapshot.data() as TripDoc;
        if (tripData.driverId !== userId) {
            throw new Error('Vous ne pouvez pas annuler ce trajet');
        }
        if (!tripData.isActive) {
            throw new Error("Ce trajet n'est plus actif");
        }

        await updateDoc(tripRef, {
            isActive: false,
            updatedAt: new Date(),
        });
    } catch (error) {
        logFirebaseError('cancelTrip', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erreur lors de l'annulation du trajet");
    }
};

export const getParticipantsInfo = async (
    participantIds: string[],
): Promise<
    {
        id: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
    }[]
> => {
    try {
        const results = await Promise.all(
            participantIds.map(async (participantId) => {
                const userSnapshot = await getDoc(doc(db, 'users', participantId));
                if (!userSnapshot.exists()) {
                    return null;
                }
                const data = userSnapshot.data();
                return {
                    id: participantId,
                    firstName: (data.firstName as string) ?? '',
                    lastName: (data.lastName as string) ?? '',
                    phoneNumber: (data.phoneNumber as string) ?? '',
                };
            }),
        );

        return results.filter(
            (
                participant,
            ): participant is {
                id: string;
                firstName: string;
                lastName: string;
                phoneNumber: string;
            } => participant !== null,
        );
    } catch (error) {
        logFirebaseError('getParticipantsInfo', error);
        throw new Error('Erreur lors de la récupération des informations des participants');
    }
};

export const getUserTrips = async (
    userId: string,
): Promise<{ createdTrips: Trip[]; participatedTrips: Trip[] }> => {
    try {
        const [createdTrips, participatedTrips] = await Promise.all([
            fetchTrips(
                query(
                    tripsCollection,
                    where('driverId', '==', userId),
                    where('isActive', '==', true),
                ),
            ),
            fetchTrips(
                query(
                    tripsCollection,
                    where('participants', 'array-contains', userId),
                    where('isActive', '==', true),
                ),
            ),
        ]);
        return { createdTrips, participatedTrips };
    } catch (error) {
        logFirebaseError('getUserTrips', error);
        throw new Error('Erreur lors de la récupération des trajets utilisateur');
    }
};

// Filter out past trips (date < today)
export const filterPastTrips = (trips: Trip[]): Trip[] => {
    const today = new Date().toISOString().split('T')[0];
    return trips.filter((trip) => trip.departureDate >= today);
};

// TODO Client-side filtering (will be replaced by backend query with Prisma)
export const filterTrips = (trips: Trip[], filters: TripFilters): Trip[] => {
    return trips.filter((trip) => {
        if (
            filters.departureCity &&
            !trip.departureCity.toLowerCase().includes(filters.departureCity.toLowerCase())
        ) {
            return false;
        }
        if (
            filters.arrivalCity &&
            !trip.arrivalCity.toLowerCase().includes(filters.arrivalCity.toLowerCase())
        ) {
            return false;
        }
        if (filters.maxPrice && trip.pricePerSeat > filters.maxPrice) {
            return false;
        }
        if (filters.date && trip.departureDate !== filters.date) {
            return false;
        }
        if (filters.minSeats && trip.availableSeats < filters.minSeats) {
            return false;
        }
        return true;
    });
};

// Sort trips by option
export const sortTrips = (trips: Trip[], sortOption: TripSortOption): Trip[] => {
    const sorted = [...trips];
    switch (sortOption) {
        case 'price_asc':
            return sorted.sort((a, b) => a.pricePerSeat - b.pricePerSeat);
        case 'price_desc':
            return sorted.sort((a, b) => b.pricePerSeat - a.pricePerSeat);
        case 'time_asc':
            return sorted.sort((a, b) => {
                const dateA = new Date(`${a.departureDate}T${a.departureTime}`);
                const dateB = new Date(`${b.departureDate}T${b.departureTime}`);
                return dateA.getTime() - dateB.getTime();
            });
        case 'time_desc':
            return sorted.sort((a, b) => {
                const dateA = new Date(`${a.departureDate}T${a.departureTime}`);
                const dateB = new Date(`${b.departureDate}T${b.departureTime}`);
                return dateB.getTime() - dateA.getTime();
            });
        default:
            return sorted;
    }
};
