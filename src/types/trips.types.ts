import { Timestamp } from 'firebase/firestore';

export type TripStatus = 'pending' | 'confirmed' | 'ongoing' | 'completed';

/**
 * Booking Status Flow:
 *
 * [PAYMENT] → authorized → [TRIP HAPPENS] → confirmed → captured
 *                 ↓                              ↓
 *            cancelled                      disputed
 *
 * - authorized: Payment hold placed on card (not charged yet)
 * - confirmed: Both driver and passenger confirmed (triggers capture)
 * - captured: Payment successfully charged and transferred to driver
 * - cancelled: Booking cancelled, payment hold released (no charge)
 * - disputed: Problem reported, payment frozen pending admin review
 */
export type BookingStatus = 'authorized' | 'confirmed' | 'captured' | 'cancelled' | 'disputed';

/**
 * Booking represents a passenger's reservation for a trip.
 * Embedded in the Trip document as an array.
 */
export type Booking = {
    oderId: string; // Unique ID for this booking (generated at checkout)
    participantId: string; // User ID of the passenger
    paymentIntentId: string; // Stripe PaymentIntent ID for refund/capture
    status: BookingStatus;
    amountCents: number; // Total amount in cents
    driverConfirmedAt?: Date; // When driver confirmed trip went well
    passengerConfirmedAt?: Date; // When passenger confirmed trip went well
    disputedAt?: Date; // When a dispute was raised
    disputedBy?: 'driver' | 'passenger'; // Who raised the dispute
    capturedAt?: Date; // When payment was captured
    cancelledAt?: Date; // When booking was cancelled
    createdAt: Date;
};

/**
 * Firestore version of Booking (Timestamps instead of Dates)
 */
export type BookingDoc = Omit<Booking, 'createdAt' | 'driverConfirmedAt' | 'passengerConfirmedAt' | 'disputedAt' | 'capturedAt' | 'cancelledAt'> & {
    createdAt: Timestamp | Date;
    driverConfirmedAt?: Timestamp | Date;
    passengerConfirmedAt?: Timestamp | Date;
    disputedAt?: Timestamp | Date;
    capturedAt?: Timestamp | Date;
    cancelledAt?: Timestamp | Date;
};

/**
 * Trip represents a carpool ride offered by a driver.
 */
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
    driverId: string; // User ID of the driver
    participants: string[]; // User IDs of passengers (for quick lookup)
    bookings: Booking[]; // Detailed booking info with payment status
    isActive: boolean;
    status: TripStatus;
    createdAt: Date;
    updatedAt: Date;
};

/**
 * Data required to create a new trip (without system fields)
 */
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

/**
 * Trip with driver info populated (for display)
 */
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

/**
 * Firestore version of Trip (Timestamps instead of Dates)
 */
export type TripDoc = Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'bookings'> & {
    createdAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
    bookings?: BookingDoc[];
};
