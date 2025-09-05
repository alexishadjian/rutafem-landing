'use client';

import { auth, db } from '@/lib/firebaseConfig';
import { User, browserLocalPersistence, onAuthStateChanged, setPersistence } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';

type UserProfile = {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: 'passenger' | 'driver';
    isUserVerified: boolean;
    isUserDriverVerified: boolean;
    verificationStatus: 'A vérifier' | 'En cours' | 'Vérifié' | 'Rejeté';
    driverLicenseVerificationStatus: 'A vérifier' | 'En cours' | 'Vérifié' | 'Rejeté';
    createdAt: Date;
};

type AuthContextType = {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    refreshUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
    refreshUserProfile: async () => {},
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

    // Fonction pour recharger le profil utilisateur après une vérification de profil
    const refreshUserProfile = useCallback(async () => {
        if (!user || !auth.currentUser) {
            console.log('⚠️ Utilisateur non authentifié, impossible de recharger le profil');
            return;
        }

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
                    isUserDriverVerified: data.isUserDriverVerified || false,
                    verificationStatus: data.verificationStatus || 'A vérifier',
                    driverLicenseVerificationStatus:
                        data.driverLicenseVerificationStatus || 'A vérifier',
                    createdAt: data.createdAt?.toDate() || new Date(),
                };
                setUserProfile(profile);
                console.log('✅ Profil utilisateur mis à jour');
            }
        } catch (error) {
            // Ne pas logger l'erreur si l'utilisateur n'est plus authentifié
            if (error instanceof Error && error.message.includes('permissions')) {
                console.log('⚠️ Permissions insuffisantes - utilisateur probablement déconnecté');
                return;
            }
            console.error('❌ Erreur lors de la mise à jour du profil:', error);
        }
    }, [user]);

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
                            isUserDriverVerified: data.isUserDriverVerified || false,
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
        <AuthContext.Provider value={{ user, userProfile, loading, refreshUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
