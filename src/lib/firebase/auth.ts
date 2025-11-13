import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

import { auth } from '../firebaseConfig';
import { logFirebaseError, mapAuthErrorCode } from './errors';
import { createUserProfile } from './users';

export const registerUser = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
) => {
    try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile({
            uid: user.uid,
            email: user.email,
            firstName,
            lastName,
            phoneNumber,
        });
        return { success: true, user };
    } catch (error) {
        logFirebaseError('registerUser', error);
        if (error instanceof FirebaseError) {
            throw new Error(mapAuthErrorCode(error.code));
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
            throw new Error(mapAuthErrorCode(error.code));
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
