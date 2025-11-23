import { Timestamp } from 'firebase/firestore';

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
