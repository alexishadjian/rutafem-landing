import { CreateTripData, Trip, TripWithDriver } from '@/types/trip';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from './firebaseConfig';

const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'Email ou mot de passe incorrect';
        case 'auth/invalid-email':
            return "Format d'email invalide";
        case 'auth/weak-password':
            return 'Le mot de passe doit contenir au moins 6 caractères';
        case 'auth/user-not-found':
            return 'Email ou mot de passe incorrect';
        case 'auth/wrong-password':
            return 'Email ou mot de passe incorrect';
        case 'auth/too-many-requests':
            return 'Trop de tentatives. Réessayez plus tard';
        case 'auth/network-request-failed':
            return 'Erreur de connexion. Vérifiez votre internet';
        default:
            return 'Une erreur est survenue. Réessayez';
    }
};

export const registerUser = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
) => {
    try {
        // Créer l'utilisateur avec Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Créer le profil utilisateur dans Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            firstName,
            lastName,
            phoneNumber,
            role: 'passenger',
            isUserVerified: false,
            isUserDriverVerified: false,
            createdAt: new Date(),
            verificationStatus: 'A vérifier', // A vérifier, En cours, Vérifié, Rejeté
        });

        return { success: true, user };
    } catch (error: unknown) {
        if (error instanceof Error) {
            // Si c'est une erreur Firebase Auth
            if (error.message.includes('auth/')) {
                throw new Error(getErrorMessage(error.message));
            }
            // Si c'est notre erreur personnalisée
            throw error;
        }
        throw new Error("Erreur lors de l'inscription");
    }
};

export const loginUser = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error: unknown) {
        if (error instanceof Error && error.message.includes('auth/')) {
            throw new Error(getErrorMessage(error.message));
        }
        throw new Error('Erreur lors de la connexion');
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch {
        throw new Error('Erreur lors de la déconnexion');
    }
};

export const uploadVerificationDocuments = async (
    uid: string,
    idCardFront: File,
    idCardBack: File,
    driverLicense?: File,
) => {
    try {
        // Validation des fichiers
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

        if (idCardFront.size > maxSize || idCardBack.size > maxSize) {
            throw new Error('Les fichiers doivent faire moins de 5MB');
        }

        if (!allowedTypes.includes(idCardFront.type) || !allowedTypes.includes(idCardBack.type)) {
            throw new Error('Seuls les formats JPG, PNG et PDF sont acceptés');
        }

        // Upload des cartes d'identité
        const frontFileName = `front_${Date.now()}.${idCardFront.name.split('.').pop()}`;
        const backFileName = `back_${Date.now()}.${idCardBack.name.split('.').pop()}`;

        const frontRef = ref(storage, `id-cards/${uid}/${frontFileName}`);
        const backRef = ref(storage, `id-cards/${uid}/${backFileName}`);

        await uploadBytes(frontRef, idCardFront);
        await uploadBytes(backRef, idCardBack);

        const frontUrl = await getDownloadURL(frontRef);
        const backUrl = await getDownloadURL(backRef);

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

        // Upload du permis de conduire si fourni
        if (driverLicense) {
            if (driverLicense.size > maxSize) {
                throw new Error('Le permis de conduire doit faire moins de 5MB');
            }
            if (!allowedTypes.includes(driverLicense.type)) {
                throw new Error('Le permis de conduire doit être au format JPG, PNG ou PDF');
            }

            const licenseFileName = `license_${Date.now()}.${driverLicense.name.split('.').pop()}`;
            const licenseRef = ref(storage, `driver-licenses/${uid}/${licenseFileName}`);
            await uploadBytes(licenseRef, driverLicense);
            const licenseUrl = await getDownloadURL(licenseRef);

            updateData.driverLicense = licenseUrl;
            updateData.role = 'driver';
            updateData.driverVerificationStatus = 'En cours';
        }

        // Mettre à jour le profil utilisateur
        await updateDoc(doc(db, 'users', uid), updateData);

        return { success: true };
    } catch (error: unknown) {
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
        // Validation des fichiers
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

        if (licenseFront.size > maxSize || licenseBack.size > maxSize) {
            throw new Error('Les fichiers doivent faire moins de 5MB');
        }

        if (!allowedTypes.includes(licenseFront.type) || !allowedTypes.includes(licenseBack.type)) {
            throw new Error('Seuls les formats JPG, PNG et PDF sont acceptés');
        }

        // Upload des documents de permis
        const frontFileName = `license_front_${Date.now()}.${licenseFront.name.split('.').pop()}`;
        const backFileName = `license_back_${Date.now()}.${licenseBack.name.split('.').pop()}`;

        const frontRef = ref(storage, `driver-licenses/${uid}/${frontFileName}`);
        const backRef = ref(storage, `driver-licenses/${uid}/${backFileName}`);

        await uploadBytes(frontRef, licenseFront);
        await uploadBytes(backRef, licenseBack);

        const frontUrl = await getDownloadURL(frontRef);
        const backUrl = await getDownloadURL(backRef);

        // Mettre à jour le profil utilisateur
        await updateDoc(doc(db, 'users', uid), {
            driverLicenseFront: frontUrl,
            driverLicenseBack: backUrl,
            driverLicenseVerificationStatus: 'En cours',
            role: 'driver',
            isUserDriverVerified: false,
        });

        return { success: true };
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erreur lors de l'upload des documents de permis");
    }
};

export const updateUserVerification = async (uid: string, isUserVerified: boolean) => {
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

        await updateDoc(doc(db, 'users', uid), updateData);
        return { success: true };
    } catch {
        throw new Error('Erreur lors de la mise à jour de la vérification');
    }
};

// ===== FONCTIONS POUR LES TRAJETS =====

export const createTrip = async (driverId: string, tripData: CreateTripData): Promise<string> => {
    try {
        const tripRef = doc(collection(db, 'trips'));
        const trip: Omit<Trip, 'id'> = {
            departureTime: tripData.departureTime,
            departureDate: tripData.departureDate,
            departureCity: tripData.departureCity,
            arrivalCity: tripData.arrivalCity,
            totalSeats: tripData.totalSeats,
            availableSeats: tripData.totalSeats,
            pricePerSeat: tripData.pricePerSeat,
            departureAddress: tripData.departureAddress,
            description: tripData.description || '',
            driverId,
            participants: [],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await setDoc(tripRef, trip);
        return tripRef.id;
    } catch (error) {
        console.error('Erreur lors de la création du trajet:', error);
        throw new Error('Erreur lors de la création du trajet');
    }
};

export const getActiveTrips = async (): Promise<Trip[]> => {
    try {
        const tripsQuery = query(
            collection(db, 'trips'),
            where('isActive', '==', true),
            where('availableSeats', '>', 0),
        );

        const tripsSnapshot = await getDocs(tripsQuery);
        const trips: Trip[] = [];

        for (const tripDoc of tripsSnapshot.docs) {
            const tripData = tripDoc.data();
            const trip: Trip = {
                id: tripDoc.id,
                departureTime: tripData.departureTime,
                departureDate: tripData.departureDate,
                departureCity: tripData.departureCity,
                arrivalCity: tripData.arrivalCity,
                totalSeats: tripData.totalSeats,
                availableSeats: tripData.availableSeats,
                pricePerSeat: tripData.pricePerSeat,
                departureAddress: tripData.departureAddress,
                description: tripData.description,
                driverId: tripData.driverId,
                participants: tripData.participants,
                isActive: tripData.isActive,
                createdAt: tripData.createdAt.toDate(),
                updatedAt: tripData.updatedAt.toDate(),
            };

            trips.push(trip);
        }

        // Trier par date de départ (plus récent en premier)
        return trips.sort((a, b) => {
            const dateA = new Date(`${a.departureDate} ${a.departureTime}`);
            const dateB = new Date(`${b.departureDate} ${b.departureTime}`);
            return dateA.getTime() - dateB.getTime();
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des trajets:', error);
        throw new Error('Erreur lors de la récupération des trajets');
    }
};

export const getTripById = async (tripId: string): Promise<TripWithDriver | null> => {
    try {
        const tripDoc = await getDoc(doc(db, 'trips', tripId));

        if (!tripDoc.exists()) {
            return null;
        }

        const tripData = tripDoc.data();
        const trip: Trip = {
            id: tripDoc.id,
            departureTime: tripData.departureTime,
            departureDate: tripData.departureDate,
            departureCity: tripData.departureCity,
            arrivalCity: tripData.arrivalCity,
            totalSeats: tripData.totalSeats,
            availableSeats: tripData.availableSeats,
            pricePerSeat: tripData.pricePerSeat,
            departureAddress: tripData.departureAddress,
            description: tripData.description,
            driverId: tripData.driverId,
            participants: tripData.participants,
            isActive: tripData.isActive,
            createdAt: tripData.createdAt.toDate(),
            updatedAt: tripData.updatedAt.toDate(),
        };

        // Récupérer les informations du conducteur
        try {
            const driverDoc = await getDoc(doc(db, 'users', trip.driverId));
            if (!driverDoc.exists()) {
                throw new Error('Conducteur non trouvé');
            }

            const driverData = driverDoc.data();
            return {
                ...trip,
                driver: {
                    id: trip.driverId,
                    firstName: driverData.firstName || '',
                    lastName: driverData.lastName || '',
                    email: driverData.email || '',
                    phoneNumber: driverData.phoneNumber || '',
                },
            };
        } catch (driverError) {
            console.error('Erreur lors de la récupération du conducteur:', driverError);
            // Retourner le trajet sans les informations du conducteur
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
        console.error('Erreur lors de la récupération du trajet:', error);
        throw new Error('Erreur lors de la récupération du trajet');
    }
};

export const joinTrip = async (tripId: string, userId: string): Promise<void> => {
    try {
        const tripRef = doc(db, 'trips', tripId);
        const tripDoc = await getDoc(tripRef);

        if (!tripDoc.exists()) {
            throw new Error('Trajet non trouvé');
        }

        const tripData = tripDoc.data() as Trip;

        // Vérifier si l'utilisateur est déjà participant
        if (tripData.participants.includes(userId)) {
            throw new Error('Vous participez déjà à ce trajet');
        }

        // Vérifier s'il reste des places
        if (tripData.availableSeats <= 0) {
            throw new Error('Plus de places disponibles pour ce trajet');
        }

        // Vérifier si le trajet est actif
        if (!tripData.isActive) {
            throw new Error("Ce trajet n'est plus actif");
        }

        // Ajouter l'utilisateur aux participants et diminuer les places disponibles
        const updatedParticipants = [...tripData.participants, userId];
        const updatedAvailableSeats = tripData.availableSeats - 1;

        await updateDoc(tripRef, {
            participants: updatedParticipants,
            availableSeats: updatedAvailableSeats,
            updatedAt: new Date(),
        });
    } catch (error) {
        console.error('Erreur lors de la participation au trajet:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Erreur lors de la participation au trajet');
    }
};

export const leaveTrip = async (tripId: string, userId: string): Promise<void> => {
    try {
        const tripRef = doc(db, 'trips', tripId);
        const tripDoc = await getDoc(tripRef);

        if (!tripDoc.exists()) {
            throw new Error('Trajet non trouvé');
        }

        const tripData = tripDoc.data() as Trip;

        // Vérifier si l'utilisateur est bien participant
        if (!tripData.participants.includes(userId)) {
            throw new Error('Vous ne participez pas à ce trajet');
        }

        // Vérifier si le trajet est actif
        if (!tripData.isActive) {
            throw new Error("Ce trajet n'est plus actif");
        }

        // Retirer l'utilisateur des participants et augmenter les places disponibles
        const updatedParticipants = tripData.participants.filter((id) => id !== userId);
        const updatedAvailableSeats = tripData.availableSeats + 1;

        await updateDoc(tripRef, {
            participants: updatedParticipants,
            availableSeats: updatedAvailableSeats,
            updatedAt: new Date(),
        });
    } catch (error) {
        console.error("Erreur lors de l'annulation de la participation au trajet:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erreur lors de l'annulation de la participation au trajet");
    }
};

export const cancelTrip = async (tripId: string, userId: string): Promise<void> => {
    try {
        const tripRef = doc(db, 'trips', tripId);
        const tripDoc = await getDoc(tripRef);

        if (!tripDoc.exists()) {
            throw new Error('Trajet non trouvé');
        }

        const tripData = tripDoc.data() as Trip;

        // Vérifier que l'utilisateur est bien le créateur du trajet
        if (tripData.driverId !== userId) {
            throw new Error('Vous ne pouvez pas annuler ce trajet');
        }

        // Vérifier si le trajet est actif
        if (!tripData.isActive) {
            throw new Error("Ce trajet n'est plus actif");
        }

        // Désactiver le trajet
        await updateDoc(tripRef, {
            isActive: false,
            updatedAt: new Date(),
        });
    } catch (error) {
        console.error("Erreur lors de l'annulation du trajet:", error);
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
        const participantsInfo = [];

        for (const participantId of participantIds) {
            const userDoc = await getDoc(doc(db, 'users', participantId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                participantsInfo.push({
                    id: participantId,
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    phoneNumber: userData.phoneNumber || '',
                });
            }
        }

        return participantsInfo;
    } catch (error) {
        console.error('Erreur lors de la récupération des informations des participants:', error);
        throw new Error('Erreur lors de la récupération des informations des participants');
    }
};

export const getUserTrips = async (
    userId: string,
): Promise<{
    createdTrips: Trip[];
    participatedTrips: Trip[];
}> => {
    try {
        // Récupérer les trajets créés par l'utilisateur
        const createdTripsQuery = query(
            collection(db, 'trips'),
            where('driverId', '==', userId),
            where('isActive', '==', true),
        );

        const createdTripsSnapshot = await getDocs(createdTripsQuery);
        const createdTrips: Trip[] = [];

        for (const tripDoc of createdTripsSnapshot.docs) {
            const tripData = tripDoc.data();
            const trip: Trip = {
                id: tripDoc.id,
                departureTime: tripData.departureTime,
                departureDate: tripData.departureDate,
                departureCity: tripData.departureCity,
                arrivalCity: tripData.arrivalCity,
                totalSeats: tripData.totalSeats,
                availableSeats: tripData.availableSeats,
                pricePerSeat: tripData.pricePerSeat,
                departureAddress: tripData.departureAddress,
                description: tripData.description,
                driverId: tripData.driverId,
                participants: tripData.participants,
                isActive: tripData.isActive,
                createdAt: tripData.createdAt.toDate(),
                updatedAt: tripData.updatedAt.toDate(),
            };

            createdTrips.push(trip);
        }

        // Récupérer les trajets auxquels l'utilisateur participe
        const participatedTripsQuery = query(
            collection(db, 'trips'),
            where('participants', 'array-contains', userId),
            where('isActive', '==', true),
        );

        const participatedTripsSnapshot = await getDocs(participatedTripsQuery);
        const participatedTrips: Trip[] = [];

        for (const tripDoc of participatedTripsSnapshot.docs) {
            const tripData = tripDoc.data();
            const trip: Trip = {
                id: tripDoc.id,
                departureTime: tripData.departureTime,
                departureDate: tripData.departureDate,
                departureCity: tripData.departureCity,
                arrivalCity: tripData.arrivalCity,
                totalSeats: tripData.totalSeats,
                availableSeats: tripData.availableSeats,
                pricePerSeat: tripData.pricePerSeat,
                departureAddress: tripData.departureAddress,
                description: tripData.description,
                driverId: tripData.driverId,
                participants: tripData.participants,
                isActive: tripData.isActive,
                createdAt: tripData.createdAt.toDate(),
                updatedAt: tripData.updatedAt.toDate(),
            };

            participatedTrips.push(trip);
        }

        // Trier par date de départ (plus proche en premier)
        const sortByDate = (a: Trip, b: Trip) => {
            const dateA = new Date(`${a.departureDate} ${a.departureTime}`);
            const dateB = new Date(`${b.departureDate} ${b.departureTime}`);
            return dateA.getTime() - dateB.getTime();
        };

        createdTrips.sort(sortByDate);
        participatedTrips.sort(sortByDate);

        return { createdTrips, participatedTrips };
    } catch (error) {
        console.error('Erreur lors de la récupération des trajets utilisateur:', error);
        throw new Error('Erreur lors de la récupération des trajets utilisateur');
    }
};
