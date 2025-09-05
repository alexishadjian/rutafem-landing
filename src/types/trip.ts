export type Trip = {
    id: string;
    departureTime: string; // Format: "HH:MM"
    departureDate: string; // Format: "YYYY-MM-DD"
    departureCity: string;
    arrivalCity: string;
    totalSeats: number;
    availableSeats: number;
    pricePerSeat: number;
    departureAddress: string;
    description?: string;
    driverId: string; // ID de l'utilisateur qui crée le trajet
    participants: string[]; // IDs des utilisateurs participants
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type CreateTripData = {
    departureTime: string;
    departureDate: string;
    departureCity: string;
    arrivalCity: string;
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
    };
};
