import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where,
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';

import { AdminStats, AdminUser, PendingVerification, VerificationType } from '@/types/admin.types';
import { Trip, TripDoc } from '@/types/trips.types';
import { UserDoc } from '@/types/users.types';
import { timestampToDate } from '@/utils/date';
import { logFirebaseError } from '@/utils/errors';
import { db, storage } from '../firebaseConfig';

// ==================== USERS ====================

const mapAdminUser = (uid: string, data: UserDoc): AdminUser => ({
    uid,
    email: data.email ?? '',
    firstName: data.firstName ?? '',
    lastName: data.lastName ?? '',
    phoneNumber: data.phoneNumber ?? '',
    role: data.role ?? 'passenger',
    isUserVerified: Boolean(data.isUserVerified),
    isUserDriverVerified: Boolean(data.isUserDriverVerified),
    verificationStatus: data.verificationStatus ?? 'To verify',
    driverLicenseVerificationStatus: data.driverLicenseVerificationStatus ?? 'To verify',
    idCardFront: data.idCardFront,
    idCardBack: data.idCardBack,
    driverLicenseFront: data.driverLicenseFront,
    driverLicenseBack: data.driverLicenseBack,
    createdAt: timestampToDate(data.createdAt),
});

export const getAllUsers = async (): Promise<AdminUser[]> => {
    try {
        const snapshot = await getDocs(
            query(collection(db, 'users'), orderBy('createdAt', 'desc')),
        );
        return snapshot.docs.map((doc) => mapAdminUser(doc.id, doc.data() as UserDoc));
    } catch (error) {
        logFirebaseError('admin.getAllUsers', error);
        throw new Error('Erreur lors de la récupération des utilisateurs');
    }
};

export const updateUserByAdmin = async (
    uid: string,
    data: Partial<Pick<AdminUser, 'firstName' | 'lastName' | 'email' | 'phoneNumber' | 'role'>>,
): Promise<void> => {
    try {
        await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: new Date() });
    } catch (error) {
        logFirebaseError('admin.updateUserByAdmin', error);
        throw new Error("Erreur lors de la mise à jour de l'utilisateur");
    }
};

// ==================== VERIFICATIONS ====================

export const getPendingVerifications = async (): Promise<PendingVerification[]> => {
    try {
        // Get users with pending identity OR driver verification
        const [identityPending, driverPending] = await Promise.all([
            getDocs(query(collection(db, 'users'), where('verificationStatus', '==', 'Pending'))),
            getDocs(
                query(
                    collection(db, 'users'),
                    where('driverLicenseVerificationStatus', '==', 'Pending'),
                ),
            ),
        ]);

        const usersMap = new Map<string, PendingVerification>();

        identityPending.docs.forEach((doc) => {
            const data = doc.data() as UserDoc;
            usersMap.set(doc.id, {
                uid: doc.id,
                firstName: data.firstName ?? '',
                lastName: data.lastName ?? '',
                email: data.email ?? '',
                verificationStatus: 'Pending',
                driverLicenseVerificationStatus: data.driverLicenseVerificationStatus as
                    | 'Pending'
                    | undefined,
                idCardFront: data.idCardFront,
                idCardBack: data.idCardBack,
                driverLicenseFront: data.driverLicenseFront,
                driverLicenseBack: data.driverLicenseBack,
                createdAt: timestampToDate(data.createdAt),
            });
        });

        driverPending.docs.forEach((doc) => {
            const data = doc.data() as UserDoc;
            if (!usersMap.has(doc.id)) {
                usersMap.set(doc.id, {
                    uid: doc.id,
                    firstName: data.firstName ?? '',
                    lastName: data.lastName ?? '',
                    email: data.email ?? '',
                    verificationStatus: (data.verificationStatus as 'Pending') ?? 'Pending',
                    driverLicenseVerificationStatus: 'Pending',
                    idCardFront: data.idCardFront,
                    idCardBack: data.idCardBack,
                    driverLicenseFront: data.driverLicenseFront,
                    driverLicenseBack: data.driverLicenseBack,
                    createdAt: timestampToDate(data.createdAt),
                });
            } else {
                const existing = usersMap.get(doc.id)!;
                existing.driverLicenseVerificationStatus = 'Pending';
            }
        });

        return Array.from(usersMap.values()).sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
    } catch (error) {
        logFirebaseError('admin.getPendingVerifications', error);
        throw new Error('Erreur lors de la récupération des vérifications en attente');
    }
};

// Extract storage path from Firebase download URL
const getStoragePathFromUrl = (url: string): string | null => {
    try {
        const decodedUrl = decodeURIComponent(url);
        const match = decodedUrl.match(/\/o\/(.+?)\?/);
        return match ? match[1] : null;
    } catch {
        return null;
    }
};

// Delete file from Firebase Storage
const deleteStorageFile = async (url: string): Promise<void> => {
    const path = getStoragePathFromUrl(url);
    if (!path) return;
    try {
        await deleteObject(ref(storage, path));
    } catch (error) {
        logFirebaseError('admin.deleteStorageFile', error);
    }
};

export const approveVerification = async (uid: string, type: VerificationType): Promise<void> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) throw new Error('Utilisateur non trouvé');

        const userData = userDoc.data() as UserDoc;
        const updateData: Record<string, unknown> = { updatedAt: new Date() };

        if (type === 'identity') {
            updateData.isUserVerified = true;
            updateData.verificationStatus = 'Verified';
            updateData.verifiedAt = new Date();
            // Delete ID card images after approval
            if (userData.idCardFront) {
                await deleteStorageFile(userData.idCardFront);
                updateData.idCardFront = null;
            }
            if (userData.idCardBack) {
                await deleteStorageFile(userData.idCardBack);
                updateData.idCardBack = null;
            }
        } else {
            updateData.isUserDriverVerified = true;
            updateData.driverLicenseVerificationStatus = 'Verified';
            updateData.driverVerifiedAt = new Date();
            // Delete driver license images after approval
            if (userData.driverLicenseFront) {
                await deleteStorageFile(userData.driverLicenseFront);
                updateData.driverLicenseFront = null;
            }
            if (userData.driverLicenseBack) {
                await deleteStorageFile(userData.driverLicenseBack);
                updateData.driverLicenseBack = null;
            }
        }

        await updateDoc(doc(db, 'users', uid), updateData);
    } catch (error) {
        logFirebaseError('admin.approveVerification', error);
        throw new Error('Erreur lors de la validation');
    }
};

export const rejectVerification = async (uid: string, type: VerificationType): Promise<void> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) throw new Error('Utilisateur non trouvé');

        const userData = userDoc.data() as UserDoc;
        const updateData: Record<string, unknown> = { updatedAt: new Date() };

        if (type === 'identity') {
            updateData.isUserVerified = false;
            updateData.verificationStatus = 'Rejected';
            // Delete ID card images after rejection
            if (userData.idCardFront) {
                await deleteStorageFile(userData.idCardFront);
                updateData.idCardFront = null;
            }
            if (userData.idCardBack) {
                await deleteStorageFile(userData.idCardBack);
                updateData.idCardBack = null;
            }
        } else {
            updateData.isUserDriverVerified = false;
            updateData.driverLicenseVerificationStatus = 'Rejected';
            // Delete driver license images after rejection
            if (userData.driverLicenseFront) {
                await deleteStorageFile(userData.driverLicenseFront);
                updateData.driverLicenseFront = null;
            }
            if (userData.driverLicenseBack) {
                await deleteStorageFile(userData.driverLicenseBack);
                updateData.driverLicenseBack = null;
            }
        }

        await updateDoc(doc(db, 'users', uid), updateData);
    } catch (error) {
        logFirebaseError('admin.rejectVerification', error);
        throw new Error('Erreur lors du rejet');
    }
};

// ==================== TRIPS ====================

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

export const getAllTrips = async (): Promise<Trip[]> => {
    try {
        const snapshot = await getDocs(
            query(collection(db, 'trips'), orderBy('createdAt', 'desc')),
        );
        return snapshot.docs.map((doc) => mapTripDoc(doc.id, doc.data() as TripDoc));
    } catch (error) {
        logFirebaseError('admin.getAllTrips', error);
        throw new Error('Erreur lors de la récupération des trajets');
    }
};

export const updateTripByAdmin = async (
    tripId: string,
    data: Partial<
        Pick<
            Trip,
            | 'departureCity'
            | 'arrivalCity'
            | 'departureDate'
            | 'departureTime'
            | 'pricePerSeat'
            | 'totalSeats'
            | 'isActive'
            | 'status'
        >
    >,
): Promise<void> => {
    try {
        await updateDoc(doc(db, 'trips', tripId), { ...data, updatedAt: new Date() });
    } catch (error) {
        logFirebaseError('admin.updateTripByAdmin', error);
        throw new Error('Erreur lors de la mise à jour du trajet');
    }
};

export const cancelTripByAdmin = async (tripId: string): Promise<void> => {
    try {
        await updateDoc(doc(db, 'trips', tripId), {
            isActive: false,
            updatedAt: new Date(),
        });
    } catch (error) {
        logFirebaseError('admin.cancelTripByAdmin', error);
        throw new Error("Erreur lors de l'annulation du trajet");
    }
};

export const deleteTripByAdmin = async (tripId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'trips', tripId));
    } catch (error) {
        logFirebaseError('admin.deleteTripByAdmin', error);
        throw new Error('Erreur lors de la suppression du trajet');
    }
};

// ==================== STATS ====================

export const getAdminStats = async (): Promise<AdminStats> => {
    try {
        const [usersSnap, tripsSnap, pendingVerifs] = await Promise.all([
            getDocs(collection(db, 'users')),
            getDocs(collection(db, 'trips')),
            getPendingVerifications(),
        ]);

        const activeTrips = tripsSnap.docs.filter((doc) => (doc.data() as TripDoc).isActive).length;

        return {
            totalUsers: usersSnap.size,
            pendingVerifications: pendingVerifs.length,
            activeTrips,
            totalTrips: tripsSnap.size,
        };
    } catch (error) {
        logFirebaseError('admin.getAdminStats', error);
        throw new Error('Erreur lors de la récupération des statistiques');
    }
};
