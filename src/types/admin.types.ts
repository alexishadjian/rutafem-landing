export type AdminUser = {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: 'passenger' | 'driver';
    isUserVerified: boolean;
    isUserDriverVerified: boolean;
    verificationStatus: 'To verify' | 'Pending' | 'Verified' | 'Rejected';
    driverLicenseVerificationStatus: 'To verify' | 'Pending' | 'Verified' | 'Rejected';
    idCardFront?: string;
    idCardBack?: string;
    driverLicenseFront?: string;
    driverLicenseBack?: string;
    createdAt: Date;
};

export type PendingVerification = {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    verificationStatus: 'Pending';
    driverLicenseVerificationStatus?: 'Pending';
    idCardFront?: string;
    idCardBack?: string;
    driverLicenseFront?: string;
    driverLicenseBack?: string;
    createdAt: Date;
};

export type VerificationAction = 'approve' | 'reject';

export type VerificationType = 'identity' | 'driver';

export type AdminStats = {
    totalUsers: number;
    pendingVerifications: number;
    activeTrips: number;
    totalTrips: number;
};
