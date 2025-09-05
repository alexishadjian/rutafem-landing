'use client';

import { auth, db } from '@/lib/firebaseConfig';
import { User, browserLocalPersistence, onAuthStateChanged, setPersistence } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

type UserProfile = {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: 'passenger' | 'driver';
    isUserVerified: boolean;
    verificationStatus: 'A vérifier' | 'En cours' | 'Vérifié' | 'Rejeté';
    driverLicenseVerificationStatus: 'A vérifier' | 'En cours' | 'Vérifié' | 'Rejeté';
    createdAt: Date;
};

type AuthContextType = {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
});

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

    useEffect(() => {
        const setupPersistence = async () => {
            try {
                await setPersistence(auth, browserLocalPersistence);
                console.log('✅ Persistance de connexion configurée');
            } catch (error) {
                console.warn('⚠️ Erreur configuration persistance:', error);
            }
        };

        setupPersistence();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("🔄 Changement d'état auth:", user ? 'connecté' : 'déconnecté');
            setUser(user);

            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        const profile: UserProfile = {
                            uid: user.uid,
                            email: user.email || '',
                            firstName: data.firstName || '',
                            lastName: data.lastName || '',
                            phoneNumber: data.phoneNumber || '',
                            role: data.role || 'passenger',
                            isUserVerified: data.isUserVerified || false,
                            verificationStatus: data.verificationStatus || 'A vérifier',
                            driverLicenseVerificationStatus:
                                data.driverLicenseVerificationStatus || 'A vérifier',
                            createdAt: data.createdAt?.toDate() || new Date(),
                        };
                        setUserProfile(profile);
                    } else {
                        setUserProfile(null);
                    }
                } catch (error) {
                    console.error('❌ Erreur lors de la récupération du profil:', error);
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, userProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
