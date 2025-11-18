import { Timestamp } from 'firebase/firestore';

export type UserDoc = {
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role?: 'passenger' | 'driver';
    isUserVerified?: boolean;
    isUserDriverVerified?: boolean;
    verificationStatus?: 'A vérifier' | 'En cours' | 'Vérifié' | 'Rejeté';
    driverLicenseVerificationStatus?: 'A vérifier' | 'En cours' | 'Vérifié' | 'Rejeté';
    stripeAccountId?: string;
    averageRating?: number;
    totalReviews?: number;
    createdAt?: Timestamp | Date;
    updatedAt?: Timestamp | Date;
};

export type UserProfile = {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: 'passenger' | 'driver';
    isUserVerified: boolean;
    isUserDriverVerified: boolean;
    verificationStatus: 'A vérifier' | 'En cours' | 'Vérifié' | 'Rejeté';
    driverLicenseVerificationStatus: 'A vérifier' | 'En cours' | 'Vérifié' | 'Rejeté';
    stripeAccountId: string;
    averageRating?: number;
    totalReviews?: number;
    createdAt: Date;
};

export type CreateUserProfileParams = {
    uid: string;
    email: string | null;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role?: 'passenger' | 'driver';
};

export type VerificationUpdate = {
    isUserVerified: boolean;
    driverStatus?: 'Vérifié' | 'Rejeté';
};
