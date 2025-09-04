import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
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
            isVerified: false,
            isUserVerified: false,
            createdAt: new Date(),
            verificationStatus: 'pending',
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
            verificationStatus: 'pending';
            driverLicense?: string;
            role?: 'driver';
            driverVerificationStatus?: 'pending';
        } = {
            idCardFront: frontUrl,
            idCardBack: backUrl,
            verificationStatus: 'pending',
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
            updateData.driverVerificationStatus = 'pending';
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

export const updateUserVerification = async (
    uid: string,
    isVerified: boolean,
    isUserVerified?: boolean,
) => {
    try {
        const updateData: {
            isVerified: boolean;
            verificationStatus: 'verified' | 'rejected';
            verifiedAt: Date;
            isUserVerified?: boolean;
            driverVerificationStatus?: 'verified' | 'rejected';
            driverVerifiedAt?: Date;
        } = {
            isVerified,
            verificationStatus: isVerified ? 'verified' : 'rejected',
            verifiedAt: new Date(),
        };

        if (isUserVerified !== undefined) {
            updateData.isUserVerified = isUserVerified;
            updateData.driverVerificationStatus = isUserVerified ? 'verified' : 'rejected';
            updateData.driverVerifiedAt = new Date();
        }

        await updateDoc(doc(db, 'users', uid), updateData);
        return { success: true };
    } catch {
        throw new Error('Erreur lors de la mise à jour de la vérification');
    }
};
