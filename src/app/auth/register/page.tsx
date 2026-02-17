'use client';

import { registerUser } from '@/lib/firebase/auth';
import { BlueMoovingCar, TravelerPassenger } from '@/public/images';
import { registerUserSchema } from '@/utils/validation';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'driver' | 'passenger'>('passenger');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = registerUserSchema.safeParse({
            email,
            password,
            confirmPassword,
            firstName,
            lastName,
            phoneNumber,
            acceptTerms,
        });
        if (!validation.success) {
            setError(validation.error.issues[0]?.message ?? 'Formulaire invalide');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await registerUser(email, password, firstName, lastName, phoneNumber, selectedRole);
            fetch('/api/webhooks/new-user', { method: 'POST' }).catch(() => {});
            router.push('/auth/profile/verification');
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--white)] flex items-center justify-center p-4">
            <div className="md:wrapper wrapper">
                <div className="text-start p-6">
                    <h2 className="text-3xl md:text-5xl font-semibold text-gray-700 mb-2 font-staatliches">
                        Bienvenue sur RutaFem !
                    </h2>
                    <p className="text-gray-600 text-sm md:text-lg">
                        Crée ton compte pour accéder à tous les services
                    </p>
                </div>
                <div className="bg-[var(--dark-green)] rounded-xl">
                    <div className="rounded-2xl shadow-xl p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-5 w-5 text-red-400"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    className={`flex flex-col gap-4 bg-white rounded-3xl p-6 md:p-10 max-w-md mx-auto cursor-pointer transition-all duration-200 min-h-[400px] sm:min-h-0 ${
                                        selectedRole === 'driver'
                                            ? 'border-8 border-[var(--pink)]'
                                            : 'border-8 border-white'
                                    }`}
                                    onClick={() => setSelectedRole('driver')}
                                >
                                    <div className="flex-1 flex items-center justify-center">
                                        <Image
                                            src={BlueMoovingCar}
                                            alt="Dessin d'une voiture bleue qui avance"
                                            width={240}
                                            height={240}
                                            className="object-contain"
                                        />
                                    </div>
                                    <p className="text-center text-2xl font-bold">
                                        Profil conductrice
                                    </p>
                                    <p className="text-start text-base text-gray-600">
                                        Ne roule plus seule : partage ton trajet avec d&apos;autres
                                        femmes et profite d&apos;une bonne compagnie tout en
                                        réduisant tes frais de voyage !
                                    </p>
                                </div>
                                <div
                                    className={`flex flex-col gap-4 bg-white rounded-3xl p-6 md:p-10 max-w-md mx-auto cursor-pointer transition-all duration-200 min-h-[400px] sm:min-h-0 ${
                                        selectedRole === 'passenger'
                                            ? 'border-8 border-[var(--pink)]'
                                            : 'border-8 border-white'
                                    }`}
                                    onClick={() => setSelectedRole('passenger')}
                                >
                                    <div className="flex-1 flex items-center justify-center">
                                        <Image
                                            src={TravelerPassenger}
                                            alt="Dessin d'une femme accompagnée de sa valise pleine de stickers de voyage"
                                            width={200}
                                            height={200}
                                            className="object-contain"
                                        />
                                    </div>
                                    <p className="text-center text-2xl font-bold">
                                        Profil voyageuse
                                    </p>
                                    <p className="text-start text-base text-gray-600">
                                        Voyage où tu veux, l&apos;esprit léger et à petit prix. Avec
                                        RutaFem, chaque trajet est sûr et solidaire. 🌸
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="firstName"
                                        className="block text-sm font-medium text-white mb-2"
                                    >
                                        Prénom
                                    </label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        placeholder="ex: Mélina"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg bg-white transition-colors duration-200"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="lastName"
                                        className="block text-sm font-medium text-white mb-2"
                                    >
                                        Nom
                                    </label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        placeholder="ex: Dupont"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg bg-white transition-colors duration-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-white mb-2"
                                >
                                    Adresse email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg
                                            className="h-5 w-5 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                            />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="votre@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white transition-colors duration-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="phoneNumber"
                                    className="block text-sm font-medium text-white mb-2"
                                >
                                    Numéro de téléphone
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg
                                            className="h-5 w-5 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            />
                                        </svg>
                                    </div>
                                    <input
                                        id="phoneNumber"
                                        type="tel"
                                        placeholder="06 12 34 56 78"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white transition-colors duration-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-white mb-2"
                                >
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg
                                            className="h-5 w-5 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="**********"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-white transition-colors duration-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <svg
                                                className="h-5 w-5 text-gray-400 hover:text-gray-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="h-5 w-5 text-gray-400 hover:text-gray-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-gray-300">Minimum 6 caractères</p>
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-white mb-2"
                                >
                                    Confirmer le mot de passe
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg
                                            className="h-5 w-5 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="********"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-white transition-colors duration-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showConfirmPassword ? (
                                            <svg
                                                className="h-5 w-5 text-gray-400 hover:text-gray-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="h-5 w-5 text-gray-400 hover:text-gray-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-start gap-3 p-4 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="acceptTerms"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-900 rounded"
                                    />
                                    <label
                                        htmlFor="acceptTerms"
                                        className="text-sm text-white leading-relaxed"
                                    >
                                        J&apos;accepte les{' '}
                                        <a
                                            href="/conditions-generales-de-vente"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[var(--pink)] hover:text-[var(--pink)] underline"
                                        >
                                            conditions générales de vente
                                        </a>{' '}
                                        et la{' '}
                                        <a
                                            href="/politique-de-confidentialite"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[var(--pink)] hover:text-[var(--pink)] underline"
                                        >
                                            politique de confidentialité
                                        </a>
                                        . J&apos;autorise le traitement de mes données personnelles
                                        pour la création de mon compte et l&apos;utilisation de la
                                        plateforme de covoiturage.
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-center">
                                <button
                                    type="submit"
                                    disabled={loading || !acceptTerms}
                                    className="py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium bg-[var(--pink)] opacity-90 hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Création du compte...
                                        </div>
                                    ) : (
                                        'Créer mon compte'
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="text-center">
                            <p className="text-sm text-white">
                                Déjà un compte ?{' '}
                                <Link
                                    href="/auth/login"
                                    className="font-medium text-[var(--pink)] hover:text-[var(--pink)] opacity-90 hover:opacity-100 transition-colors duration-200"
                                >
                                    Se connecter
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
