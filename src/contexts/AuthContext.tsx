'use client';

import { getUserProfile } from '@/lib/firebase/users';
import { auth } from '@/lib/firebaseConfig';
import { UserProfile } from '@/types/users.types';
import { logFirebaseError } from '@/utils/errors';
import { User, browserLocalPersistence, onAuthStateChanged, setPersistence } from 'firebase/auth';
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';

type AuthContextType = {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    refreshUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(
        // Load Firestore profile and keep context synchronized.
        async (uid: string) => {
            try {
                const profile = await getUserProfile(uid);
                setUserProfile(profile);
            } catch (error) {
                logFirebaseError('AuthProvider.loadProfile', error);
                setUserProfile(null);
            }
        },
        [],
    );

    const refreshUserProfile = useCallback(async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setUserProfile(null);
            return;
        }
        await loadProfile(currentUser.uid);
    }, [loadProfile]);

    useEffect(() => {
        const configurePersistence = async () => {
            try {
                await setPersistence(auth, browserLocalPersistence);
            } catch (error) {
                logFirebaseError('AuthProvider.persistence', error);
            }
        };
        configurePersistence();

        const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
            setUser(nextUser);
            if (!nextUser) {
                setUserProfile(null);
                setLoading(false);
                return;
            }
            setLoading(true);
            await loadProfile(nextUser.uid);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [loadProfile]);

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, refreshUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
