import { doc, getDoc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';

import {
    CreateUserProfileParams,
    UserDoc,
    UserProfile,
    VerificationUpdate,
} from '@/types/users.types';
import { db } from '../firebaseConfig';
import { logFirebaseError } from './errors';
import { assertValidFile, buildStoragePath, timestampedFileName, uploadFile } from './storage';

const toDate = (value?: Timestamp | Date): Date =>
    value instanceof Timestamp ? value.toDate() : value ?? new Date();

const mapUserProfile = (uid: string, data: UserDoc): UserProfile => ({
    uid,
    email: (data.email as string) ?? '',
    firstName: (data.firstName as string) ?? '',
    lastName: (data.lastName as string) ?? '',
    phoneNumber: (data.phoneNumber as string) ?? '',
    role: (data.role as 'passenger' | 'driver') ?? 'passenger',
    isUserVerified: Boolean(data.isUserVerified),
    isUserDriverVerified: Boolean(data.isUserDriverVerified),
    verificationStatus:
        (data.verificationStatus as UserProfile['verificationStatus']) ?? 'A vérifier',
    driverLicenseVerificationStatus:
        (data.driverLicenseVerificationStatus as UserProfile['driverLicenseVerificationStatus']) ??
        'A vérifier',
    stripeAccountId: (data.stripeAccountId as string) ?? '',
    createdAt: toDate(data.createdAt),
});

export const createUserProfile = async ({
    uid,
    email,
    firstName,
    lastName,
    phoneNumber,
}: CreateUserProfileParams) => {
    try {
        await setDoc(doc(db, 'users', uid), {
            email,
            firstName,
            lastName,
            phoneNumber,
            role: 'passenger',
            isUserVerified: false,
            isUserDriverVerified: false,
            createdAt: new Date(),
            verificationStatus: 'A vérifier',
        });
    } catch (error) {
        logFirebaseError('createUserProfile', error);
        throw new Error('Erreur lors de la création du profil');
    }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const snapshot = await getDoc(doc(db, 'users', uid));
        if (!snapshot.exists()) {
            return null;
        }
        return mapUserProfile(uid, snapshot.data() as UserDoc);
    } catch (error) {
        logFirebaseError('getUserProfile', error);
        throw new Error('Erreur lors de la récupération du profil');
    }
};

export const uploadVerificationDocuments = async (
    uid: string,
    idCardFront: File,
    idCardBack: File,
    driverLicense?: File,
) => {
    try {
        assertValidFile(idCardFront, 'La carte avant');
        assertValidFile(idCardBack, 'La carte arrière');

        const basePath = `id-cards/${uid}`;
        const frontPath = buildStoragePath([
            basePath,
            timestampedFileName('front', idCardFront.name),
        ]);
        const backPath = buildStoragePath([basePath, timestampedFileName('back', idCardBack.name)]);

        const [frontUrl, backUrl] = await Promise.all([
            uploadFile(frontPath, idCardFront),
            uploadFile(backPath, idCardBack),
        ]);

        const updateData: {
            idCardFront: string;
            idCardBack: string;
            verificationStatus: 'En cours';
            driverLicense?: string;
            role?: 'driver';
            driverVerificationStatus?: 'En cours';
        } = {
            idCardFront: frontUrl,
            idCardBack: backUrl,
            verificationStatus: 'En cours',
        };

        if (driverLicense) {
            assertValidFile(driverLicense, 'Le permis de conduire');
            const licensePath = buildStoragePath([
                `driver-licenses/${uid}`,
                timestampedFileName('license', driverLicense.name),
            ]);
            updateData.driverLicense = await uploadFile(licensePath, driverLicense);
            updateData.role = 'driver';
            updateData.driverVerificationStatus = 'En cours';
        }

        await updateDoc(doc(db, 'users', uid), {
            ...updateData,
            updatedAt: new Date(),
        });
    } catch (error) {
        logFirebaseError('uploadVerificationDocuments', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erreur lors de l'upload des documents");
    }
};

export const uploadDriverLicenseDocuments = async (
    uid: string,
    licenseFront: File,
    licenseBack: File,
) => {
    try {
        assertValidFile(licenseFront, 'Le permis recto');
        assertValidFile(licenseBack, 'Le permis verso');

        const basePath = `driver-licenses/${uid}`;
        const [frontUrl, backUrl] = await Promise.all([
            uploadFile(
                buildStoragePath([
                    basePath,
                    timestampedFileName('license_front', licenseFront.name),
                ]),
                licenseFront,
            ),
            uploadFile(
                buildStoragePath([basePath, timestampedFileName('license_back', licenseBack.name)]),
                licenseBack,
            ),
        ]);

        await updateDoc(doc(db, 'users', uid), {
            driverLicenseFront: frontUrl,
            driverLicenseBack: backUrl,
            driverLicenseVerificationStatus: 'En cours',
            role: 'driver',
            isUserDriverVerified: false,
            updatedAt: new Date(),
        });
    } catch (error) {
        logFirebaseError('uploadDriverLicenseDocuments', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erreur lors de l'upload des documents de permis");
    }
};

export const updateUserVerification = async (
    uid: string,
    { isUserVerified, driverStatus }: VerificationUpdate,
) => {
    try {
        const updateData: {
            isUserVerified: boolean;
            verificationStatus: 'Vérifié' | 'Rejeté';
            verifiedAt: Date;
            driverVerificationStatus?: 'Vérifié' | 'Rejeté';
            driverVerifiedAt?: Date;
        } = {
            isUserVerified,
            verificationStatus: isUserVerified ? 'Vérifié' : 'Rejeté',
            verifiedAt: new Date(),
        };

        if (driverStatus) {
            updateData.driverVerificationStatus = driverStatus;
            updateData.driverVerifiedAt = new Date();
        }

        await updateDoc(doc(db, 'users', uid), {
            ...updateData,
            updatedAt: new Date(),
        });
    } catch (error) {
        logFirebaseError('updateUserVerification', error);
        throw new Error('Erreur lors de la mise à jour de la vérification');
    }
};
