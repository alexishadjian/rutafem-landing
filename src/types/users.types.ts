import { Timestamp } from 'firebase/firestore';

export type UserDoc = {
    avatarUrl?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role?: 'passenger' | 'driver';
    isUserVerified?: boolean;
    isUserDriverVerified?: boolean;
    verificationStatus?: 'To verify' | 'Pending' | 'Verified' | 'Rejected';
    driverLicenseVerificationStatus?: 'To verify' | 'Pending' | 'Verified' | 'Rejected';
    stripeAccountId?: string;
    averageRating?: number;
    totalReviews?: number;
    idCardFront?: string;
    idCardBack?: string;
    driverLicenseFront?: string;
    driverLicenseBack?: string;
    createdAt?: Timestamp | Date;
    updatedAt?: Timestamp | Date;
};

export type UserProfile = {
    uid: string;
    avatarUrl?: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: 'passenger' | 'driver';
    isUserVerified: boolean;
    isUserDriverVerified: boolean;
    verificationStatus: 'To verify' | 'Pending' | 'Verified' | 'Rejected';
    driverLicenseVerificationStatus: 'To verify' | 'Pending' | 'Verified' | 'Rejected';
    stripeAccountId: string;
    averageRating?: number;
    totalReviews?: number;
    idCardFront?: string;
    idCardBack?: string;
    driverLicenseFront?: string;
    driverLicenseBack?: string;
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
    driverStatus?: 'Verified' | 'Rejected';
};
