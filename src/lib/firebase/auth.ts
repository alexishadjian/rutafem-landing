import { FirebaseError } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
    updateEmail,
    updatePassword,
} from 'firebase/auth';

import { logFirebaseError, mapFirebaseAuthError } from '@/utils/errors';
import { auth } from '../firebaseConfig';
import { createUserProfile } from './users';

export const registerUser = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    role: 'passenger' | 'driver' = 'passenger',
) => {
    try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile({
            uid: user.uid,
            email: user.email,
            firstName,
            lastName,
            phoneNumber,
            role,
        });
        return { success: true, user };
    } catch (error) {
        logFirebaseError('registerUser', error);
        if (error instanceof FirebaseError) {
            throw new Error(mapFirebaseAuthError(error.code));
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erreur lors de l'inscription");
    }
};

export const loginUser = async (email: string, password: string) => {
    try {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user };
    } catch (error) {
        logFirebaseError('loginUser', error);
        if (error instanceof FirebaseError) {
            throw new Error(mapFirebaseAuthError(error.code));
        }
        throw new Error('Erreur lors de la connexion');
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        logFirebaseError('logoutUser', error);
        throw new Error('Erreur lors de la déconnexion');
    }
};

export const sendVerificationEmail = async () => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Utilisateur non connecté');
        }
        await sendEmailVerification(user);
        return { success: true };
    } catch (error) {
        logFirebaseError('sendVerificationEmail', error);
        if (error instanceof FirebaseError) {
            throw new Error(mapFirebaseAuthError(error.code));
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erreur lors de l'envoi de l'email de vérification");
    }
};

export const updateUserEmail = async (newEmail: string, currentPassword: string) => {
    try {
        const user = auth.currentUser;
        if (!user || !user.email) {
            throw new Error('Utilisateur non connecté');
        }

        // Vérifier si l'email actuel est vérifié
        if (!user.emailVerified) {
            throw new Error(
                'Votre email actuel doit être vérifié avant de pouvoir le modifier. Veuillez vérifier votre email ou demander un nouvel email de vérification.',
            );
        }

        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, newEmail);

        // Envoyer un email de vérification au nouvel email
        await sendEmailVerification(user);

        return { success: true };
    } catch (error) {
        logFirebaseError('updateUserEmail', error);
        if (error instanceof FirebaseError) {
            throw new Error(mapFirebaseAuthError(error.code));
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erreur lors de la mise à jour de l'email");
    }
};

export const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    try {
        const user = auth.currentUser;
        if (!user || !user.email) {
            throw new Error('Utilisateur non connecté');
        }
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        return { success: true };
    } catch (error) {
        logFirebaseError('updateUserPassword', error);
        if (error instanceof FirebaseError) {
            throw new Error(mapFirebaseAuthError(error.code));
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Erreur lors de la mise à jour du mot de passe');
    }
};
