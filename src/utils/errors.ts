const authErrorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'Email ou mot de passe incorrect',
    'auth/invalid-email': "Format d'email invalide",
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
    'auth/user-not-found': 'Email ou mot de passe incorrect',
    'auth/wrong-password': 'Email ou mot de passe incorrect',
    'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
    'auth/network-request-failed': 'Erreur de connexion. Vérifiez votre internet',
};

export const mapFirebaseAuthError = (code: string): string =>
    authErrorMessages[code] ?? 'Une erreur est survenue. Réessayez';

export const logFirebaseError = (context: string, error: unknown) => {
    console.error(`[Firebase] ${context}`, error);
};

export const logWithContext = (context: string, error: unknown) => {
    console.error(`[RutaFem] ${context}`, error);
};
