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
    idCardFront: File,
    idCardBack: File,
) => {
    try {
        if (!idCardFront || !idCardBack) {
            throw new Error("Les deux faces de la carte d'identité sont requises");
        }

        const maxSize = 5 * 1024 * 1024;
        if (idCardFront.size > maxSize || idCardBack.size > maxSize) {
            throw new Error('Les fichiers doivent faire moins de 5MB');
        }

        const allowedTypes = ['image/jpeg', '<`image/jpg`>', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(idCardFront.type) || !allowedTypes.includes(idCardBack.type)) {
            throw new Error('Seuls les formats JPG, PNG et PDF sont acceptés');
        }

        // Créer l'utilisateur avec Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Upload des cartes d'identité
        const frontRef = ref(storage, `id-cards/${user.uid}/front.jpg`);
        const backRef = ref(storage, `id-cards/${user.uid}/back.jpg`);

        await uploadBytes(frontRef, idCardFront);
        await uploadBytes(backRef, idCardBack);

        const frontUrl = await getDownloadURL(frontRef);
        const backUrl = await getDownloadURL(backRef);

        // Créer le profil utilisateur dans Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            isVerified: false,
            idCardFront: frontUrl,
            idCardBack: backUrl,
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

export const updateUserVerification = async (uid: string, isVerified: boolean) => {
    try {
        await updateDoc(doc(db, 'users', uid), {
            isVerified,
            verificationStatus: isVerified ? 'verified' : 'rejected',
            verifiedAt: new Date(),
        });
        return { success: true };
    } catch {
        throw new Error('Erreur lors de la mise à jour de la vérification');
    }
};
