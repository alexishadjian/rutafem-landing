import { Timestamp } from 'firebase/firestore';

export type TripStatus = 'pending' | 'ongoing' | 'completed';

export type Trip = {
    id: string;
    departureTime: string; // format: "HH:MM"
    departureDate: string; // format: "YYYY-MM-DD"
    departureCity: string;
    arrivalCity: string;
    arrivalAddress: string;
    departureLatitude: number;
    departureLongitude: number;
    arrivalLatitude: number;
    arrivalLongitude: number;
    totalSeats: number;
    availableSeats: number;
    pricePerSeat: number;
    departureAddress: string;
    description?: string;
    driverId: string; // user id of the driver
    participants: string[]; // user ids of the participants
    isActive: boolean;
    status: TripStatus;
    createdAt: Date;
    updatedAt: Date;
};

export type CreateTripData = {
    departureTime: string;
    departureDate: string;
    departureCity: string;
    arrivalCity: string;
    arrivalAddress: string;
    departureLatitude: number;
    departureLongitude: number;
    arrivalLatitude: number;
    arrivalLongitude: number;
    totalSeats: number;
    pricePerSeat: number;
    departureAddress: string;
    description?: string;
    status?: TripStatus;
};

export type TripWithDriver = Trip & {
    driver: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        stripeAccountId?: string | null;
        averageRating?: number;
        totalReviews?: number;
    };
};

export type TripDoc = Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> & {
    createdAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
};

export type TripFilters = {
    departureCity: string;
    arrivalCity: string;
    maxPrice: number | null;
    date: string | null;
    minSeats: number | null;
};

export type TripSortOption = 'price_asc' | 'price_desc' | 'time_asc' | 'time_desc' | 'default';
