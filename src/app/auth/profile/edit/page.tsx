'use client';

import { useAuth } from '@/contexts/AuthContext';
import { sendVerificationEmail, updateUserEmail, updateUserPassword } from '@/lib/firebase/auth';
import { updateUserProfile } from '@/lib/firebase/users';
import { updatePasswordSchema, updateProfileSchema } from '@/utils/validation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { z } from 'zod';

export default function EditProfilePage() {
    const { user, userProfile, loading, refreshUserProfile } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        email: '',
        phoneNumber: '',
    });
    const [emailPassword, setEmailPassword] = useState('');
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        emailPassword: false,
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
    const [sendingVerification, setSendingVerification] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    useEffect(() => {
        if (!loading && (!user || !userProfile)) {
            router.push('/auth/login');
        } else if (userProfile) {
            setFormData({
                firstName: userProfile.firstName,
                email: userProfile.email,
                phoneNumber: userProfile.phoneNumber,
            });
        }
    }, [user, userProfile, loading, router]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handlePasswordChange = (field: string, value: string) => {
        setPasswordData((prev) => ({ ...prev, [field]: value }));
        if (passwordErrors[field]) {
            setPasswordErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage('');

        try {
            const validated = updateProfileSchema.parse(formData);
            setSaving(true);

            const updates: Partial<typeof validated> = {};
            if (validated.firstName !== userProfile?.firstName) {
                updates.firstName = validated.firstName;
            }
            if (validated.phoneNumber !== userProfile?.phoneNumber) {
                updates.phoneNumber = validated.phoneNumber;
            }
            if (validated.email !== userProfile?.email) {
                if (!emailPassword) {
                    setErrors({
                        email: "Veuillez entrer votre mot de passe pour modifier l'email",
                    });
                    setSaving(false);
                    return;
                }
                await updateUserEmail(validated.email, emailPassword);
                updates.email = validated.email;
                setEmailPassword('');
            }

            if (Object.keys(updates).length > 0) {
                await updateUserProfile(user!.uid, updates);
                await refreshUserProfile();
                setSuccessMessage('Profil mis à jour avec succès');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                error.issues.forEach((err: z.ZodIssue) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0].toString()] = err.message;
                    }
                });
                setErrors(fieldErrors);
            } else {
                setErrors({
                    general:
                        error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
                });
            }
        } finally {
            setSaving(false);
        }
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordErrors({});
        setPasswordSuccessMessage('');

        try {
            const validated = updatePasswordSchema.parse(passwordData);
            setPasswordSaving(true);
            await updateUserPassword(validated.currentPassword, validated.newPassword);
            setPasswordSuccessMessage('Mot de passe mis à jour avec succès');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                error.issues.forEach((err: z.ZodIssue) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0].toString()] = err.message;
                    }
                });
                setPasswordErrors(fieldErrors);
            } else {
                setPasswordErrors({
                    general:
                        error instanceof Error
                            ? error.message
                            : 'Erreur lors de la mise à jour du mot de passe',
                });
            }
        } finally {
            setPasswordSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--dark-green)] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--pink)] mx-auto mb-4"></div>
                    <p className="text-white">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!user || !userProfile) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[var(--dark-green)] py-4 md:py-8 px-2 md:px-4">
            <div className="md:wrapper wrapper max-w-2xl">
                <div className="bg-[var(--white)] rounded-xl shadow-sm border border-gray-200 p-3 md:p-6 mt-2 md:mt-4">
                    <div className="flex items-center gap-4 mb-6">
                        <Link
                            href="/auth/profile"
                            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-semibold text-[var(--black)] font-staatliches">
                            Modifier mes informations
                        </h1>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleSaveProfile} className="space-y-4 mb-8">
                        <div>
                            <label
                                htmlFor="firstName"
                                className="block text-sm font-medium text-[var(--black)] mb-2"
                            >
                                Prénom
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--pink)] ${
                                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.firstName && (
                                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-[var(--black)] mb-2"
                            >
                                Email
                            </label>
                            {user && !user.emailVerified && (
                                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800 mb-2">
                                        Votre email actuel n&apos;est pas vérifié. Vous devez
                                        vérifier votre email avant de pouvoir le modifier.
                                    </p>
                                    {verificationSent ? (
                                        <p className="text-sm text-green-600">
                                            Email de vérification envoyé ! Vérifiez votre boîte de
                                            réception.
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    setSendingVerification(true);
                                                    await sendVerificationEmail();
                                                    setVerificationSent(true);
                                                } catch (error) {
                                                    setErrors({
                                                        general:
                                                            error instanceof Error
                                                                ? error.message
                                                                : "Erreur lors de l'envoi de l'email",
                                                    });
                                                } finally {
                                                    setSendingVerification(false);
                                                }
                                            }}
                                            disabled={sendingVerification}
                                            className="text-sm text-yellow-800 underline hover:text-yellow-900 disabled:opacity-50"
                                        >
                                            {sendingVerification
                                                ? 'Envoi...'
                                                : 'Envoyer un email de vérification'}
                                        </button>
                                    )}
                                </div>
                            )}
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                disabled={user && !user.emailVerified}
                                className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--pink)] ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                } ${
                                    user && !user.emailVerified
                                        ? 'bg-gray-100 cursor-not-allowed'
                                        : ''
                                }`}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                            {formData.email !== userProfile?.email && user?.emailVerified && (
                                <div className="mt-3">
                                    <label
                                        htmlFor="emailPassword"
                                        className="block text-sm font-medium text-[var(--black)] mb-2"
                                    >
                                        Mot de passe actuel (requis pour modifier l&apos;email)
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="emailPassword"
                                            type={showPasswords.emailPassword ? 'text' : 'password'}
                                            value={emailPassword}
                                            onChange={(e) => {
                                                setEmailPassword(e.target.value);
                                                if (errors.emailPassword) {
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        emailPassword: '',
                                                    }));
                                                }
                                            }}
                                            className={`w-full px-3 md:px-4 py-2 md:py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--pink)] ${
                                                errors.emailPassword
                                                    ? 'border-red-500'
                                                    : 'border-gray-300'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPasswords((prev) => ({
                                                    ...prev,
                                                    emailPassword: !prev.emailPassword,
                                                }))
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPasswords.emailPassword ? (
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                                    <path d="M1 1l22 22" />
                                                </svg>
                                            ) : (
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.emailPassword && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.emailPassword}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="phoneNumber"
                                className="block text-sm font-medium text-[var(--black)] mb-2"
                            >
                                Numéro de téléphone
                            </label>
                            <input
                                id="phoneNumber"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--pink)] ${
                                    errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.phoneNumber && (
                                <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                            )}
                        </div>

                        {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}
                        {successMessage && (
                            <p className="text-green-600 text-sm">{successMessage}</p>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-4 rounded-xl transition-all duration-300 text-base inline-flex items-center justify-center gap-2 cursor-pointer bg-[var(--pink)] text-[var(--black)] hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                        >
                            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </form>

                    {/* Password Form */}
                    <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-xl md:text-2xl font-semibold text-[var(--black)] font-staatliches mb-4">
                            Modifier mon mot de passe
                        </h2>
                        <form onSubmit={handleSavePassword} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="currentPassword"
                                    className="block text-sm font-medium text-[var(--black)] mb-2"
                                >
                                    Mot de passe actuel
                                </label>
                                <div className="relative">
                                    <input
                                        id="currentPassword"
                                        type={showPasswords.currentPassword ? 'text' : 'password'}
                                        value={passwordData.currentPassword}
                                        onChange={(e) =>
                                            handlePasswordChange('currentPassword', e.target.value)
                                        }
                                        className={`w-full px-3 md:px-4 py-2 md:py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--pink)] ${
                                            passwordErrors.currentPassword
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswords((prev) => ({
                                                ...prev,
                                                currentPassword: !prev.currentPassword,
                                            }))
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPasswords.currentPassword ? (
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                                <path d="M1 1l22 22" />
                                            </svg>
                                        ) : (
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {passwordErrors.currentPassword && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {passwordErrors.currentPassword}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="newPassword"
                                    className="block text-sm font-medium text-[var(--black)] mb-2"
                                >
                                    Nouveau mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        id="newPassword"
                                        type={showPasswords.newPassword ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) =>
                                            handlePasswordChange('newPassword', e.target.value)
                                        }
                                        className={`w-full px-3 md:px-4 py-2 md:py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--pink)] ${
                                            passwordErrors.newPassword
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswords((prev) => ({
                                                ...prev,
                                                newPassword: !prev.newPassword,
                                            }))
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPasswords.newPassword ? (
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                                <path d="M1 1l22 22" />
                                            </svg>
                                        ) : (
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {passwordErrors.newPassword && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {passwordErrors.newPassword}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-[var(--black)] mb-2"
                                >
                                    Confirmer le nouveau mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showPasswords.confirmPassword ? 'text' : 'password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) =>
                                            handlePasswordChange('confirmPassword', e.target.value)
                                        }
                                        className={`w-full px-3 md:px-4 py-2 md:py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--pink)] ${
                                            passwordErrors.confirmPassword
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswords((prev) => ({
                                                ...prev,
                                                confirmPassword: !prev.confirmPassword,
                                            }))
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPasswords.confirmPassword ? (
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                                <path d="M1 1l22 22" />
                                            </svg>
                                        ) : (
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {passwordErrors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            {passwordErrors.general && (
                                <p className="text-red-500 text-sm">{passwordErrors.general}</p>
                            )}
                            {passwordSuccessMessage && (
                                <p className="text-green-600 text-sm">{passwordSuccessMessage}</p>
                            )}

                            <button
                                type="submit"
                                disabled={passwordSaving}
                                className="px-8 py-4 rounded-xl transition-all duration-300 text-base inline-flex items-center justify-center gap-2 cursor-pointer bg-[var(--pink)] text-[var(--black)] hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                            >
                                {passwordSaving ? 'Enregistrement...' : 'Modifier le mot de passe'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
